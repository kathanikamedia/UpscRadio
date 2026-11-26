import {Localized} from "@/components/localized";
import Link from "next/link";
import {requireUser} from "@/lib/auth";
import {studentResults,type TestResult} from "@/lib/results";
import {ArrowRight,Target,TrendingUp,Trophy,Crosshair} from "lucide-react";
export const dynamic="force-dynamic";
export const metadata={title:"My results",robots:{index:false,follow:false}};
const fmt=(n:number)=>`${n.toLocaleString("en-IN",{maximumFractionDigits:1})}%`;
function Trend({test}:{test:TestResult}){
 const points=test.attempts.slice(-10);
 return <div className="results-trend" role="img" aria-label={`Scores for ${test.title}: ${points.map(p=>fmt(p.percent)).join(", ")}`}>{points.map((point,index)=><span key={point.id} className="results-bar" style={{height:`${Math.max(4,point.percent)}%`}} title={`Attempt ${test.attempts.length-points.length+index+1}: ${fmt(point.percent)} · ${new Date(point.submitted).toLocaleDateString("en-IN")}`}><span className="sr-only">{fmt(point.percent)}</span></span>)}</div>;
}
export default async function Results(){
 const user=await requireUser("/student/results/");
 const data=await studentResults(user);
 if(!data.totalAttempts)return <Localized>{<section className="dashboard-section results-empty"><h1>My results</h1><p>Finish a mock test to see your scores, progress and weak areas here.</p><Link className="button" href="/test-series/">Find a mock test <ArrowRight size={16}/></Link></section>}</Localized>;
 return <Localized>{<div className="results-page"><header><p className="eyebrow">YOUR PROGRESS</p><h1>My results</h1><p>Scores are shown as a percentage of the maximum marks, after negative marking.</p></header>
 <div className="results-tiles"><article><Target aria-hidden="true"/><strong>{data.totalAttempts}</strong><span>Tests completed</span></article><article><TrendingUp aria-hidden="true"/><strong>{fmt(data.average!)}</strong><span>Average score</span></article><article><Trophy aria-hidden="true"/><strong>{fmt(data.best!)}</strong><span>Best score</span></article><article><Crosshair aria-hidden="true"/><strong>{data.accuracy===null?"—":`${data.accuracy}%`}</strong><span>Accuracy on attempted questions</span></article></div>
 {data.weakest.length?<section className="dashboard-section results-focus"><h2>Revise these first</h2><p>Your average is below 60% on these tests. Re-read the explanations, then try again.</p><ul>{data.weakest.map(test=><li key={test.book}><span>{test.title}</span><strong>{fmt(test.average)}</strong><Link href={`/student/exam/${test.book}/`}>Try again ↗</Link></li>)}</ul></section>:null}
 <section className="dashboard-section"><h2>By test</h2><div className="results-table-wrap"><table className="results-table"><thead><tr><th>Test</th><th>Attempts</th><th>Latest</th><th>Best</th><th>Standing</th><th>Progress</th><th></th></tr></thead><tbody>{data.tests.map(test=>{const last=test.attempts[test.attempts.length-1];return <tr key={test.book}><td><strong>{test.title}</strong></td><td>{test.attempts.length}</td><td>{fmt(test.latest)}</td><td>{fmt(test.best)}</td><td>{test.percentile===null?<span className="muted">Needs 5+ takers</span>:`Better than ${test.percentile}%`}</td><td><Trend test={test}/></td><td><Link href={`/student/exam/${test.book}/?attempt=${last.id}`}>Review ↗</Link></td></tr>;})}</tbody></table></div></section></div>}</Localized>;
}
