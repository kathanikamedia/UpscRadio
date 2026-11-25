"use server";
import {requireUser} from "@/lib/auth";
import {canPractise} from "@/lib/practice-bank";
import {execute,rateLimit} from "@/lib/db";
export async function submitBank(book:string,page:number,answers:Record<string,number>){
 const user=await requireUser();if(!await canPractise(user,book))throw Error("Access required.");
 if(!Number.isInteger(page)||page<1||page>100||!answers||typeof answers!=="object"||Array.isArray(answers)||Object.keys(answers).length>20||Object.entries(answers).some(([k,v])=>!/^\d+$/.test(k)||!Number.isInteger(v)||v<0||v>3))throw Error("Invalid answers.");
 await rateLimit("bank-practice:"+user,60);
 const rows=(await execute({sql:"SELECT q.question_number,q.answer,q.options,e.explanation FROM question_drafts q LEFT JOIN question_explanations e ON e.book_slug=q.book_slug AND e.question_number=q.question_number WHERE q.book_slug=? AND q.reviewed=1 ORDER BY q.question_number LIMIT 20 OFFSET ?",args:[book,(page-1)*20]})).rows;
 if(!rows.length)throw Error("No reviewed questions available.");
 const review=rows.map(row=>({number:Number(row.question_number),answer:String(row.answer).charCodeAt(0)-97,options:JSON.parse(String(row.options)) as string[],explanation:String(row.explanation||"")}));
 const score=review.filter(q=>answers[q.number]===q.answer).length;
 await execute({sql:"INSERT INTO practice_attempts(clerk_id,practice_slug,score,total) VALUES (?,?,?,?)",args:[user,`${book}:${page}`,score,rows.length]});return {score,total:rows.length,review};
}
