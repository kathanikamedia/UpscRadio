import { execute } from "./db";
type Listing={checkedAt:string;stale?:boolean};
type Schedule=(work:()=>Promise<void>)=>void;
const requests=new Map<string,Promise<unknown>>();
const refreshes=new Map<string,Promise<void>>();
const memory=new Map<string,{value:Listing|null;expires:number}>();
const refreshInterval=10*60*1000;
function remember(key:string,value:Listing|null){
 const current=memory.get(key);
 if(current?.value&&value&&Date.parse(current.value.checkedAt)>Date.parse(value.checkedAt))return;
 memory.set(key,{value,expires:value&&!value.stale?Date.parse(value.checkedAt)+refreshInterval:Date.now()+60000});
}
export function cachedSource<T extends Listing>(key:string,url:string,parse:(html:string)=>Omit<T,"checkedAt">,schedule:Schedule=work=>{void work();},headers:Record<string,string>={}):Promise<T|null>{
 const cached=memory.get(key);
 if(cached&&cached.expires>Date.now())return Promise.resolve(cached.value as T|null);
 const pending=requests.get(key);if(pending)return pending as Promise<T|null>;
 const task=loadSource(key,url,parse,schedule,headers).then(value=>{remember(key,value);return value;}).finally(()=>requests.delete(key));
 requests.set(key,task);return task;
}
async function loadSource<T extends Listing>(key:string,url:string,parse:(html:string)=>Omit<T,"checkedAt">,schedule:Schedule,headers:Record<string,string>):Promise<T|null>{
 const row=(await execute({sql:"SELECT payload,checked,retry_after FROM source_cache WHERE key=?",args:[key]})).rows[0];
 let previous:T|null=null;
 try{previous=row?JSON.parse(String(row.payload)) as T:null;}catch{/* A damaged cache should not break a page. */}
 if(row&&previous&&Date.now()-Number(row.checked)<refreshInterval)return previous;
 if(row&&Date.now()<Number(row.retry_after))return previous?{...previous,stale:true}:null;
 if(previous){
  if(!refreshes.has(key)){
   let finish!:()=>void;const done=new Promise<void>(resolve=>{finish=resolve;});refreshes.set(key,done);
   const work=async()=>{try{remember(key,await fetchSource(key,url,parse,previous,headers));}finally{refreshes.delete(key);finish();}};
   // Next after() keeps refresh work alive on serverless hosts without blocking the page.
   try{schedule(work);}catch{refreshes.delete(key);finish();}
  }
  return {...previous,stale:true};
 }
 return fetchSource(key,url,parse,null,headers);
}
async function fetchSource<T extends Listing>(key:string,url:string,parse:(html:string)=>Omit<T,"checkedAt">,previous:T|null,headers:Record<string,string>):Promise<T|null>{
 const now=Date.now();
 try{
  const response=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(5000),headers:{Accept:"text/html",...headers}});
  if(!response.ok)throw Error("Source unavailable");
  const result={...parse(await response.text()),checkedAt:new Date(now).toISOString()} as T;
  await execute({sql:"INSERT INTO source_cache(key,payload,checked,retry_after) VALUES (?,?,?,0) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload,checked=excluded.checked,retry_after=0",args:[key,JSON.stringify(result),now]});
  return result;
 }catch{
  if(previous)try{await execute({sql:"UPDATE source_cache SET retry_after=? WHERE key=?",args:[now+60000,key]});}catch{/* Preserve last available data. */}
  return previous?{...previous,stale:true}:null;
 }
}
export async function sourceRefreshFinished(key:string){await refreshes.get(key);}
