import { execute } from "./db";
import { moodle } from "./moodle";
import {paymentMode} from "./payment-policy";
import {confirmRedemption} from "./coupons";
export const paymentsConfigured=Boolean(paymentMode()&&process.env.RAZORPAY_KEY_SECRET&&process.env.RAZORPAY_WEBHOOK_SECRET);
export async function razorpay<T>(path:string,data?:unknown):Promise<T> {
 if(!paymentsConfigured)throw new Error("Checkout is awaiting activation.");
 const r=await fetch("https://api.razorpay.com/v1/"+path,{
  method:data?"POST":"GET",headers:{Authorization:"Basic "+Buffer.from(process.env.RAZORPAY_KEY_ID+":"+process.env.RAZORPAY_KEY_SECRET).toString("base64"),"Content-Type":"application/json"},
  ...(data?{body:JSON.stringify(data)}:{}),cache:"no-store",signal:AbortSignal.timeout(15000),
 });
 if(!r.ok)throw new Error("Payment provider could not complete the request.");
 return r.json();
}
export type GatewayPayment={id:string;order_id:string;amount:number;currency:string;status:string};
export async function capture(payment:GatewayPayment) {
 const row=(await execute({sql:"SELECT * FROM payments WHERE order_id=?",args:[payment.order_id]})).rows[0];
 if(!row||!["Pending","Paid","Abandoned"].includes(String(row.status))||payment.currency!=="INR"||payment.status!=="captured"||Number(row.amount)!==payment.amount)return false;
 if(row.status==="Paid"&&row.payment_id!==payment.id)return false;
 // An order replaced by a coupon re-quote can still be paid from a window left open: honour it.
 if(row.status==="Abandoned")await execute({sql:"UPDATE payments SET status='Abandoned' WHERE clerk_id=? AND course_id=? AND id!=? AND status IN ('Creating','Pending')",args:[String(row.clerk_id),Number(row.course_id),String(row.id)]});
 const result = await execute({sql:"UPDATE payments SET status='Paid',payment_id=?,captured=COALESCE(captured,CURRENT_TIMESTAMP) WHERE id=? AND status IN ('Pending','Paid','Abandoned') AND (payment_id IS NULL OR payment_id=?)",args:[payment.id,String(row.id),payment.id]}).catch(()=>({rowsAffected:0}));
 if(result.rowsAffected!==1)return false;
 await confirmRedemption(payment.order_id);
 return true;
}
export async function refundPayment(payment:GatewayPayment&{amount_refunded?:number}){
 if(payment.currency!=="INR"||!Number.isSafeInteger(payment.amount_refunded)||Number(payment.amount_refunded)<payment.amount)return false;
 const result=await execute({sql:"UPDATE payments SET status='Refunded',payment_id=?,fulfilled=0 WHERE order_id=? AND (payment_id IS NULL OR payment_id=?) AND amount=? AND status IN ('Pending','Paid','Refunded')",args:[payment.id,payment.order_id,payment.id,payment.amount]});
 return result.rowsAffected===1;
}
export async function fulfill(id:string) {
 const row=(await execute({sql:"SELECT p.*,c.extra,c.kind AS product_kind,i.moodle_id FROM payments p JOIN content c ON c.id=p.course_id LEFT JOIN identities i ON i.clerk_id=p.clerk_id WHERE p.id=? AND status='Paid'",args:[id]})).rows[0];
 if(!row)throw new Error("Payment was not confirmed.");
 if(row.fulfilled)return;
 const extra=JSON.parse(String(row.extra));
 if(extra.question_bank||extra.delivery==="native"||(row.product_kind==="resource"&&extra.storage_key)){
  await execute({sql:"UPDATE payments SET fulfilled=1 WHERE id=? AND status='Paid'",args:[id]});return;
 }
 const courseId=Number(extra.moodle_course_id), userId=Number(row.moodle_id);
 if(!courseId||!userId)throw new Error("Course activation is pending.");
 await moodle("enrol_manual_enrol_users",{"enrolments[0][roleid]":5,"enrolments[0][userid]":userId,"enrolments[0][courseid]":courseId});
 await execute({sql:"UPDATE payments SET fulfilled=1 WHERE id=?",args:[id]});
}
