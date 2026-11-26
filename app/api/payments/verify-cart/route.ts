import {identity} from "@/lib/auth";
import {execute,rateLimit} from "@/lib/db";
import {BodyTooLarge,readLimitedBody} from "@/lib/request-body";
import {z} from "zod";
import {validSignature} from "@/lib/signature";
import {razorpay,type GatewayPayment} from "@/lib/payments";
import {captureCart} from "@/lib/cart-orders";
export async function POST(request:Request){
 const origin=request.headers.get("origin");if(origin!==new URL(request.url).origin)return new Response("Invalid origin",{status:403});
 const user=await identity();if(!user)return new Response("Sign in",{status:401});
 let input:unknown;
 try{input=JSON.parse(await readLimitedBody(request,4096));}catch(error){return new Response("Invalid request",{status:error instanceof BodyTooLarge?413:400});}
 const parsed=z.object({receipt:z.uuid(),razorpay_payment_id:z.string().regex(/^pay_[A-Za-z0-9]+$/).max(100),razorpay_signature:z.string().regex(/^[a-fA-F0-9]{64}$/)}).safeParse(input);
 if(!parsed.success)return new Response("Invalid request",{status:400});
 const data=parsed.data;
 try{await rateLimit("payment-verify:"+user,40);}catch{return new Response("Try again later",{status:429});}
 const order=(await execute({sql:"SELECT * FROM cart_orders WHERE id=? AND clerk_id=?",args:[data.receipt,user]})).rows[0];
 if(!order?.order_id||!process.env.RAZORPAY_KEY_SECRET||!validSignature(process.env.RAZORPAY_KEY_SECRET,order.order_id+"|"+data.razorpay_payment_id,data.razorpay_signature))return new Response("Invalid signature",{status:400});
 try{
  const event=await razorpay<GatewayPayment>("payments/"+data.razorpay_payment_id);
  if(event.id!==data.razorpay_payment_id||event.order_id!==order.order_id)return new Response("Payment does not match this order",{status:409});
  if(!await captureCart(event))return new Response("Confirmation pending",{status:409});
  return Response.json({confirmed:true});
 }catch{return new Response("Confirmation pending",{status:503});}
}
