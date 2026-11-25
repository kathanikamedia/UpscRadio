"use server";
import {requireAdmin} from "@/lib/auth";
import {execute,getDatabase} from "@/lib/db";
import {revalidatePath} from "next/cache";
import {z} from "zod";
const schema=z.object({book:z.string().regex(/^(economy-[1-4]|environment-[1-3])$/),number:z.coerce.number().int().min(1).max(1000),question:z.string().trim().min(5).max(10000),a:z.string().trim().min(1).max(3000),b:z.string().trim().min(1).max(3000),c:z.string().trim().min(1).max(3000),d:z.string().trim().min(1).max(3000),answer:z.enum(["a","b","c","d"]),reviewed:z.string().optional()});
export async function saveQuestion(_state:string,data:FormData){
 const admin=await requireAdmin();const result=schema.safeParse(Object.fromEntries(data));if(!result.success)return "Check the question, four options and correct answer.";const v=result.data;
 const existing=await execute({sql:"SELECT 1 FROM question_drafts WHERE book_slug=? AND question_number=?",args:[v.book,v.number]});if(!existing.rows.length)return "Question not found.";
 await getDatabase().batch([{sql:"UPDATE question_drafts SET question=?,options=?,answer=?,reviewed=? WHERE book_slug=? AND question_number=?",args:[v.question,JSON.stringify([v.a,v.b,v.c,v.d]),v.answer,v.reviewed?1:0,v.book,v.number]},{sql:"INSERT INTO audit(actor,action) VALUES (?,?)",args:[admin.id,`Reviewed question ${v.book}/${v.number}`]}],"write");
 revalidatePath("/staff/questions/");return "Question saved.";
}
