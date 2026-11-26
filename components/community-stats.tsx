"use client";
import {Localized} from "@/components/localized";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { socials } from "@/lib/socials";
import type { CommunityCounts } from "@/lib/community-counts";
import { useLiveListing } from "./use-live-listing";
export function CommunityStats({initial}:{initial:CommunityCounts}){
 const result=useLiveListing("/api/community/",initial)||initial;
 return <Localized>{<section className="wrap community-stats" aria-labelledby="community-stats-title"><div className="community-stats-heading"><p className="eyebrow">THE CONVERSATION KEEPS GROWING</p><h2 id="community-stats-title">A community with{" "}<br/>a shared ambition.</h2><p>Learning, listening and showing up for the journey.</p></div><div className="community-stats-grid">{result.metrics.map(metric=>{const social=socials[metric.platform],unit=metric.platform==="youtube"?"subscribers":"followers",formatted=metric.count===null?"Join us":new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}).format(metric.count);return <a className={"community-stat community-stat-"+metric.platform} key={metric.platform} href={social.url} target="_blank" rel="noopener noreferrer"><span className="community-platform"><Image unoptimized src={social.icon} width={20} height={20} alt=""/>{social.name}<ArrowUpRight size={15} aria-hidden="true"/></span><strong>{formatted}</strong><span>{metric.count===null?"Follow the conversation":metric.status==="reported"?"Reported "+unit:unit[0].toUpperCase()+unit.slice(1)}</span>{metric.platform==="youtube"?<div className="community-audio-art" aria-hidden="true">{[18,30,45,27,39,56,35,46,25,39,18].map((height,index)=><i key={index} style={{height}}/>)}</div>:null}</a>;})}</div></section>}</Localized>;
}
