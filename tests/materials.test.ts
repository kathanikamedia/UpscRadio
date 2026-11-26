import test from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL="file::memory:";
const {currentAffairsDrafts,requiresPurchase}=await import("../lib/study-material-drafts");
const {execute,content,closeDatabase}=await import("../lib/db");
const {GET}=await import("../app/downloads/[slug]/route");
test("material metadata keeps language, partial-year coverage and temporary prices explicit",()=>{
 assert.deepEqual(currentAffairsDrafts.map(item=>item.extra.language),["English","Telugu"]);
 assert.deepEqual(currentAffairsDrafts.map(item=>item.extra.pages),[242,309]);
 for(const item of currentAffairsDrafts){assert.ok(item.summary.length<=250);assert.equal(item.extra.price_paise,9900);assert.equal(item.extra.purchase_enabled,false);assert.equal(item.extra.coverage_end,"2026-11-08");assert.equal(item.extra.question_count,674);assert.equal(requiresPurchase(item.extra),true);}
});
test("unpublished drafts are hidden and even published paid materials cannot use the free download route",async()=>{
 for(const item of currentAffairsDrafts)await execute({sql:"INSERT INTO content(kind,slug,title,published,extra) VALUES ('resource',?,?,0,?)",args:[item.slug,item.title,JSON.stringify(item.extra)]});
 const slug=currentAffairsDrafts[0].slug;
 assert.equal(await content("resource",slug),undefined);
 assert.equal((await GET(new Request("https://example.com/downloads/"+slug),{params:Promise.resolve({slug})})).status,404);
 await execute({sql:"UPDATE content SET published=1 WHERE slug=?",args:[slug]});
 const denied=await GET(new Request("https://example.com/downloads/"+slug),{params:Promise.resolve({slug})});
 assert.equal(denied.status,403);assert.equal(denied.headers.get("location"),null);assert.equal(denied.headers.get("cache-control"),"private, no-store");
 const browser=await GET(new Request("https://example.com/downloads/"+slug,{headers:{accept:"text/html"}}),{params:Promise.resolve({slug})});
 assert.equal(browser.status,307);assert.equal(browser.headers.get("location"),`https://example.com/purchase/${slug}/?kind=resource&locked=1`);
 assert.equal(requiresPurchase({}),false);assert.equal(requiresPurchase({price_paise:9900}),true);
});
test.after(()=>closeDatabase());
