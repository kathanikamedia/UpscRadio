"use client";
import {Localized} from "@/components/localized";
import { useState } from "react";
import type { Content } from "@/lib/db";
import Link from "next/link";
import { MaterialCover } from "@/components/material-cover";
import { ClipboardCheck, Timer, ArrowRight } from "lucide-react";

import { FREE_MOCK_SLUG } from "@/lib/mock-tests";
import { WishlistButton } from "@/components/wishlist-button";
type Filters = { q?: string; exam?: string; price?: string };
export function MockCatalogue({catalogue, initial, saved=[]}:{catalogue: Pick<Content,"id"|"slug"|"title"|"summary"|"extra">[]; initial: Filters; saved?: number[]}) {
 const [filters,setFilters]=useState(initial);
 const {q="",exam="",price=""}=filters;
 function update(next: Filters) {
   setFilters(next);
   const url=new URL(window.location.href);
   for(const key of ["q","exam","price"] as const) {
     if(next[key]) url.searchParams.set(key,next[key]!);
     else url.searchParams.delete(key);
   }
   window.history.replaceState(null,"",url);
 }
 const exams=[...new Set(catalogue.map(test=>String(test.extra.exam||"UPSC")))].sort();
 const tests=catalogue.filter(test=>{
   const amount=Number(test.extra.price_paise||0);
   const free=test.slug===FREE_MOCK_SLUG||(amount===0&&Boolean(test.extra.pdf_uploaded));
   const text=[test.title,test.summary,test.extra.subject,test.extra.exam].join(" ").toLowerCase();
   return (!exam||String(test.extra.exam||"UPSC")===exam)
     && (!price||(price==="free"?free:amount>0&&!free))
     && q.toLowerCase().split(/\s+/).every(word=>text.includes(word));
 });
 return <Localized>{<><div className="page-head"><div className="wrap"><p className="eyebrow">PRACTISE WITH PURPOSE</p><h1>Your next attempt starts here.</h1><p>Start with one free mock. Find your gaps, review your approach and build your next study plan.</p></div></div><section className="wrap section"><div className="resource-filters">
 <label>Search mock tests<input type="search" name="q" value={q} onChange={event=>update({...filters,q:event.target.value})} placeholder="Title or topic"/></label>
 <label>Exam<select name="exam" value={exam} onChange={event=>update({...filters,exam:event.target.value})}><option value="">All exams</option>{exams.map(value=><option key={value} value={value}>{value}</option>)}</select></label>
 <label>Price<select name="price" value={price} onChange={event=>update({...filters,price:event.target.value})}><option value="">All prices</option><option value="free">Free</option><option value="paid">Paid test</option></select></label>
 </div>{(q||exam||price)?<p>{tests.length} · <button type="button" onClick={()=>update({})}>Clear filters</button></p>:null}<div className="grid">{tests.map((test,index)=>{
 const builtIn=test.slug===FREE_MOCK_SLUG;
 const price=Number(test.extra.price_paise||0),free=builtIn||(price===0&&Boolean(test.extra.pdf_uploaded));
 const href=builtIn?"/student/free-test/":"/test-series/"+test.slug;
 return <article className={"card mock-card "+(free?"free-mock":"")} key={test.id}><div className="mock-card-top"><span className={"access-label "+(free?"free":"")}>{free?(builtIn?"Free introductory test":"Free test"):price>0?"Paid test":"Pricing to be announced"}</span>{builtIn?null:<WishlistButton compact id={test.id} added={saved.includes(test.id)}/>}</div>{typeof test.extra.source_material_slug==="string"?<MaterialCover eager={index<3} slug={test.extra.source_material_slug} title={test.title}/>:<ClipboardCheck className="mock-icon" aria-hidden="true"/>}<h2><Link href={href}>{test.title}</Link></h2><p className="mock-card-summary">{test.summary}</p>{(builtIn||test.extra.question_count)?<p className="test-meta"><Timer size={16} aria-hidden="true"/> {Number(test.extra.question_count)||(builtIn?10:0)} questions · {Number(test.extra.duration_minutes)||(builtIn?15:Math.ceil(Number(test.extra.question_count)*1.2))} minutes</p>:null}<div className="mock-card-footer"><p className="test-price">{free?"Free":price>0?"₹"+(price/100).toLocaleString("en-IN"):""}</p>{/* Purchase and details stay aligned on every card. */}<div className="mock-card-actions">{!free&&price>0?<Link className="button" href={`/cart/?add=${encodeURIComponent(test.slug)}`}>Buy now</Link>:null}<Link className={free?"button":"button secondary"} href={href}>{free?"Open free mock":"View test"} <ArrowRight size={16} aria-hidden="true"/></Link></div></div></article>;
 })}</div>{!tests.length?<div className="library-empty"><h2>No matching mock tests</h2><p>Explore all available mock tests or ask us about upcoming programmes.</p><button className="button" onClick={()=>update({})}>Clear filters</button></div>:null}<div id="test-schedule" className="test-schedule"><h2>Test schedules</h2><p>Dates and availability will be published with each scheduled test.</p><Link href="/admissions/">Ask about upcoming tests ↗</Link></div></section></>}</Localized>;
}
