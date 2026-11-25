import { after } from "next/server";
import { cachedSource } from "./source-cache";
import { YOUTUBE_CHANNEL_ID } from "./youtube-parser";

export type CommunityPlatform="youtube"|"instagram"|"facebook";
export type CommunityMetric={platform:CommunityPlatform;count:number|null;status:"reported"|"api"|"cached"|"unavailable";checkedAt:string|null};
export type CommunityCounts={metrics:CommunityMetric[];checkedAt:string;stale?:boolean};
type ProviderCount={count:number|null;hidden:boolean;checkedAt:string;stale?:boolean};
export const reportedCommunity:CommunityCounts={checkedAt:"",metrics:[{platform:"youtube",count:78700,status:"reported",checkedAt:null},{platform:"instagram",count:36900,status:"reported",checkedAt:null},{platform:"facebook",count:null,status:"unavailable",checkedAt:null}]};
function count(value:unknown){
 if((typeof value!=="number"&&typeof value!=="string")||value==="")throw Error("Count unavailable");
 const number=Number(value);if(!Number.isSafeInteger(number)||number<0)throw Error("Invalid count");return number;
}
export function parseCommunityCount(platform:CommunityPlatform,raw:unknown):Omit<ProviderCount,"checkedAt">{
 if(!raw||typeof raw!=="object")throw Error("Count unavailable");
 const data=raw as Record<string,unknown>;
 if(platform==="youtube"){
  const item=(data.items as {statistics?:{subscriberCount?:unknown;hiddenSubscriberCount?:boolean}}[]|undefined)?.[0];
  if(item?.statistics?.hiddenSubscriberCount)return {count:null,hidden:true};
  return {count:count(item?.statistics?.subscriberCount),hidden:false};
 }
 return {count:count(data.followers_count),hidden:false};
}
async function metric(platform:CommunityPlatform):Promise<CommunityMetric>{
 const fallback=reportedCommunity.metrics.find(item=>item.platform===platform)!;
 let url:string,key:string,headers:Record<string,string>={Accept:"application/json"};
 if(platform==="youtube"){
  const apiKey=process.env.YOUTUBE_DATA_API_KEY?.trim();if(!apiKey)return {...fallback};
  const endpoint=new URL("https://www.googleapis.com/youtube/v3/channels");
  endpoint.search=new URLSearchParams({part:"statistics",id:YOUTUBE_CHANNEL_ID,key:apiKey,fields:"items(statistics(subscriberCount,hiddenSubscriberCount))"}).toString();
  url=endpoint.href;key="community-youtube-"+YOUTUBE_CHANNEL_ID;
 }else{
  const id=(platform==="instagram"?process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID:process.env.FACEBOOK_PAGE_ID)?.trim();
  const token=process.env.META_PAGE_ACCESS_TOKEN?.trim(),version=process.env.META_GRAPH_API_VERSION?.trim();
  if(!id||!/^\d+$/.test(id)||!token||!version||!/^v\d+\.\d+$/.test(version))return {...fallback};
  url=`https://graph.facebook.com/${version}/${id}?fields=followers_count`;
  headers={...headers,Authorization:`Bearer ${token}`};key=`community-${platform}-${id}`;
 }
 try{
  const result=await cachedSource<ProviderCount>(key,url,text=>parseCommunityCount(platform,JSON.parse(text)),after,headers);
  if(!result)return {...fallback};
  return {platform,count:result.count,status:result.hidden?"unavailable":result.stale?"cached":"api",checkedAt:result.checkedAt};
 }catch{return {...fallback};}
}
export async function communityCounts():Promise<CommunityCounts>{
 const metrics=await Promise.all((["youtube","instagram","facebook"] as const).map(metric));
 return {metrics,checkedAt:new Date().toISOString(),stale:metrics.some(item=>item.status==="cached")};
}
export function formatCommunityCount(value:number){return new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}).format(value);}
