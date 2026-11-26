import {randomUUID} from "node:crypto";
import {execute,contents,rateLimit} from "./db";
import {bundleAvailability} from "./checkout-product";
import {checkoutReady,paymentMode} from "./payment-policy";
import {razorpay,paymentsConfigured,fulfill,type GatewayPayment} from "./payments";
import {moodleConfigured} from "./moodle";
import {ownsProduct} from "./material-access";
import {FREE_MOCK_SLUG} from "./mock-tests";
import {findCoupon,discountFor,allocate,reserveRedemption,confirmRedemption} from "./coupons";
export type CartLine={course_id:number;slug:string;title:string;price:number;amount:number;mock:boolean};
export async function cartQuote(user:string,slugs:string[],couponCode?:unknown){
 const wanted=new Set(slugs.filter(slug=>/^[a-z0-9-]+$/.test(slug)).slice(0,20));
 const options={configured:paymentsConfigured,testMode:paymentMode()==="test",moodle:moodleConfigured};
 const courses=(await bundleAvailability(await contents("course"))).filter(course=>wanted.has(course.slug)&&course.slug!==FREE_MOCK_SLUG&&checkoutReady(course,options));
 const owned=await Promise.all(courses.map(course=>ownsProduct(user,course.id)));
 const items=courses.filter((_,index)=>!owned[index]);
 const prices=items.map(course=>Number(course.extra.price_paise));
 const subtotal=prices.reduce((sum,price)=>sum+price,0);
 const {coupon,error}=await findCoupon(couponCode);
 const total=subtotal-discountFor(subtotal,coupon);
 const amounts=allocate(prices,total);
 const lines:CartLine[]=items.map((course,index)=>({course_id:course.id,slug:course.slug,title:course.title,price:prices[index],amount:amounts[index],mock:course.category==="Test Series"}));
 return {lines,subtotal,total,coupon,couponError:error,skipped:courses.length-items.length};
}
export async function createCartOrder(user:string,slugs:string[],couponCode?:unknown){
 const quote=await cartQuote(user,slugs,couponCode);
 if(quote.couponError)return {error:quote.couponError};
 if(!quote.lines.length)return {error:"None of the selected items can be purchased right now."};
 await rateLimit("checkout:"+user,8);
 const id=randomUUID();
 await execute({sql:"INSERT INTO cart_orders(id,clerk_id,amount,subtotal,coupon,items,status) VALUES (?,?,?,?,?,?,'Creating')",args:[id,user,quote.total,quote.subtotal,quote.coupon?.code??null,JSON.stringify(quote.lines)]});
 const order=await razorpay<{id:string}>("orders",{amount:quote.total,currency:"INR",receipt:("c"+id.replaceAll("-","")).slice(0,40)});
 await execute({sql:"UPDATE cart_orders SET order_id=?,status='Pending' WHERE id=?",args:[order.id,id]});
 if(quote.coupon)await reserveRedemption(order.id,quote.coupon.code,user);
 return {id};
}
export async function cartOrder(user:string,id:string){
 const row=(await execute({sql:"SELECT * FROM cart_orders WHERE id=? AND clerk_id=?",args:[id,user]})).rows[0];
 return row?{id:String(row.id),status:String(row.status),order_id:String(row.order_id??""),amount:Number(row.amount),subtotal:Number(row.subtotal),coupon:row.coupon?String(row.coupon):null,items:JSON.parse(String(row.items)) as CartLine[]}:undefined;
}
export async function cartOrderByGateway(orderId:string){return (await execute({sql:"SELECT id FROM cart_orders WHERE order_id=?",args:[orderId]})).rows[0];}
/** Marks a whole-cart order paid and grants each item through the existing per-item payment records. */
export async function captureCart(payment:GatewayPayment){
 const row=(await execute({sql:"SELECT * FROM cart_orders WHERE order_id=?",args:[payment.order_id]})).rows[0];
 if(!row||!["Pending","Paid"].includes(String(row.status))||payment.currency!=="INR"||payment.status!=="captured"||Number(row.amount)!==payment.amount)return false;
 if(row.status==="Paid"&&row.payment_id!==payment.id)return false;
 const result=await execute({sql:"UPDATE cart_orders SET status='Paid',payment_id=? WHERE id=? AND status IN ('Pending','Paid') AND (payment_id IS NULL OR payment_id=?)",args:[payment.id,String(row.id),payment.id]});
 if(result.rowsAffected!==1)return false;
 const clerk=String(row.clerk_id);
 for(const line of JSON.parse(String(row.items)) as CartLine[]){
  // A single-item checkout left open for the same product must not block this grant.
  await execute({sql:"UPDATE payments SET status='Abandoned' WHERE clerk_id=? AND course_id=? AND status IN ('Creating','Pending')",args:[clerk,line.course_id]});
  const grant=`${row.id}:${line.course_id}`;
  await execute({sql:"INSERT OR IGNORE INTO payments(id,clerk_id,course_id,amount,status,captured) VALUES (?,?,?,?,'Paid',CURRENT_TIMESTAMP)",args:[grant,clerk,line.course_id,line.amount]});
  await fulfill(grant).catch(()=>undefined);
 }
 await confirmRedemption(payment.order_id);
 return true;
}
export async function refundCart(payment:GatewayPayment&{amount_refunded?:number}){
 if(payment.currency!=="INR"||Number(payment.amount_refunded)<payment.amount)return false;
 const row=(await execute({sql:"UPDATE cart_orders SET status='Refunded' WHERE order_id=? AND amount=? AND status IN ('Paid','Refunded') AND (payment_id IS NULL OR payment_id=?) RETURNING id",args:[payment.order_id,payment.amount,payment.id]})).rows[0];
 if(!row)return false;
 await execute({sql:"UPDATE payments SET status='Refunded',fulfilled=0 WHERE id LIKE ? AND status='Paid'",args:[String(row.id)+":%"]});
 return true;
}
