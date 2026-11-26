import test from "node:test";
import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {ExamSummary} from "../components/exam-summary";
process.env.DATABASE_URL="file::memory:";
const {execute,closeDatabase}=await import("../lib/db");
const {startExam,activeExam,saveExam,finishExam,examResult}=await import("../lib/exam-store");
const {scoreExam,validateExamInput}=await import("../lib/exam-model");
const {starterExam}=await import("../lib/starter-exam");
const {examRules}=await import("../lib/exam-rules");
test.after(()=>closeDatabase());
test("score applies negative marking and leaves unanswered at zero",()=>{
 const result=scoreExam(starterExam,{1:2,2:3});assert.equal(result.correct,1);assert.equal(result.wrong,1);assert.equal(result.unanswered,8);assert.equal(result.marks,1.33);assert.equal(result.maximum,20);
 assert.throws(()=>validateExamInput(starterExam,{999:0},[]));assert.throws(()=>validateExamInput(starterExam,{1:4},[]));assert.throws(()=>validateExamInput(starterExam,{},[999]));
});
test("UPSC formats enforce standard paper length and timing and keep thirds exact",()=>{
 assert.throws(()=>examRules("upsc-gs1",10,900),/100 questions/);assert.throws(()=>examRules("upsc-gs1",100,3600),/120 minutes/);assert.throws(()=>examRules("upsc-csat",100,7200),/80 questions/);
 const gs=Array.from({length:100},(_,i)=>({...starterExam[0],number:i+1})),csat=gs.slice(0,80);
 const gsScore=scoreExam(gs,{1:2,2:2,3:0,4:0,5:0,6:0,7:0,8:0},examRules("upsc-gs1",100,7200));
 assert.equal(gsScore.earned,4);assert.equal(gsScore.penalty,4);assert.equal(gsScore.marks,0);assert.equal(gsScore.maximum,200);assert.equal(gsScore.accuracy,25);
 const answers=Object.fromEntries(Array.from({length:27},(_,i)=>[i+1,2]));const pass=scoreExam(csat,answers,examRules("upsc-csat",80,7200));assert.equal(pass.marks,67.5);assert.equal(pass.maximum,200);assert.equal(pass.qualified,true);
 const fail=scoreExam(csat,{...answers,28:0,29:0},examRules("upsc-csat",80,7200));assert.equal(fail.marks,65.83);assert.equal(fail.qualified,false);
 const negative=scoreExam(gs,{1:0,2:0,3:0},examRules("upsc-gs1",100,7200));assert.equal(negative.marks,-2);assert.equal(negative.unanswered,97);
 assert.equal(scoreExam(csat,{},examRules("upsc-csat",80,7200)).accuracy,null);
});
test("results explain a zero score and calculate accuracy from attempted questions",()=>{
 const answers={1:2,2:0,3:0,4:0,5:0,6:0,7:0,8:1};
 // Two correct answers and six wrong answers: +4 minus 4 is exactly zero.
 const questions=starterExam.map(q=>({...q,answer:q.number<=2?answers[q.number as keyof typeof answers]:q.number<=8?(answers[q.number as keyof typeof answers]+1)%4:0}));
 const result=scoreExam(questions,answers),rules=examRules("practice",10,900);
 assert.equal(result.marks,0);assert.equal(result.correct,2);assert.equal(result.wrong,6);
 const html=renderToStaticMarkup(createElement(ExamSummary,{session:{id:"sample",title:"Starter",started:1000,deadline:901000,submitted:80000,serverNow:9000000,revision:1,rules,questions,answers,marked:[],result}}));
 for(const text of ["Net score","0.00","+4.00 earned","−4.00 deducted","25%","8/10","1m 19s","Subject practice"])assert.ok(html.includes(text),text);
});
test("attempts retain their scoring preset and support older stored question arrays",async()=>{
 const questions=Array.from({length:80},(_,i)=>({...starterExam[0],number:i+1})),rules=examRules("upsc-csat",80,7200);
 const started=await startExam("csat-owner","csat","CSAT mock",questions,7200,rules);assert.equal(started.rules.mode,"upsc-csat");
 const result=await finishExam("csat-owner",started.id,0,{1:2,2:0},[]);assert.equal(result.result?.marks,1.67);assert.equal(result.rules.marksPerQuestion,2.5);
 const old=await startExam("old-owner","legacy","Older practice",starterExam,900);await execute({sql:"UPDATE exam_attempts SET questions=? WHERE id=?",args:[JSON.stringify(starterExam),old.id]});
 const restored=await activeExam("old-owner","legacy");assert.equal(restored?.rules.mode,"practice");assert.equal(restored?.questions.length,10);
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
