import test from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL="file::memory:";
const {execute,closeDatabase}=await import("../lib/db");
const {startExam,activeExam,saveExam,finishExam,examResult}=await import("../lib/exam-store");
const {scoreExam,validateExamInput}=await import("../lib/exam-model");
const {starterExam}=await import("../lib/starter-exam");
test.after(()=>closeDatabase());
test("score applies negative marking and leaves unanswered at zero",()=>{
 const result=scoreExam(starterExam,{1:2,2:3});assert.equal(result.correct,1);assert.equal(result.wrong,1);assert.equal(result.unanswered,8);assert.equal(result.marks,1.33);assert.equal(result.maximum,20);
 assert.throws(()=>validateExamInput(starterExam,{999:0},[]));assert.throws(()=>validateExamInput(starterExam,{1:4},[]));assert.throws(()=>validateExamInput(starterExam,{},[999]));
});
test("attempts resume one active paper with no answer keys in the client payload",async()=>{
 const first=await startExam("owner","polity","Starter",starterExam,900),second=await startExam("owner","polity","Starter",starterExam,900);
 assert.equal(first.id,second.id);assert.equal(first.questions.length,10);assert.ok(first.questions.every(q=>!("answer" in q)&&!("explanation" in q)));
 await assert.rejects(()=>examResult("owner",first.id),/Submit/);
 const save=await saveExam("owner",first.id,0,{1:2},[1]);assert.equal(save.revision,1);
 const restored=await activeExam("owner","polity");assert.deepEqual(restored?.answers,{1:2});assert.deepEqual(restored?.marked,[1]);assert.equal(restored?.deadline,first.deadline);
 await assert.rejects(()=>saveExam("owner",first.id,0,{1:0},[]),/changed/);
 await assert.rejects(()=>saveExam("intruder",first.id,1,{1:0},[]),/not found/);
 await assert.rejects(()=>finishExam("intruder",first.id,1,{},[]),/not found/);
});
test("submission is immutable, idempotent, owner-scoped and retains its question snapshot",async()=>{
 const paper=await startExam("submitter","polity","Starter",starterExam,900);
 const first=await finishExam("submitter",paper.id,0,{1:2,2:3},[1]);assert.equal(first.result?.correct,1);assert.equal(first.result?.wrong,1);assert.equal(first.result?.questions[0].explanation,starterExam[0].explanation);
 const replay=await finishExam("submitter",paper.id,0,{1:0},[]);assert.deepEqual(replay.result,first.result);
 await assert.rejects(()=>saveExam("submitter",paper.id,first.revision,{},[]));
 assert.equal(await activeExam("submitter","polity"),null);
 const next=await startExam("submitter","polity","Starter",starterExam,900);assert.notEqual(next.id,paper.id);
});
test("expiry rejects new saves and scores only previously saved answers",async()=>{
 const paper=await startExam("late","polity","Starter",starterExam,900);
 await saveExam("late",paper.id,0,{1:2},[]);
 await execute({sql:"UPDATE exam_attempts SET deadline=? WHERE id=?",args:[Date.now()-1000,paper.id]});
 await assert.rejects(()=>saveExam("late",paper.id,1,{1:0,2:0},[]),/expired/);
 const finished=await finishExam("late",paper.id,1,{1:0,2:0},[]);assert.deepEqual(finished.answers,{1:2});assert.equal(finished.result?.correct,1);assert.equal(finished.result?.wrong,0);assert.equal(finished.result?.unanswered,9);
});
test("concurrent start and submission requests keep one attempt and one final result",async()=>{
 const [a,b]=await Promise.all([startExam("concurrent","polity","Starter",starterExam,900),startExam("concurrent","polity","Starter",starterExam,900)]);assert.equal(a.id,b.id);
 const [first,second]=await Promise.all([finishExam("concurrent",a.id,0,{1:2},[]),finishExam("concurrent",a.id,0,{1:0},[])]);assert.deepEqual(first.result,second.result);
 const rows=await execute({sql:"SELECT COUNT(*) AS count FROM exam_attempts WHERE clerk_id='concurrent' AND submitted IS NOT NULL",args:[]});assert.equal(Number(rows.rows[0].count),1);
});
