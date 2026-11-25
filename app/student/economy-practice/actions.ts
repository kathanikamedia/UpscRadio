"use server";
import { requireUser } from "@/lib/auth";
import { execute, rateLimit } from "@/lib/db";
export async function savePracticeAttempt(answers:Record<number,number>){
 const id=await requireUser("/student/economy-practice/");
 if(!answers||typeof answers!=="object"||Array.isArray(answers)||Object.keys(answers).some(k=>!/^[0-4]$/.test(k)||!Number.isInteger(answers[Number(k)])||answers[Number(k)]<0||answers[Number(k)]>3))throw new Error("Invalid answers");
 await rateLimit("practice:"+id,40);
 const score=Array.from({length:5},(_,i)=>answers[i]===3).filter(Boolean).length;
 await execute({sql:"INSERT INTO practice_attempts(clerk_id,practice_slug,score,total) VALUES (?,?,?,?)",args:[id,"economy-basics",score,5]});
 return score;
}
