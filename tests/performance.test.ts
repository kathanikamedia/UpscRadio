import test from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL="file::memory:";
const {execute,closeDatabase,homePreviews,catalogueListing}=await import("../lib/db");
const {cachedSource,sourceRefreshFinished}=await import("../lib/source-cache");
test.after(()=>closeDatabase());
test("homepage previews limit results and exclude full article bodies",async()=>{
 for(const [slug,category] of [["course-one","Prelims"],["course-two","GS"],["course-three","GS"],["hidden-test","Test Series"]])await execute({sql:"INSERT INTO content(kind,slug,title,body,category,published) VALUES ('course',?,?, 'large article body',?,1)",args:[slug,slug,category]});
 const previews=await homePreviews("course",2);
 assert.equal(previews.length,2);assert.deepEqual(previews.map(c=>c.slug),["course-three","course-two"]);assert.ok(previews.every(c=>c.body===""));
});
test("published catalogue omits full bodies and unpublished records",async()=>{
 await execute({sql:"INSERT INTO content(kind,slug,title,body,published) VALUES ('resource','public-resource','Public',?,1),('resource','private-resource','Private',?,0)",args:["large body".repeat(10000),"private"]});
 const rows=await catalogueListing("resource");
 assert.deepEqual(rows.map(row=>row.slug),["public-resource"]);
 assert.equal(rows[0].body,"");
});

test("expired feeds return the last listing without waiting for a slow refresh",async()=>{
 const key="slow-source-swr",before=new Date(Date.now()-600001).toISOString();
 await execute({sql:"INSERT INTO source_cache(key,payload,checked,retry_after) VALUES (?,?,?,0)",args:[key,JSON.stringify({value:"previous",checkedAt:before}),Date.parse(before)]});
 const originalFetch=globalThis.fetch;
 let scheduled:(()=>Promise<void>)|undefined,calls=0;
 let release!:(value:Response)=>void;
 globalThis.fetch=()=>{calls++;return new Promise<Response>(resolve=>{release=resolve;});};
 const load=()=>cachedSource<{checkedAt:string;value:string;stale?:boolean}>(key,"https://www.upsc.gov.in/",value=>({value}),work=>{scheduled=work;});
 try{
  const result=await load();assert.equal(result?.value,"previous");assert.equal(result?.stale,true);assert.equal(calls,0);
  const work=scheduled!();assert.equal(calls,1);
  assert.equal((await load())?.value,"previous");assert.equal(calls,1);
  release(new Response("updated"));await work;await sourceRefreshFinished(key);
  const updated=await load();assert.equal(updated?.value,"updated");assert.equal(updated?.stale,undefined);
 }finally{globalThis.fetch=originalFetch;}
});

test("failed refresh preserves the previous listing and backs off retry",async()=>{
 const key="failing-source-swr",checked=Date.now()-600001;
 await execute({sql:"INSERT INTO source_cache(key,payload,checked,retry_after) VALUES (?,?,?,0)",args:[key,JSON.stringify({value:"safe",checkedAt:new Date(checked).toISOString()}),checked]});
 const originalFetch=globalThis.fetch;let scheduled:(()=>Promise<void>)|undefined;
 globalThis.fetch=async()=>new Response("unavailable",{status:503});
 try{
  assert.equal((await cachedSource<{checkedAt:string;value:string;stale?:boolean}>(key,"https://www.upsc.gov.in/",html=>({value:html}),work=>{scheduled=work;}))?.stale,true);
  await scheduled!();
  const saved=(await execute({sql:"SELECT payload,retry_after FROM source_cache WHERE key=?",args:[key]})).rows[0];
  assert.equal(JSON.parse(String(saved.payload)).value,"safe");assert.ok(Number(saved.retry_after)>Date.now());
 }finally{globalThis.fetch=originalFetch;}
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
