"use server";
import {requireUser} from "@/lib/auth";
import {canPractise} from "@/lib/practice-bank";
import {mockPaper} from "@/lib/mock-papers";
import {examRules,defaultPracticeSeconds} from "@/lib/exam-rules";
import {revalidatePath} from "next/cache";
import {execute,rateLimit} from "@/lib/db";
import {activeExam,startExam,saveExam,finishExam,examResult} from "@/lib/exam-store";
import {starterExam} from "@/lib/starter-exam";
import type {ExamAnswers,ExamQuestion} from "@/lib/exam-model";
async function access(book:string){const user=await requireUser();if(book!=="free-polity"&&!await canPractise(user,book))throw Error("Test access required.");return user;}
export async function beginExam(book:string){
 const user=await access(book);await rateLimit("exam-start:"+user,30);
 const existing=await activeExam(user,book);if(existing)return existing;
 if(book==="free-polity")return startExam(user,book,"Free Polity Starter Mock",starterExam,900);
 const uploaded=await mockPaper(book);if(uploaded)return startExam(user,book,uploaded.title,uploaded.questions,uploaded.seconds,examRules(uploaded.metadata.mode||"practice",uploaded.questions.length,uploaded.seconds));
 const rows=(await execute({sql:"SELECT q.question_number,q.question,q.options,q.answer,e.explanation FROM question_drafts q LEFT JOIN question_explanations e ON e.book_slug=q.book_slug AND e.question_number=q.question_number WHERE q.book_slug=? AND q.reviewed=1 ORDER BY q.question_number",args:[book]})).rows;
 const questions:ExamQuestion[]=rows.map(r=>({number:Number(r.question_number),question:String(r.question),options:JSON.parse(String(r.options)),answer:String(r.answer).toLowerCase().charCodeAt(0)-97,explanation:String(r.explanation||"")}));
 const title=book.replace(/-(\d+)$/," · Part $1").replace(/^./,s=>s.toUpperCase());
 return startExam(user,book,title,questions,defaultPracticeSeconds(book,questions.length));
}
// Every operation scopes the attempt to the authenticated owner in the data layer.
export async function autosaveExam(id:string,revision:number,answers:ExamAnswers,marked:number[]){const user=await requireUser();await rateLimit("exam-save:"+user,600);return saveExam(user,id,revision,answers,marked);}
export async function submitExam(id:string,revision:number,answers:ExamAnswers,marked:number[]){const user=await requireUser();await rateLimit("exam-submit:"+user,60);const result=await finishExam(user,id,revision,answers,marked);revalidatePath("/student/");return result;}
export async function reviewExam(id:string){return examResult(await requireUser(),id);}
