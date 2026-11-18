import test from "node:test";
import assert from "node:assert/strict";
import {parseVideoFeed,parsePlaylistPage,YOUTUBE_CHANNEL_ID} from "../lib/youtube-parser";
test("upload feed keeps actual channel videos newest first and decodes titles",()=>{
 const entry=(id:string,date:string,title:string)=>`<entry><yt:videoId>${id}</yt:videoId><title>${title}</title><published>${date}</published></entry>`;
 const result=parseVideoFeed(`<feed><yt:channelId>${YOUTUBE_CHANNEL_ID}</yt:channelId>${entry("abcdefghijk","2026-11-01T10:00:00Z","Old upload")}${entry("lmnopqrstuv","2026-11-18T10:00:00Z","Polity &amp; Economy")}</feed>`);
 assert.equal(result.items[0].title,"Polity & Economy");assert.equal(result.items[0].url,"https://www.youtube.com/watch?v=lmnopqrstuv");
 assert.throws(()=>parseVideoFeed("<feed><yt:channelId>other-channel</yt:channelId></feed>"));
});
function page(selected:unknown,extra:unknown={},channel=YOUTUBE_CHANNEL_ID){return `<script>var ytInitialData = ${JSON.stringify({metadata:{channelMetadataRenderer:{externalId:channel}},contents:{twoColumnBrowseResultsRenderer:{tabs:[{tabRenderer:{selected:true,content:selected}}]}},extra})};</script>`;}
function playlist(id:string,title:string){return {lockupViewModel:{contentType:"LOCKUP_CONTENT_TYPE_PLAYLIST",contentId:id,metadata:{lockupMetadataViewModel:{title:{content:title}}},contentImage:{collectionThumbnailViewModel:{primaryThumbnail:{thumbnailViewModel:{image:{sources:[{url:"https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg"}]}}}}}}};}
test("playlists preserve the selected channel tab order and exclude recommendations",()=>{
 const result=parsePlaylistPage(page({items:[playlist("PLabcdefghijk","First"),playlist("PLlmnopqrstuv","Second")]},playlist("PLnotthisone00","Recommendation")));
 assert.deepEqual(result.items.map(p=>p.title),["First","Second"]);
 assert.ok(result.items.every(p=>p.url.startsWith("https://www.youtube.com/playlist?list=")));
});
test("playlist parsing rejects other channels and changed or unavailable pages",()=>{
 assert.throws(()=>parsePlaylistPage(page({items:[playlist("PLabcdefghijk","Wrong channel")]},{},"UCother")));
 assert.throws(()=>parsePlaylistPage("<html>Service unavailable</html>"));
 assert.throws(()=>parsePlaylistPage(page({items:[]})));
});
