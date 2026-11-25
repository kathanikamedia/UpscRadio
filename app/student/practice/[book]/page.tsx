import {requireUser} from "@/lib/auth";
import {canPractise,practiceBooks} from "@/lib/practice-bank";
import {execute} from "@/lib/db";
import {BankPractice} from "@/components/bank-practice";
import {notFound} from "next/navigation";
import Link from "next/link";
export const metadata={title:"Question bank practice",robots:{index:false,follow:false}};
export default async function Practice({params,searchParams}:{params:Promise<{book:string}>;searchParams:Promise<{page?:string}>}){
 const {book}=await params;if(!practiceBooks.includes(book))notFound();const user=await requireUser(`/student/practice/${book}/`);
 if(!await canPractise(user,book))return <section className="card"><h1>Course material access required</h1><p>This practice bank is included with its study material. Purchases are not open yet.</p><Link href="/resources/?exam=APPSC">Browse study materials ↗</Link></section>;
 const p=await searchParams,page=Math.min(100,Math.max(1,Number.parseInt(p.page||"1",10)||1));
 const rows=(await execute({sql:"SELECT question_number,question,options FROM question_drafts WHERE book_slug=? AND reviewed=1 ORDER BY question_number LIMIT 20 OFFSET ?",args:[book,(page-1)*20]})).rows;
 if(!rows.length)return <section className="card"><h1>Questions are being reviewed</h1><p>Practice will appear here as source checks are completed.</p><Link href="/student/economy-practice/">Try the free Economy sample ↗</Link></section>;
 return <><BankPractice key={`${book}:${page}`} book={book} page={page} questions={rows.map(r=>({number:Number(r.question_number),question:String(r.question),options:JSON.parse(String(r.options))}))}/><nav className="pagination">{page>1?<Link href={`?page=${page-1}`}>← Previous set</Link>:null}{rows.length===20?<Link href={`?page=${page+1}`}>Next set →</Link>:null}</nav></>;
}
