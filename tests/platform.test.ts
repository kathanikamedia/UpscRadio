import test from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
process.env.DATABASE_URL="file::memory:";
const {execute,db,rateLimit}=await import("../lib/db");
const {capture,fulfill}=await import("../lib/payments");
const {validSignature}=await import("../lib/signature");
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
 await assert.rejects(fulfill((await execute("SELECT id FROM payments LIMIT 1")).rows[0].id as string),/pending/);
 const result=await execute("SELECT status,fulfilled FROM payments LIMIT 1");
 assert.equal(result.rows[0].status,"Paid");
 assert.equal(result.rows[0].fulfilled,0);
});
test.after(()=>db.close());
