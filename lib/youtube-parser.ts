export const YOUTUBE_CHANNEL_ID="UCkEF_5K9MvhsT5wonH1UsrA";
export type YouTubeItem={id:string;title:string;url:string;thumbnail:string;published?:string;count?:string};
export type YouTubeListing={items:YouTubeItem[];checkedAt:string;stale?:boolean};
function text(value:string){return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/&(?:amp|lt|gt|quot|apos);|&#(x[0-9a-f]+|\d+);/gi,(entity,numeric:string)=>{if(numeric){const n=numeric[0].toLowerCase()==="x"?parseInt(numeric.slice(1),16):Number(numeric);return n>=0&&n<=0x10ffff?String.fromCodePoint(n):"";}return ({"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&apos;":"'"} as Record<string,string>)[entity.toLowerCase()]||entity;}).trim();}
export function parseVideoFeed(xml:string):Omit<YouTubeListing,"checkedAt">{
 if(!xml.includes(`<yt:channelId>${YOUTUBE_CHANNEL_ID}</yt:channelId>`))throw Error("Unexpected YouTube channel");
 const items:YouTubeItem[]=[];
 for(const entry of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)){
  const body=entry[1],id=body.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1],title=body.match(/<title>([\s\S]*?)<\/title>/)?.[1],published=body.match(/<published>([^<]+)<\/published>/)?.[1];
  if(!id||!title||items.some(item=>item.id===id))continue;
  items.push({id,title:text(title),url:`https://www.youtube.com/watch?v=${id}`,thumbnail:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,...(published&&Number.isFinite(Date.parse(published))?{published}:{})});
 }
 if(!items.length)throw Error("No channel uploads available");
 items.sort((a,b)=>Date.parse(b.published||"")-Date.parse(a.published||""));
 return {items:items.slice(0,6)};
}
type Node=Record<string,any>;
export function parsePlaylistPage(html:string):Omit<YouTubeListing,"checkedAt">{
 const raw=html.match(/(?:var\s+ytInitialData|window\["ytInitialData"\])\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/)?.[1];
 if(!raw)throw Error("YouTube listing unavailable");
 const data=JSON.parse(raw) as Node;
 if(data.metadata?.channelMetadataRenderer?.externalId!==YOUTUBE_CHANNEL_ID)throw Error("Unexpected YouTube channel");
 const tab=data.contents?.twoColumnBrowseResultsRenderer?.tabs?.find((item:Node)=>item.tabRenderer?.selected)?.tabRenderer;
 if(!tab?.content)throw Error("Playlist tab unavailable");
 const items:YouTubeItem[]=[];
 function visit(node:unknown):void{
  if(!node||typeof node!=="object"||items.length>=6)return;
  const object=node as Node,lock=object.lockupViewModel,legacy=object.gridPlaylistRenderer||object.playlistRenderer;
  if(lock?.contentType==="LOCKUP_CONTENT_TYPE_PLAYLIST"||legacy){
   const id=lock?.contentId||legacy?.playlistId,title=lock?.metadata?.lockupMetadataViewModel?.title?.content||legacy?.title?.simpleText||legacy?.title?.runs?.map((r:Node)=>r.text).join("");
   const thumb=lock?.contentImage?.collectionThumbnailViewModel?.primaryThumbnail?.thumbnailViewModel||legacy?.thumbnailRenderer?.playlistVideoThumbnailRenderer?.thumbnail;
   const thumbnail=thumb?.image?.sources?.[0]?.url||thumb?.thumbnails?.[0]?.url||legacy?.thumbnails?.[0]?.thumbnails?.[0]?.url;
   const video=typeof thumbnail==="string"?thumbnail.match(/^https:\/\/i\.ytimg\.com\/vi(?:_webp)?\/([\w-]{11})\//)?.[1]:undefined;
   if(typeof id==="string"&&/^[\w-]{10,100}$/.test(id)&&typeof title==="string"&&title.trim()&&video&&!items.some(item=>item.id===id)){
    const count=thumb?.overlays?.flatMap((o:Node)=>o.thumbnailOverlayBadgeViewModel?.thumbnailBadges||[]).map((badge:Node)=>badge.thumbnailBadgeViewModel?.text).find((v:unknown)=>typeof v==="string");
    items.push({id,title:title.trim(),url:`https://www.youtube.com/playlist?list=${id}`,thumbnail:`https://i.ytimg.com/vi/${video}/hqdefault.jpg`,...(count?{count}:{})});
   }
   return;
  }
  for(const value of Object.values(object))visit(value);
 }
 visit(tab.content);
 if(!items.length)throw Error("No public playlists available");
 return {items};
}
