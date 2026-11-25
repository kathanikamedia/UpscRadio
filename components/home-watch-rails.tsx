"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ArrowUpRight, Headphones, ListVideo, Play } from "lucide-react";
import type { YouTubeListing } from "@/lib/youtube-parser";
import { useLiveListing } from "./use-live-listing";

function VideoRow({listing,kind}:{listing:YouTubeListing|null;kind:"videos"|"playlists"}) {
  const title=kind==="videos"?"Latest uploads":"Playlists";
  return <div className={`home-watch-row home-watch-row-${kind}`}>
    <div className="home-watch-label">{kind==="videos"?<Play size={17} aria-hidden="true"/>:<ListVideo size={18} aria-hidden="true"/>}<span>{title}</span></div>
    {listing?.items.length?<div className="home-watch-window" role="group" aria-label={title}>
      <div className="home-watch-track">{[false,true].map(duplicate=><div className={`home-watch-group${duplicate?" home-watch-duplicate":""}`} aria-hidden={duplicate||undefined} key={String(duplicate)}>
        {listing.items.map(item=><a className="home-watch-tile" href={item.url} target="_blank" rel="noopener noreferrer" tabIndex={duplicate?-1:undefined} key={item.id} aria-label={`${kind==="videos"?"Watch":"Open playlist:"} ${item.title} (opens in a new tab)`}>
          <Image unoptimized src={item.thumbnail.replace("/hqdefault.jpg","/mqdefault.jpg")} width={240} height={135} sizes="160px" alt="" loading="lazy"/>
          <span className="home-watch-play" aria-hidden="true">{kind==="videos"?<Play size={12} fill="currentColor"/>:<ListVideo size={14}/>}</span>
          <span className="home-watch-title" lang={/[\u0c00-\u0c7f]/.test(item.title)?"te":undefined}>{item.title}</span>
        </a>)}
      </div>)}</div>
    </div>:<a className="home-watch-empty" href={`https://www.youtube.com/@UPSCRadio/${kind}`} target="_blank" rel="noopener noreferrer">Explore {title.toLowerCase()} on YouTube <ArrowUpRight size={14} aria-hidden="true"/></a>}
  </div>;
}

export function HomeWatchRails({videos,playlists}:{videos:YouTubeListing|null;playlists:YouTubeListing|null}) {
  const band=useRef<HTMLElement>(null);
  const [moving,setMoving]=useState(false);
  useEffect(()=>{
    let visible=false;
    const update=()=>setMoving(visible&&document.visibilityState==="visible");
    const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;update();});
    if(band.current)observer.observe(band.current);
    document.addEventListener("visibilitychange",update);
    return()=>{observer.disconnect();document.removeEventListener("visibilitychange",update);};
  },[]);
  const uploads=useLiveListing<YouTubeListing>("/api/youtube/videos/",videos);
  const collections=useLiveListing<YouTubeListing>("/api/youtube/playlists/",playlists);
  return <section ref={band} data-moving={moving} className="home-watch-band" aria-labelledby="home-watch-title"><div className="wrap">
    <div className="home-watch-heading"><div><p className="eyebrow">A LITTLE PERSPECTIVE FOR YOUR PREPARATION</p><h2 id="home-watch-title"><Headphones size={22} aria-hidden="true"/> Take a break. Keep learning.</h2></div><div className="home-watch-controls"><Link href="/explore/videos/">Explore Watch <ArrowUpRight size={15} aria-hidden="true"/></Link></div></div>
    <VideoRow listing={uploads} kind="videos"/>
    <VideoRow listing={collections} kind="playlists"/>
    {uploads?.stale||collections?.stale?<p className="home-watch-cache">Showing the last available channel update.</p>:null}
  </div></section>;
}
