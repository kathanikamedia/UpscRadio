import { Suspense } from "react";
import { ArrowUpRight,ExternalLink } from "lucide-react";
import type { ResourceTopic } from "@/lib/resource-topics";
import { latestNews } from "@/lib/news";
import { News } from "./news";
async function TopicNews(){return <News initial={await latestNews()}/>;}
export function ResourceTopicIntro({topic}:{topic:ResourceTopic}){return <section className="topic-intro" aria-labelledby="topic-sources-title"><div className="section-head"><div><p className="eyebrow">START WITH THE SOURCE</p><h2 id="topic-sources-title">Official resources</h2></div><span className="topic-source-note">External links open in a new tab</span></div><div className="topic-source-grid">{topic.sources.map(source=><a className="topic-source-card" href={source.url} key={source.url} target="_blank" rel="noopener noreferrer"><span className="topic-source-icon"><ExternalLink size={20} aria-hidden="true"/></span><div><small>{source.publisher}</small><h3>{source.title}</h3><p>{source.description}</p><strong>Open official resource <ArrowUpRight size={14} aria-hidden="true"/></strong></div></a>)}</div>{topic.slug==="current-affairs"?<section className="topic-news"><h2>Latest official UPSC updates</h2><Suspense fallback={<p role="status">Loading official updates…</p>}><TopicNews/></Suspense></section>:null}</section>;}
