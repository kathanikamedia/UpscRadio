
import {Localized} from "@/components/localized";
import Form from "next/form";
import Link from "next/link";
import { MaterialCover } from "@/components/material-cover";
import { ClipboardCheck, Timer, ArrowRight } from "lucide-react";
import { publishedCatalogue as contents } from "@/lib/public-catalogue";
import { FREE_MOCK_SLUG } from "@/lib/mock-tests";
export const dynamic="force-dynamic";
export const metadata={title:"Mock tests"};
export default async function MockTests({searchParams}:{searchParams:Promise<{exam?:string;q?:string;price?:string}>}){
 const params=await searchParams;
 const exam=String(params.exam||""), q=String(params.q||"").trim(), price=String(params.price||"");
 const catalogue=(await contents("course")).filter(test=>test.category==="Test Series");
 const exams=[...new Set(catalogue.map(test=>String(test.extra.exam||"UPSC")))].sort();
 const tests=catalogue.filter(test=>{
   const amount=Number(test.extra.price_paise||0);
   const free=test.slug===FREE_MOCK_SLUG||(amount===0&&Boolean(test.extra.pdf_uploaded));
   const text=[test.title,test.summary,test.extra.subject,test.extra.exam].join(" ").toLowerCase();
   return (!exam||String(test.extra.exam||"UPSC")===exam)
     && (!price||(price==="free"?free:amount>0&&!free))
     && q.toLowerCase().split(/\s+/).every(word=>text.includes(word));
 });
 return <Localized>{<><div className="page-head"><div className="wrap"><p className="eyebrow">PRACTISE WITH PURPOSE</p><h1>Your next attempt starts here.</h1><p>Start with one free mock. Find your gaps, review your approach and build your next study plan.</p></div></div><section className="wrap section"><Form key={JSON.stringify([q,exam,price])} action="/test-series/" className="resource-filters">
 <label>Search mock tests<input type="search" name="q" defaultValue={q} placeholder="Title or topic"/></label>
 <label>Exam<select name="exam" defaultValue={exam}><option value="">All exams</option>{exams.map(value=><option key={value} value={value}>{value}</option>)}</select></label>
 <label>Price<select name="price" defaultValue={price}><option value="">All prices</option><option value="free">Free</option><option value="paid">Paid test</option></select></label>
 <button className="button" type="submit">Find tests</button>
 </Form>{(q||exam||price)?<p>{tests.length} · <Link href="/test-series/">Clear filters</Link></p>:null}<div className="grid">{tests.map((test,index)=>{
 const builtIn=test.slug===FREE_MOCK_SLUG;
 const price=Number(test.extra.price_paise||0),free=builtIn||(price===0&&Boolean(test.extra.pdf_uploaded));
 return <article className={"card mock-card "+(free?"free-mock":"")} key={test.id}><span className={"access-label "+(free?"free":"")}>{free?(builtIn?"Free introductory test":"Free test"):price>0?"Paid test":"Pricing to be announced"}</span>{typeof test.extra.source_material_slug==="string"?<MaterialCover eager={index<3} slug={test.extra.source_material_slug} title={test.title}/>:<ClipboardCheck className="mock-icon" aria-hidden="true"/>}<h2>{test.title}</h2><p className="mock-card-summary">{test.summary}</p>{(builtIn||test.extra.question_count)?<p className="test-meta"><Timer size={16} aria-hidden="true"/> {Number(test.extra.question_count)||(builtIn?10:0)} questions · {Number(test.extra.duration_minutes)||(builtIn?15:Math.ceil(Number(test.extra.question_count)*1.2))} minutes</p>:null}<p className="test-price">{free?"₹0":price>0?"₹"+(price/100).toLocaleString("en-IN"):""}</p>{/* Purchase and details stay aligned on every card. */}<div className="mock-card-actions">{!free&&price>0?<Link className="button" href={`/cart/?add=${encodeURIComponent(test.slug)}`}>Buy now</Link>:null}<Link className={free?"button":"button secondary"} href={builtIn?"/student/free-test/":"/test-series/"+test.slug}>{free?"Open free mock":"View test"} <ArrowRight size={16} aria-hidden="true"/></Link></div></article>;
 })}</div>{!tests.length?<div className="library-empty"><h2>No matching mock tests</h2><p>Explore all available mock tests or ask us about upcoming programmes.</p><Link className="button" href="/test-series/">View all mock tests ↗</Link></div>:null}<div id="test-schedule" className="test-schedule"><h2>Test schedules</h2><p>Dates and availability will be published with each scheduled test.</p><Link href="/admissions/">Ask about upcoming tests ↗</Link></div></section></>}</Localized>;
}
