import test from "node:test";
import assert from "node:assert/strict";
import { parseCommunityCount,communityCounts,formatCommunityCount } from "../lib/community-counts";
test("provider counts use correct fields, accept zero, and strip unrelated private data",()=>{
 assert.deepEqual(parseCommunityCount("instagram",{followers_count:36912,access_token:"never-publish"}),{count:36912,hidden:false});
 assert.deepEqual(parseCommunityCount("facebook",{followers_count:0,fan_count:1000}),{count:0,hidden:false});
 assert.deepEqual(parseCommunityCount("youtube",{items:[{statistics:{subscriberCount:"78700",hiddenSubscriberCount:false}}]}),{count:78700,hidden:false});
 assert.deepEqual(parseCommunityCount("youtube",{items:[{statistics:{subscriberCount:"78700",hiddenSubscriberCount:true}}]}),{count:null,hidden:true});
 assert.throws(()=>parseCommunityCount("facebook",{fan_count:123}));
 assert.throws(()=>parseCommunityCount("instagram",{followers_count:-1}));
 assert.throws(()=>parseCommunityCount("instagram",{followers_count:"invalid"}));
 assert.equal(formatCommunityCount(78700),"78.7K");
});
test("unconfigured API access keeps reported figures labelled and never invents Facebook followers",async()=>{
 const keys=["YOUTUBE_DATA_API_KEY","META_PAGE_ACCESS_TOKEN","META_GRAPH_API_VERSION","FACEBOOK_PAGE_ID","INSTAGRAM_BUSINESS_ACCOUNT_ID"];
 const before=keys.map(key=>process.env[key]);for(const key of keys)delete process.env[key];
 try{const result=await communityCounts();assert.equal(result.metrics[0].status,"reported");assert.equal(result.metrics[1].status,"reported");assert.equal(result.metrics[2].count,null);assert.equal(result.metrics[2].status,"unavailable");}finally{keys.forEach((key,index)=>{if(before[index]===undefined)delete process.env[key];else process.env[key]=before[index];});}
});
