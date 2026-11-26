import test from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL="file::memory:";
const {execute,closeDatabase}=await import("../lib/db");
const {discountFor,allocate,findCoupon,normaliseCode}=await import("../lib/coupons");
const {captureCart,refundCart}=await import("../lib/cart-orders");
const {capture}=await import("../lib/payments");
const {ownsProduct}=await import("../lib/material-access");
test.after(()=>closeDatabase());

test("coupon discounts never take a paid item below ₹1 and split totals exactly",()=>{
 assert.equal(discountFor(9900,{code:"A",percent_off:20,amount_off:0}),1980);
 assert.equal(discountFor(9900,{code:"A",percent_off:0,amount_off:50000}),9800);
 assert.equal(discountFor(100,{code:"A",percent_off:50,amount_off:0}),0);
 assert.equal(discountFor(9900,null),0);
 const parts=allocate([9900,19900,100],23920);
 assert.equal(parts.reduce((a,b)=>a+b,0),23920);
 assert.equal(normaliseCode(" launch-20 "),"LAUNCH-20");
 assert.equal(normaliseCode("x"),"");
});
test("coupons respect active flag, expiry and maximum uses",async()=>{
 await execute("INSERT INTO coupons(code,percent_off,active,expires,max_uses,used) VALUES ('OK10',10,1,NULL,NULL,0),('OFF',10,0,NULL,NULL,0),('OLD',10,1,'2000-01-01T00:00:00Z',NULL,0),('FULL',10,1,NULL,2,2)");
 assert.equal((await findCoupon("ok10")).coupon?.percent_off,10);
 assert.ok((await findCoupon("OFF")).error);assert.ok((await findCoupon("OLD")).error);assert.ok((await findCoupon("FULL")).error);assert.ok((await findCoupon("NOPE")).error);
 assert.equal((await findCoupon("")).coupon,null);assert.equal((await findCoupon("")).error,undefined);
});
test("a paid cart order grants every item once, counts the coupon, and a full refund revokes it",async()=>{
 for(const [id,slug] of [[700,"mock-a"],[701,"mock-b"]] as const)await execute({sql:"INSERT INTO content(id,kind,slug,title,category,published,extra) VALUES (?,'course',?,?,'Test Series',1,?)",args:[id,slug,slug,JSON.stringify({price_paise:9900,question_bank:slug})]});
 await execute("INSERT INTO payments(id,clerk_id,course_id,amount,order_id,status) VALUES ('stale','buyer',700,9900,'order_single','Pending')");
 const items=[{course_id:700,slug:"mock-a",title:"A",price:9900,amount:8910,mock:true},{course_id:701,slug:"mock-b",title:"B",price:9900,amount:8910,mock:true}];
 await execute({sql:"INSERT INTO cart_orders(id,clerk_id,order_id,amount,subtotal,coupon,items,status) VALUES ('cart1','buyer','order_cart',17820,19800,'OK10',?,'Pending')",args:[JSON.stringify(items)]});
 await execute("INSERT INTO coupon_redemptions(order_id,code,clerk_id) VALUES ('order_cart','OK10','buyer')");
 const payment={id:"pay_cart",order_id:"order_cart",amount:17820,currency:"INR",status:"captured"};
 assert.equal(await captureCart({...payment,amount:100}),false);
 assert.equal(await captureCart(payment),true);
 assert.equal(await captureCart(payment),true);
 assert.equal(await captureCart({...payment,id:"pay_other"}),false);
 assert.equal(await ownsProduct("buyer",700),true);assert.equal(await ownsProduct("buyer",701),true);
 assert.equal(Number((await execute("SELECT used FROM coupons WHERE code='OK10'")).rows[0].used),1);
 assert.equal(String((await execute("SELECT status FROM payments WHERE id='stale'")).rows[0].status),"Abandoned");
 assert.equal(await refundCart({...payment,amount_refunded:100}),false);
 assert.equal(await refundCart({...payment,amount_refunded:17820}),true);
 assert.equal(await ownsProduct("buyer",700),false);
});
test("an order replaced by a coupon re-quote is still honoured if paid from an open window",async()=>{
 await execute({sql:"INSERT INTO content(id,kind,slug,title,category,published,extra) VALUES (710,'course','mock-c','C','Test Series',1,?)",args:[JSON.stringify({price_paise:9900,question_bank:"mock-c"})]});
 await execute("INSERT INTO payments(id,clerk_id,course_id,amount,order_id,status) VALUES ('old','u2',710,9900,'order_old','Abandoned'),('new','u2',710,8910,'order_new','Pending')");
 assert.equal(await capture({id:"pay_old",order_id:"order_old",amount:9900,currency:"INR",status:"captured"}),true);
 assert.equal(await ownsProduct("u2",710),true);
 assert.equal(String((await execute("SELECT status FROM payments WHERE id='new'")).rows[0].status),"Abandoned");
});
test("results percentile stays hidden until five learners have taken a test",async()=>{
 const {percentileOf}=await import("../lib/results");
 assert.equal(percentileOf(80,[10,20,30,40]),null);
 assert.equal(percentileOf(80,[10,20,30,40,80]),90);
 assert.equal(percentileOf(5,[10,20,30,40,50]),0);
});
