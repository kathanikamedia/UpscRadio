import {randomUUID} from "node:crypto";
import {execute} from "./db";
import {scoreExam,validateExamInput,type ExamQuestion,type ExamSession,type ExamAnswers} from "./exam-model";
type Attempt={id:string;clerk_id:string;book:string;title:string;questions:string;answers:string;marked:string;started:number;deadline:number;revision:number;submitted:number|null;result:string|null};
async function attempt(user:string,id:string){const row=(await execute({sql:"SELECT * FROM exam_attempts WHERE id=? AND clerk_id=?",args:[id,user]})).rows[0];if(!row)throw Error("Attempt not found.");return row as unknown as Attempt;}
function session(row:Attempt):ExamSession{return {id:row.id,title:row.title,started:Number(row.started),deadline:Number(row.deadline),serverNow:Date.now(),revision:Number(row.revision),questions:(JSON.parse(row.questions) as ExamQuestion[]).map(({number,question,options})=>({number,question,options})),answers:JSON.parse(row.answers),marked:JSON.parse(row.marked),result:row.result?JSON.parse(row.result):null};}
export async function activeExam(user:string,book:string){const row=(await execute({sql:"SELECT * FROM exam_attempts WHERE clerk_id=? AND book=? AND submitted IS NULL LIMIT 1",args:[user,book]})).rows[0];return row?session(row as unknown as Attempt):null;}
export async function startExam(user:string,book:string,title:string,questions:ExamQuestion[],seconds:number){
 if(!questions.length||questions.length>700||questions.some(q=>q.options.length!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3))throw Error("Questions need checking before this test can open.");
 const now=Date.now();await execute({sql:"INSERT INTO exam_attempts(id,clerk_id,book,title,questions,started,deadline) VALUES (?,?,?,?,?,?,?) ON CONFLICT DO NOTHING",args:[randomUUID(),user,book,title,JSON.stringify(questions),now,now+seconds*1000]});
 return (await activeExam(user,book))!;
}
export async function saveExam(user:string,id:string,revision:number,answers:ExamAnswers,marked:number[]){
 const row=await attempt(user,id);validateExamInput(JSON.parse(row.questions),answers,marked);
 if(!Number.isInteger(revision))throw Error("Invalid save version.");
 const result=await execute({sql:"UPDATE exam_attempts SET answers=?,marked=?,revision=revision+1 WHERE id=? AND clerk_id=? AND submitted IS NULL AND deadline>? AND revision=?",args:[JSON.stringify(answers),JSON.stringify([...new Set(marked)]),id,user,Date.now(),revision]});
 if(!result.rowsAffected)throw Error("Your attempt changed or time expired. Reload to restore the saved attempt.");
 return {revision:revision+1};
}
export async function finishExam(user:string,id:string,revision:number,answers:ExamAnswers,marked:number[]){
 const row=await attempt(user,id);if(row.submitted!==null)return session(row);
 const questions=JSON.parse(row.questions) as ExamQuestion[];validateExamInput(questions,answers,marked);
 if(row.revision!==revision)throw Error("Another window changed this attempt. Reload before submitting.");
 const now=Date.now(),expired=now>=Number(row.deadline),finalAnswers=expired?JSON.parse(row.answers):answers;
 const result=scoreExam(questions,finalAnswers);
 await execute({sql:"UPDATE exam_attempts SET answers=?,marked=?,submitted=?,result=?,revision=revision+1 WHERE id=? AND clerk_id=? AND submitted IS NULL AND revision=?",args:[JSON.stringify(finalAnswers),JSON.stringify(expired?JSON.parse(row.marked):marked),now,JSON.stringify(result),id,user,revision]});
 const saved=await attempt(user,id);if(saved.submitted===null)throw Error("The attempt changed. Reload and submit again.");return session(saved);
}
export async function recentExams(user:string,book:string){return (await execute({sql:"SELECT id,title,submitted,result FROM exam_attempts WHERE clerk_id=? AND book=? AND submitted IS NOT NULL ORDER BY submitted DESC LIMIT 5",args:[user,book]})).rows.map(r=>({id:String(r.id),submitted:Number(r.submitted),...(JSON.parse(String(r.result)) as {correct:number;wrong:number;unanswered:number;marks:number;maximum:number})})).map(({id,submitted,correct,wrong,unanswered,marks,maximum})=>({id,submitted,correct,wrong,unanswered,marks,maximum}));}
export async function examResult(user:string,id:string){const row=await attempt(user,id);if(row.submitted===null)throw Error("Submit the attempt before reviewing answers.");return session(row);}
