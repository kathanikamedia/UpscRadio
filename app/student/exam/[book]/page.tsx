
import {Localized} from "@/components/localized";
import {notFound,redirect} from "next/navigation";
import {mockPurchaseHref} from "@/lib/purchase-navigation";
import {requireUser} from "@/lib/auth";
import {knownPracticeBook,canPractise,canDownloadMock} from "@/lib/practice-bank";
import {mockPaper} from "@/lib/mock-papers";
import {execute} from "@/lib/db";
import {activeExam,recentExams,examResult} from "@/lib/exam-store";
import {ExamRoom} from "@/components/exam-room";
import Link from "next/link";
export const metadata={title:"Exam room",robots:{index:false,follow:false}};
export default async function ExamPage({params,searchParams}:{params:Promise<{book:string}>;searchParams:Promise<{attempt?:string}>}){
 const {book}=await params;if(book!=="free-polity"&&!await knownPracticeBook(book))notFound();
 const user=await requireUser(`/student/exam/${book}/`);
 if(book!=="free-polity"&&!await canPractise(user,book))redirect(await mockPurchaseHref(book));
 const {attempt}=await searchParams;
 const paper=await mockPaper(book);
 const pdfAccess=(Boolean(paper)||book!=="free-polity")&&await canDownloadMock(user,book);
 const [active,history,count]=await Promise.all([attempt?examResult(user,attempt).catch(()=>notFound()):activeExam(user,book),recentExams(user,book),book==="free-polity"?Promise.resolve({reviewed:10,total:10}):execute({sql:"SELECT COUNT(*) AS total,COALESCE(SUM(reviewed=1),0) AS reviewed FROM question_drafts WHERE book_slug=?",args:[book]}).then(r=>({total:Number(r.rows[0].total),reviewed:Number(r.rows[0].reviewed)}))]);
 return <Localized>{<ExamRoom book={book} title={paper?.title} minutes={paper?paper.seconds/60:undefined} mode={paper?.metadata.mode||"practice"} hasPdf={pdfAccess} initial={active} history={history} count={paper?.questions.length??count.reviewed} total={paper?.questions.length??count.total}/>}</Localized>;
}
