"use client";
import {Localized} from "@/components/localized";

import {useState} from "react";
import Image from "next/image";
import {Headphones,ArrowUpRight,Play} from "lucide-react";
export function SpotifyPodcast({url}:{url:string}){
 const [loaded,setLoaded]=useState(false);
 const id=/^https:\/\/open\.spotify\.com\/show\/([A-Za-z0-9]{22})(?:\?|$)/.exec(url)?.[1];
 if(!id)return null;
 return <Localized>{<section className="spotify-podcast" aria-labelledby="spotify-heading"><div><p className="eyebrow">UPSC RADIO · ON SPOTIFY</p><h2 id="spotify-heading">Take the conversation with you.</h2><p>Listen to Telugu conversations on society, governance and the journey of preparation. Make room for learning, wherever your day takes you.</p><a className="button secondary" href={url} target="_blank" rel="noopener noreferrer"><Image src="/brands/spotify.svg" width={21} height={21} alt=""/> Listen on Spotify <ArrowUpRight size={16}/></a></div><div className="spotify-player">{loaded?<iframe title="UPSC Radio podcast on Spotify" src={`https://open.spotify.com/embed/show/${id}?utm_source=generator&theme=0`} width="100%" height="352" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{borderRadius:12,display:"block"}}/>:<div className="spotify-player-preview"><Headphones size={36} aria-hidden="true"/><h3>Your next listening break starts here.</h3><p>Play the podcast here, or open it in Spotify.</p><button className="button" onClick={()=>setLoaded(true)}><Play size={16} aria-hidden="true"/> Load Spotify player</button></div>}</div></section>}</Localized>;
}
