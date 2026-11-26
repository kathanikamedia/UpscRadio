import test from "node:test";
import assert from "node:assert/strict";
import {bundleComparison,checkoutHref} from "../lib/course-pricing";
import {checkoutReady} from "../lib/payment-policy";
process.env.DATABASE_URL="file::memory:";
const {execute,content,closeDatabase}=await import("../lib/db");
const {materialAccess,ownsProduct}=await import("../lib/material-access");
const {checkoutProduct}=await import("../lib/checkout-product");
const {fulfill}=await import("../lib/payments");
test.after(()=>closeDatabase());

test("bundle comparison uses real material totals and never advertises negative savings",()=>{
 assert.deepEqual(bundleComparison(19900,[{price:9900},{price:9900},{price:9900}]),{individualTotal:29700,savings:9800,count:3});
 assert.equal(bundleComparison(19900,[{price:9900},{price:9900}]).savings,0);
 assert.equal(bundleComparison(19900,[]).savings,0);
 assert.equal(bundleComparison(19900,[{price:9900,owned:true},{price:9900},{price:9900}]).savings,0);
 assert.equal(checkoutHref("resource","notes"),"/checkout/notes/?kind=resource");
});
test("a material purchase unlocks one PDF; bundle ownership unlocks its included PDFs only",async()=>{
 for(const [id,kind,slug,extra] of [
  [100,"course","foundation",{price_paise:19900,pricing_model:"bundle",delivery:"native"}],
  [101,"resource","foundation",{price_paise:9900,access:"paid",course_slug:"foundation",storage_key:"study-materials/one.pdf"}],
  [102,"resource","notes-two",{price_paise:9900,access:"paid",course_slug:"foundation",storage_key:"study-materials/two.pdf"}],
  [103,"resource","other-course-notes",{price_paise:9900,access:"paid",course_slug:"other",storage_key:"study-materials/other.pdf"}],
  [104,"resource","free-notes",{price_paise:0,course_slug:"foundation",storage_key:"study-materials/free.pdf"}],
  [200,"course","empty-bundle",{price_paise:19900,pricing_model:"bundle",delivery:"native"}],
 ] as const)await execute({sql:"INSERT INTO content(id,kind,slug,title,published,extra) VALUES (?,?,?,?,1,?)",args:[id,kind,slug,slug,JSON.stringify(extra)]});
 const first=(await content("resource","foundation"))!,second=(await content("resource","notes-two"))!,other=(await content("resource","other-course-notes"))!;
 await execute("INSERT INTO payments(id,clerk_id,course_id,amount,status) VALUES ('individual','one-pdf-owner',101,9900,'Paid'),('bundle','bundle-owner',100,19900,'Paid')");
 assert.equal((await materialAccess("one-pdf-owner",first)).individual,true);
 assert.equal((await materialAccess("one-pdf-owner",second)).allowed,false);
 assert.equal(await ownsProduct("one-pdf-owner",100),false);
 assert.equal((await materialAccess("bundle-owner",first)).bundle,true);
 assert.equal((await materialAccess("bundle-owner",second)).allowed,true);
 assert.equal((await materialAccess("bundle-owner",other)).allowed,false);
 assert.equal((await materialAccess("stranger",first)).allowed,false);
 assert.equal((await materialAccess(null,first)).allowed,false);
 assert.equal((await materialAccess(null,(await content("resource","free-notes"))!)).allowed,true);
 const bundle=(await checkoutProduct("course","foundation"))!;
 assert.equal(bundle.id,100);assert.equal(bundle.extra.bundle_material_count,3);
 assert.equal((await checkoutProduct("resource","foundation"))?.id,101);
 assert.equal(checkoutReady(bundle,{configured:true,testMode:true}),true);
 assert.equal(checkoutReady((await checkoutProduct("course","empty-bundle"))!,{configured:true,testMode:true}),false);
 assert.equal(checkoutReady(first,{configured:true,testMode:true}),true);
 await fulfill("individual");assert.equal((await execute("SELECT fulfilled FROM payments WHERE id='individual'")).rows[0].fulfilled,1);
});
test("refunding a bundle preserves separate material purchases and revokes the other included files",async()=>{
 await execute("INSERT INTO payments(id,clerk_id,course_id,amount,status) VALUES ('separate-copy','bundle-owner',101,9900,'Paid')");
 await execute("UPDATE payments SET status='Refunded' WHERE id='bundle'");
 const first=(await content("resource","foundation"))!,second=(await content("resource","notes-two"))!;
 const access=await materialAccess("bundle-owner",first);
 assert.equal(access.allowed,true);assert.equal(access.individual,true);assert.equal(access.bundle,false);
 assert.equal((await materialAccess("bundle-owner",second)).allowed,false);
 assert.equal((await materialAccess("one-pdf-owner",first)).allowed,true);
});
