import {identity} from "@/lib/auth";
import {execute} from "@/lib/db";
import {validSignature} from "@/lib/signature";
import {capture,fulfill,razorpay,type GatewayPayment} from "@/lib/payments";
export async function POST(request:Request) {
 const origin=request.headers.get("origin");if(origin!==new URL(request.url).origin)return new Response("Invalid origin",{status:403});
 const user=await identity();if(!user)return new Response("Sign in",{status:401});
 const data=await request.json().catch(()=>null);
 if(!data||typeof data.receipt!=="string"||!/^pay_[A-Za-z0-9]+$/.test(data.razorpay_payment_id))return new Response("Invalid request",{status:400});
 const payment=(await execute({sql:"SELECT * FROM payments WHERE id=? AND clerk_id=?",args:[data.receipt,user]})).rows[0];
 if(!payment?.order_id||!process.env.RAZORPAY_KEY_SECRET||!validSignature(process.env.RAZORPAY_KEY_SECRET,payment.order_id+"|"+data.razorpay_payment_id,String(data.razorpay_signature)))return new Response("Invalid signature",{status:400});
 try {
  const event=await razorpay<GatewayPayment>("payments/"+data.razorpay_payment_id);
  if(!await capture(event))return new Response("Confirmation pending",{status:409});
  await fulfill(String(payment.id)).catch(()=>undefined);
  return Response.json({confirmed:true});
 }catch{return new Response("Confirmation pending",{status:503});}
}
