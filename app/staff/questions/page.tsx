import { requireAdmin } from "@/lib/auth";
import { execute } from "@/lib/db";
import Link from "next/link";
export const dynamic="force-dynamic";
export const metadata={title:"Question review",robots:{index:false,follow:false}};
const books=["economy-1","economy-2","economy-3","economy-4","environment-1","environment-2","environment-3"];
export default async function Questions({searchParams}:{searchParams:Promise<{book?:string;page?:string}>}){
 await requireAdmin();const params=await searchParams,book=books.includes(params.book||"")?params.book!:books[0],page=Math.max(1,Math.min(100,Number.parseInt(params.page||"1",10)||1));
 const result=await execute({sql:"SELECT question_number,question,options,answer FROM question_drafts WHERE book_slug=? ORDER BY question_number LIMIT 20 OFFSET ?",args:[book,(page-1)*20]});
 return <section className="staff-page"><p className="eyebrow">PRIVATE REVIEW</p><h1>Question bank</h1><p>Extracted questions are drafts. Check each question and answer against the original booklet before publishing.</p><form className="filters"><label>Book<select name="book" defaultValue={book}>{books.map(b=><option key={b} value={b}>{b.replace("-"," part ")}</option>)}</select></label><button className="button">Open book</button></form>{result.rows.map(row=><article className="card" key={Number(row.question_number)} style={{margin:"1rem 0"}}><h2>Question {Number(row.question_number)}</h2><p style={{whiteSpace:"pre-line"}}>{String(row.question)}</p><ol type="a">{(JSON.parse(String(row.options)) as string[]).map((option,index)=><li key={index}>{option}</li>)}</ol><p>Source answer: <strong>{String(row.answer).toUpperCase()}</strong></p></article>)}<nav className="pagination">{page>1?<Link href={`?book=${book}&page=${page-1}`}>← Previous</Link>:null}<span>Page {page}</span>{result.rows.length===20?<Link href={`?book=${book}&page=${page+1}`}>Next →</Link>:null}</nav></section>;
}
