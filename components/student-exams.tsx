
import {Localized} from "@/components/localized";
import Link from "next/link";
import {execute} from "@/lib/db";
export async function StudentExams({userId}:{userId:string}){
 const rows=(await execute({sql:"SELECT id,book,title,deadline,submitted,json_extract(result,'$.marks') AS marks,json_extract(result,'$.maximum') AS maximum FROM exam_attempts WHERE clerk_id=? ORDER BY started DESC LIMIT 6",args:[userId]})).rows;
 return <Localized>{<section className="dashboard-section"><div className="section-head"><h2>Your exam attempts</h2><span className="section-links"><Link href="/student/results/">See my results ↗</Link><Link href="/test-series/">Find a mock test ↗</Link></span></div>{rows.length?rows.map(r=><article className="payment-row" key={String(r.id)}><div><strong>{String(r.title)}</strong><small>{r.submitted===null?Number(r.deadline)>Date.now()?"In progress · Your timer is running":"Time ended · Open to finalise your saved answers":`${Number(r.marks)} / ${Number(r.maximum)} marks · Submitted`}</small></div><Link href={`/student/exam/${r.book}/${r.submitted===null?"":`?attempt=${r.id}`}`}>{r.submitted===null?"Resume test ↗":"Review answers ↗"}</Link></article>):<p className="muted">Your saved attempts and results will appear here after you begin a test.</p>}</section>}</Localized>;
}
