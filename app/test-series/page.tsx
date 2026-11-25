import { AddToCart } from "@/components/cart";
import Link from "next/link";
import { MaterialCover } from "@/components/material-cover";
import { ClipboardCheck, Timer, ArrowRight } from "lucide-react";
import { publishedCatalogue as contents } from "@/lib/public-catalogue";
import { FREE_MOCK_SLUG } from "@/lib/mock-tests";
export const dynamic="force-dynamic";
export const metadata={title:"Mock tests"};
export default async function MockTests({searchParams}:{searchParams:Promise<{exam?:string}>}){
 const {exam}=await searchParams;
 const tests=(await contents("course")).filter(c=>c.category==="Test Series"&&(!exam||String(c.extra.exam||"UPSC")===exam));
 return <><div className="page-head"><div className="wrap"><p className="eyebrow">PRACTISE WITH PURPOSE</p><h1>Your next attempt starts here.</h1><p>Start with one free mock. Find your gaps, review your approach and build your next study plan.</p></div></div><section className="wrap section"><div className="grid">{tests.map((test,index)=>{
 const free=test.slug===FREE_MOCK_SLUG;
 const price=Number(test.extra.price_paise||0);
 return <article className={"card mock-card "+(free?"free-mock":"")} key={test.id}><span className={"access-label "+(free?"free":"")}>{free?"Free introductory test":price>0?"Paid test":"Pricing to be announced"}</span>{typeof test.extra.source_material_slug==="string"?<MaterialCover eager={index<3} slug={test.extra.source_material_slug} title={test.title}/>:<ClipboardCheck className="mock-icon" aria-hidden="true"/>}<h2>{test.title}</h2><p className="mock-card-summary">{test.summary}</p>{free?<p className="test-meta"><Timer size={16} aria-hidden="true"/> 10 questions · 15 minutes</p>:null}<p className="test-price">{free?"₹0":price>0?"₹"+(price/100).toLocaleString("en-IN"):""}</p>{!free&&!test.extra.preparation?<AddToCart slug={test.slug}/>:null}<Link className="button" href={free?"/student/free-test/":"/test-series/"+test.slug}>{free?"Open free mock":"View test"} <ArrowRight size={16} aria-hidden="true"/></Link></article>;
 })}</div>{!tests.length?<div className="library-empty"><h2>No tests published for this exam yet.</h2><p>Explore all available mock tests or ask us about upcoming programmes.</p><Link className="button" href="/test-series/">View all mock tests ↗</Link></div>:null}<div id="test-schedule" className="test-schedule"><h2>Test schedules</h2><p>Dates and availability will be published with each scheduled test.</p><Link href="/admissions/">Ask about upcoming tests ↗</Link></div></section></>;
}
