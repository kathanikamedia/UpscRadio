import {validSignature} from "@/lib/signature";
import {capture,fulfill,refundPayment} from "@/lib/payments";
import {execute} from "@/lib/db";
import {BodyTooLarge,readLimitedBody} from "@/lib/request-body";
export async function POST(request:Request) {
 let body:string;
 try{body=await readLimitedBody(request,65536);}catch(error){return new Response("Invalid request",{status:error instanceof BodyTooLarge?413:400});}
 const secret=process.env.RAZORPAY_WEBHOOK_SECRET;
 if(!secret||!validSignature(secret,body,request.headers.get("x-razorpay-signature")||""))return new Response("Invalid signature",{status:403});
 try {
  const event=JSON.parse(body);
  if(event.event==="payment.captured"){
   const payment=event.payload?.payment?.entity;
   const row=payment?.order_id?(await execute({sql:"SELECT id FROM payments WHERE order_id=?",args:[payment.order_id]})).rows[0]:undefined;
   // Payments for orders this site never created are acknowledged so Razorpay stops retrying them.
   if(!row)return new Response(null,{status:204});
   if(!await capture(payment))return new Response("Unmatched payment",{status:409});
   await fulfill(String(row.id));
  }
  if(event.event==="refund.processed"){
   const refund=event.payload?.refund?.entity,payment=event.payload?.payment?.entity;
   if(!refund||refund.status!=="processed"||!payment||refund.payment_id!==payment.id)return new Response("Invalid refund payload",{status:400});
   await refundPayment(payment);
  }
  return new Response(null,{status:204});
 }catch{return new Response("Retry later",{status:503});}
}
