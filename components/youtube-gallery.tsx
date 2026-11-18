"use client";
import Image from "next/image";
import { Play,ListVideo,ArrowUpRight } from "lucide-react";
import type { YouTubeListing } from "@/lib/youtube-parser";
import { useLiveListing } from "./use-live-listing";
export function YouTubeGallery({initial,kind}:{initial:YouTubeListing|null;kind:"videos"|"playlists"}){
 const listing=useLiveListing<YouTubeListing>(`/api/youtube/${kind}/`,initial);
 if(!listing?.items.length)return <div className="youtube-unavailable"><p>{kind==="videos"?"Visit our channel to see the latest uploads.":"Explore our public playlists on YouTube."}</p><a href={`https://www.youtube.com/@UPSCRadio/${kind}`} target="_blank" rel="noopener noreferrer">Open on YouTube ↗</a></div>;
 return <><div className="youtube-grid">{listing.items.map(item=><a className="youtube-card" key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"><span className="youtube-thumbnail"><Image src={item.thumbnail} width={480} height={270} sizes="(max-width:700px) 100vw, (max-width:1100px) 50vw, 33vw" alt=""/><span className="youtube-play" aria-hidden="true">{kind==="videos"?<Play size={20} fill="currentColor"/>:<ListVideo size={22}/>}</span>{item.count?<span className="youtube-count">{item.count}</span>:null}</span><div><h3 lang={/[\u0c00-\u0c7f]/.test(item.title)?"te":undefined}>{item.title}</h3><div className="youtube-card-meta">{item.published?<time dateTime={item.published}>{new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short",year:"numeric",timeZone:"Asia/Kolkata"}).format(new Date(item.published))}</time>:<span>UPSC Radio playlist</span>}<span>{kind==="videos"?"Watch video":"Open playlist"} <ArrowUpRight size={14} aria-hidden="true"/></span></div></div></a>)}</div>{listing.stale?<small className="youtube-cache-note">Showing the last available channel update.</small>:null}</>;
}
