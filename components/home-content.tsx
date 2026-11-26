
import {Localized} from "@/components/localized";
import Link from "next/link";
import { Suspense } from "react";
import { AddToCart } from "./cart";
import { News } from "./news";
import { Papers } from "./papers";
import { latestNews } from "@/lib/news";
import { latestPapers } from "@/lib/upsc";
import { publishedHomePreviews as homePreviews } from "@/lib/public-catalogue";
import { FreeCourseCard } from "./free-course-card";

export async function HomePapers(){return <Localized>{<Papers initial={await latestPapers()}/>}</Localized>;}
async function NewsFeed(){return <Localized>{<News initial={await latestNews()}/>}</Localized>;}
async function FeaturedCourses(){const featured=await homePreviews("course",2);return <Localized>{<><FreeCourseCard compact/>{featured.map(course=><article className="course-preview home-course-preview" key={course.id}>{course.extra.demo?<span className="demo-label">Demo course</span>:null}<h3><Link href={"/courses/"+course.slug}>{course.title}</Link></h3><p>{course.summary}</p><div className="home-course-actions"><AddToCart slug={course.slug}/><Link className="home-course-details" href={"/courses/"+course.slug}>View course <span aria-hidden="true">↗</span></Link></div></article>)}<Link className="text-link" href="/courses/">Explore all courses ↗</Link></>}</Localized>;}
export function HomeResources(){return <Localized>{<div className="wrap home-resources"><section className="card home-reference"><h2>Latest UPSC news</h2><Suspense fallback={<p className="feed-loading" role="status">Loading official updates…</p>}><NewsFeed/></Suspense></section><section className="card home-reference"><h2>Courses</h2><Suspense fallback={<p className="feed-loading" role="status">Loading courses…</p>}><FeaturedCourses/></Suspense></section></div>}</Localized>;}
export async function HomeStories(){const stories=await homePreviews("profile",3);return <Localized>{stories.length?<section className="wrap section"><h2>Student stories</h2><div className="grid">{stories.map(s=><article className="card" key={s.id}><h3>{s.title}</h3><p>{s.summary}</p><Link href={"/people/"+s.slug}>Read story ↗</Link></article>)}</div></section>:null}</Localized>;}
