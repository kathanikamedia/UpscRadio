
import {Localized} from "@/components/localized";
import Link from "next/link";
import {requireAdmin} from "@/lib/auth";
import {contents,execute} from "@/lib/db";
import {mockPaper} from "@/lib/mock-papers";
import {MockUploadForm} from "@/components/mock-upload-form";
import {FREE_MOCK_SLUG} from "@/lib/mock-tests";
import "./uploads.css";
export const metadata={title:"Manage mock tests",robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{edit?:string;draft?:string}>}){
 await requireAdmin();const query=await searchParams;
 const [all,drafts]=await Promise.all([contents("course",false),execute("SELECT m.book,m.title,c.slug FROM mock_papers m JOIN content c ON c.id=m.content_id WHERE m.status='draft' ORDER BY m.created DESC LIMIT 30")]);
 const tests=all.filter(item=>item.category==="Test Series"),edit=tests.find(t=>t.slug===query.edit),paper=query.draft?await mockPaper(query.draft):null;
 const draft=paper?.status==="draft"?{book:paper.book,questions:paper.questions,metadata:paper.metadata}:undefined;
 return <Localized>{<section className="staff-page"><header className="staff-page-header"><div><p className="eyebrow">TEST MANAGEMENT</p><h1>Mock tests</h1><p>One PDF upload creates the online mock and its revision download. Students unlock the PDF after submitting.</p></div><Link className="button" href="/staff/mock-tests/#upload">Upload test</Link></header>{drafts.rows.length?<section className="mock-pending-drafts"><h2>Uploads waiting for your check</h2>{drafts.rows.map(row=><Link key={String(row.book)} href={`/staff/mock-tests/?draft=${row.book}#upload`}>{String(row.title)} · Continue checking ↗</Link>)}</section>:null}<div className="staff-content-grid">{tests.map(item=><article className="staff-content-card" key={item.id}><span className={item.published?"status-live":"status-draft"}>{item.published?"Published":"Draft"}</span><h2>{item.title}</h2><p>{item.summary}</p><small>{Number(item.extra.question_count)||"—"} questions · PDF unlocks after completion</small>{item.slug!==FREE_MOCK_SLUG?<Link href={`/staff/mock-tests/?edit=${item.slug}#upload`}>Upload / replace test PDF ↗</Link>:<small>Built-in starter mock · Upload new tests using a different URL name.</small>}{item.published?<Link href={`/test-series/${item.slug}/`}>View test ↗</Link>:null}</article>)}</div><div id="upload" style={{scrollMarginTop:110,marginTop:28}}><MockUploadForm key={draft?.book||edit?.slug||"new"} existing={edit} draft={draft}/></div></section>}</Localized>;
}
