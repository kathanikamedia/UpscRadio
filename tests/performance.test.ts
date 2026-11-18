import test from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL="file::memory:";
const {execute,closeDatabase,homePreviews}=await import("../lib/db");
const {cachedSource}=await import("../lib/source-cache");
test.after(()=>closeDatabase());
test("homepage previews limit results and exclude full article bodies",async()=>{
 for(const [slug,category] of [["course-one","Prelims"],["course-two","GS"],["course-three","GS"],["hidden-test","Test Series"]])await execute({sql:"INSERT INTO content(kind,slug,title,body,category,published) VALUES ('course',?,?, 'large article body',?,1)",args:[slug,slug,category]});
 const previews=await homePreviews("course",2);
 assert.equal(previews.length,2);assert.deepEqual(previews.map(c=>c.slug),["course-three","course-two"]);assert.ok(previews.every(c=>c.body===""));
});
test("source cache deduplicates fetches, serves warm memory and refreshes after ten minutes",async()=>{
 const originalFetch=globalThis.fetch,originalNow=Date.now;let now=originalNow(),calls=0;
 Date.now=()=>now;
 globalThis.fetch=async()=>{calls++;return new Response("official content");};
 const load=()=>cachedSource<{checkedAt:string;value:string}>("cache-performance","https://www.upsc.gov.in/",html=>({value:html}));
 try{
  const [first,concurrent]=await Promise.all([load(),load()]);assert.deepEqual(first,concurrent);assert.equal(calls,1);
  await execute({sql:"DELETE FROM source_cache WHERE key=?",args:["cache-performance"]});
  assert.deepEqual(await load(),first);assert.equal(calls,1);
  now+=600001;await load();assert.equal(calls,2);
 }finally{globalThis.fetch=originalFetch;Date.now=originalNow;}
});
