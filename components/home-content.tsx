import Link from "next/link";
import { Suspense } from "react";
import { AddToCart } from "./cart";
import { News } from "./news";
import { Papers } from "./papers";
import { latestNews } from "@/lib/news";
import { latestPapers } from "@/lib/upsc";
import { homePreviews } from "@/lib/db";

export async function HomePapers(){return <Papers initial={await latestPapers()}/>;}
async function NewsFeed(){return <News initial={await latestNews()}/>;}
async function FeaturedCourses(){const featured=await homePreviews("course",2);return <>{featured.map(course=><article className="course-preview" key={course.id}>{course.extra.demo?<span className="demo-label">Demo course</span>:null}<h3><Link href={"/courses/"+course.slug}>{course.title}</Link></h3><p>{course.summary}</p><AddToCart slug={course.slug}/><Link href={"/courses/"+course.slug}>View course ↗</Link></article>)}<Link className="text-link" href="/courses/">Explore all courses ↗</Link></>;}
export function HomeResources(){return <div className="wrap home-resources"><section className="card home-reference"><h2>Latest UPSC news</h2><Suspense fallback={<p className="feed-loading" role="status">Loading official updates…</p>}><NewsFeed/></Suspense></section><section className="card home-reference"><h2>Courses</h2><Suspense fallback={<p className="feed-loading" role="status">Loading courses…</p>}><FeaturedCourses/></Suspense></section></div>;}
export async function HomeStories(){const stories=await homePreviews("profile",3);return stories.length?<section className="wrap section"><h2>Student stories</h2><div className="grid">{stories.map(s=><article className="card" key={s.id}><h3>{s.title}</h3><p>{s.summary}</p><Link href={"/people/"+s.slug}>Read story ↗</Link></article>)}</div></section>:null;}
