import Link from "next/link";
import { ClipboardCheck, Timer, ArrowRight } from "lucide-react";
import { contents } from "@/lib/db";
import { FREE_MOCK_SLUG } from "@/lib/mock-tests";
export const dynamic="force-dynamic";
export const metadata={title:"Mock tests"};
export default async function MockTests(){
 const tests=(await contents("course")).filter(c=>c.category==="Test Series");
 return <><div className="page-head"><div className="wrap"><p className="eyebrow">PRACTISE WITH PURPOSE</p><h1>Your next attempt starts here.</h1><p>Start with one free mock. Find your gaps, review your approach and build your next study plan.</p></div></div><section className="wrap section"><div className="grid">{tests.map(test=>{
 const free=test.slug===FREE_MOCK_SLUG;
 const price=Number(test.extra.price_paise||0);
 return <article className={"card mock-card "+(free?"free-mock":"")} key={test.id}><span className={"access-label "+(free?"free":"")}>{free?"Free introductory test":price>0?"Paid test":"Pricing to be announced"}</span><ClipboardCheck className="mock-icon" aria-hidden="true"/><h2>{test.title}</h2><p>{test.summary}</p>{free?<p className="test-meta"><Timer size={16} aria-hidden="true"/> 10 questions · 15 minutes</p>:null}<p className="test-price">{free?"₹0":price>0?"₹"+(price/100).toLocaleString("en-IN"):""}</p><Link className="button" href={free?"/student/free-test/":"/courses/"+test.slug}>{free?"Open free mock":"View test"} <ArrowRight size={16} aria-hidden="true"/></Link></article>;
 })}</div><p className="muted test-note">Additional paid tests will appear here as they are published.</p></section></>;
}
