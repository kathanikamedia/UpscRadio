import test from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
process.env.DATABASE_URL="file::memory:";
const {execute,closeDatabase,rateLimit}=await import("../lib/db");
const {capture,fulfill,refundPayment}=await import("../lib/payments");
const {checkoutReady,paymentMode}=await import("../lib/payment-policy");
test("published mock test checkout needs no admin role and tolerates legacy preview flags in test mode",()=>{
 const item={published:true,category:"Test Series",extra:{price_paise:9900,question_bank:"mock-ready",purchase_enabled:false}};
 assert.equal(checkoutReady(item,{configured:true}),false);
 assert.equal(checkoutReady(item,{configured:true,testMode:true}),true);
 assert.equal(checkoutReady({...item,published:false},{configured:true,testMode:true}),false);
 assert.equal(checkoutReady({...item,extra:{...item.extra,demo:true}},{configured:true,testMode:true}),true);
 assert.equal(checkoutReady({...item,category:"Course",extra:{...item.extra,demo:true}},{configured:true,testMode:true}),false);
 assert.equal(checkoutReady({...item,extra:{...item.extra,demo:true,purchase_enabled:true}},{configured:true,testMode:false}),false);
 assert.equal(checkoutReady({...item,extra:{...item.extra,price_paise:100}},{configured:true,testMode:true}),true);
 assert.equal(checkoutReady({...item,extra:{...item.extra,purchase_enabled:true}},{configured:true}),true);
 assert.equal(paymentMode("rzp_test_example"),"test");assert.equal(paymentMode("rzp_live_example"),"live");assert.equal(paymentMode("invalid"),null);
});
test("captured native mock purchase fulfils without Moodle and full refund cannot be replayed as paid",async()=>{
 const receipt=randomUUID();
 await execute({sql:"INSERT INTO content(id,kind,slug,title,published,extra) VALUES (50,'course','native-mock','Mock',1,?)",args:[JSON.stringify({question_bank:"mock-ready"})]});
 await execute({sql:"INSERT INTO payments(id,clerk_id,course_id,amount,order_id,status) VALUES (?,'native-owner',50,9900,'order_native','Pending')",args:[receipt]});
 const payment={id:"pay_native",order_id:"order_native",amount:9900,currency:"INR",status:"captured"};
 assert.equal(await capture(payment),true);await fulfill(receipt);await fulfill(receipt);
 assert.equal((await execute({sql:"SELECT fulfilled FROM payments WHERE id=?",args:[receipt]})).rows[0].fulfilled,1);
 assert.equal(await refundPayment({...payment,amount_refunded:100}),false);
 assert.equal(await refundPayment({...payment,amount_refunded:9900}),true);
 assert.equal(await capture(payment),false);
 assert.equal((await execute({sql:"SELECT status FROM payments WHERE id=?",args:[receipt]})).rows[0].status,"Refunded");
 const late=randomUUID();await execute({sql:"INSERT INTO payments(id,clerk_id,course_id,amount,order_id,status) VALUES (?,'late-refund',50,9900,'order_late_refund','Pending')",args:[late]});
 const refunded={...payment,id:"pay_late_refund",order_id:"order_late_refund",amount_refunded:9900};
 assert.equal(await refundPayment(refunded),true);assert.equal(await capture(refunded),false);
});
const {validSignature}=await import("../lib/signature");
test("signed refund.processed webhooks revoke full refunds; created events do not",async()=>{
 const {POST}=await import("../app/api/payments/webhook/route");
 const previous=process.env.RAZORPAY_WEBHOOK_SECRET;process.env.RAZORPAY_WEBHOOK_SECRET="webhook-test-secret";
 const receipt=randomUUID();await execute({sql:"INSERT INTO payments(id,clerk_id,course_id,amount,order_id,payment_id,status) VALUES (?,'refund-webhook-owner',50,9900,'order_refund_hook','pay_refund_hook','Paid')",args:[receipt]});
 const send=async(event:string,status:string)=>{
  const body=JSON.stringify({event,payload:{refund:{entity:{payment_id:"pay_refund_hook",status}},payment:{entity:{id:"pay_refund_hook",order_id:"order_refund_hook",amount:9900,currency:"INR",status:"refunded",amount_refunded:9900}}}});
  const signature=createHmac("sha256","webhook-test-secret").update(body).digest("hex");
  return POST(new Request("https://example.com/api/payments/webhook/",{method:"POST",body,headers:{"x-razorpay-signature":signature}}));
 };
 try{
  assert.equal((await send("refund.created","pending")).status,204);
  assert.equal((await execute({sql:"SELECT status FROM payments WHERE id=?",args:[receipt]})).rows[0].status,"Paid");
  assert.equal((await send("refund.processed","pending")).status,400);
  assert.equal((await send("refund.processed","processed")).status,204);
  assert.equal((await execute({sql:"SELECT status FROM payments WHERE id=?",args:[receipt]})).rows[0].status,"Refunded");
 }finally{if(previous===undefined)delete process.env.RAZORPAY_WEBHOOK_SECRET;else process.env.RAZORPAY_WEBHOOK_SECRET=previous;}
});
test("webhook signatures reject altered bodies and malformed signatures",()=>{
 const signature=createHmac("sha256","secret").update("original").digest("hex");
 assert.equal(validSignature("secret","original",signature),true);
 assert.equal(validSignature("secret","altered",signature),false);
 assert.equal(validSignature("secret","original","bad"),false);
});
test("payment capture validates amount, currency and replay identity",async()=>{
 const receipt=randomUUID();
 await execute({sql:"INSERT INTO payments(id,clerk_id,course_id,amount,order_id,status) VALUES (?,'user-one',1,50000,'order_one','Pending')",args:[receipt]});
 const event={id:"pay_one",order_id:"order_one",amount:50000,currency:"INR",status:"captured"};
 assert.equal(await capture({...event,amount:1}),false);
 assert.equal(await capture({...event,currency:"USD"}),false);
 assert.equal(await capture({...event,status:"authorized"}),false);
 assert.equal(await capture(event),true);
 assert.equal(await capture(event),true);
 assert.equal(await capture({...event,id:"pay_two"}),false);
 const result=await execute({sql:"SELECT * FROM payments WHERE id=?",args:[receipt]});
 assert.equal(result.rows[0].status,"Paid");
 assert.equal(result.rows[0].payment_id,"pay_one");
});
test("only one pending checkout can exist for the same student and course",async()=>{
 const result=await execute({sql:"INSERT OR IGNORE INTO payments(id,clerk_id,course_id,amount,status) VALUES (?,'user-one',1,50000,'Creating') RETURNING id",args:[randomUUID()]});
 assert.equal(result.rows.length,0);
});
test("shared rate limits enforce the configured maximum",async()=>{
 await rateLimit("test",2);await rateLimit("test",2);
 await assert.rejects(rateLimit("test",2),/Too many/);
});
test("failed Moodle fulfilment preserves paid state for retry",async()=>{
 await execute({sql:"INSERT INTO content(id,kind,slug,title,extra) VALUES (1,'course','polity','Polity',?)",args:[JSON.stringify({moodle_course_id:3})]});
 await assert.rejects(fulfill((await execute("SELECT id FROM payments WHERE order_id='order_one'")).rows[0].id as string),/pending/);
 const result=await execute("SELECT status,fulfilled FROM payments WHERE order_id='order_one'");
 assert.equal(result.rows[0].status,"Paid");
 assert.equal(result.rows[0].fulfilled,0);
});
test.after(()=>closeDatabase());

test("concurrent callbacks cannot both claim the same order with different payment IDs", async () => {
  const receipt = randomUUID();
  await execute({
    sql: "INSERT INTO payments(id,clerk_id,course_id,amount,order_id,status) VALUES (?,'user-race',2,50000,'order_race','Pending')",
    args: [receipt],
  });
  const payment = { id: "pay_race_one", order_id: "order_race", amount: 50000, currency: "INR", status: "captured" };
  const results = await Promise.all([capture(payment), capture({ ...payment, id: "pay_race_two" })]);
  assert.equal(results.filter(Boolean).length, 1);
});
