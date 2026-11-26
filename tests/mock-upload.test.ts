import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {pathToFileURL} from "node:url";
const testDirectory=mkdtempSync(join(tmpdir(),"upsc-mock-upload-")),testDatabase=join(testDirectory,"test.db");
process.env.DATABASE_URL=pathToFileURL(testDatabase).href;
const {closeDatabase,execute}=await import("../lib/db");
const {parseMockText,validateMockQuestions}=await import("../lib/mock-pdf-parser");
const {stageMock,publishMock,mockPaper,mockEntitled,completedMockPdf}=await import("../lib/mock-papers");
const {startExam,finishExam}=await import("../lib/exam-store");
test.after(()=>{closeDatabase();for(const suffix of ["","-wal","-shm"])try{rmSync(testDatabase+suffix);}catch{}});
const sample=`SECTION 1
1. Consider the statements:
1. Statement one.
2. Statement two.
Which is correct?
(a) One (b) Two
(c) Both (d) Neither
2. Select the answer.
(a) First (b) Second (c) Third (d) Fourth
Answer Key
1. (c) 2. (a)
1. (c) Both statements are correct.
2. (a) The first option is correct.`;
test("PDF parser separates numbered statements, options, answer keys and explanations",()=>{
 const parsed=parseMockText(sample,2);assert.equal(parsed.questions.length,2);assert.deepEqual(parsed.issues,[]);assert.equal(parsed.questions[0].answer,2);assert.match(parsed.questions[0].question,/2\. Statement two/);assert.deepEqual(parsed.questions[0].options,["One","Two","Both","Neither"]);assert.equal(parsed.questions[1].explanation,"The first option is correct.");assert.equal(validateMockQuestions(parsed.questions,2).length,2);
});
test("inline answers are extracted and conflicting or incomplete sources cannot be published",()=>{
 const inline=`1. What is first?\nA. One\nB. Two\nC. Three\nD. Four\nAnswer: A\nExplanation: One is the first number.`;
 const parsed=parseMockText(inline,1);assert.equal(parsed.questions[0].answer,0);assert.deepEqual(parsed.issues,[]);
 const conflict=parseMockText(sample+"\n1. (a)",2);assert.equal(conflict.questions[0].answer,-1);assert.throws(()=>validateMockQuestions(conflict.questions,2),/Question 1/);
 assert.throws(()=>validateMockQuestions([{...parsed.questions[0],explanation:""}],1));assert.throws(()=>validateMockQuestions(parsed.questions,2));
});
test("section answer blocks preserve explanations even when prose begins with a number",()=>{
 const text=`1. Choose one.\n(a) One (b) Two (c) Three (d) Four\nAnswers and Explanations\n1. Answer: (a) One\n125. At the second meeting, it was confirmed.\n\nEconomy and Industry\n2. Choose two.\n(a) One (b) Two (c) Three (d) Four\nAnswers and Explanations\n2. Answer: (b) Two\nTwo is correct.`;
 const parsed=parseMockText(text,2);assert.deepEqual(parsed.issues,[]);assert.match(parsed.questions[0].explanation,/125\. At/);assert.ok(!parsed.questions[0].explanation.includes("Economy and Industry"));assert.equal(parsed.questions[1].answer,1);
});
test("upload drafts stay unpublished, entitlements are enforced and PDFs unlock only for the completed owner",async()=>{
 const questions=parseMockText(sample,2).questions,meta={title:"Test paper",summary:"A two question test.",body:"A test for the upload flow.",exam:"UPSC",language:"English",price:9900,minutes:2,expected:2};
 const book=await stageMock("admin","test-upload",meta,"study-materials/upsc/tests/version-one.pdf",questions);
 assert.equal((await mockPaper(book))?.status,"draft");assert.equal(await mockEntitled("student",book),false);
 await assert.rejects(()=>publishMock("admin",book,[{...questions[0],answer:-1},questions[1]]));assert.equal((await mockPaper(book))?.published,false);
 await publishMock("admin",book,questions);const paper=(await mockPaper(book))!;assert.equal(paper.published,true);assert.equal(await mockEntitled("student",book),false);
 await execute({sql:"INSERT INTO payments(id,clerk_id,course_id,amount,status) VALUES ('upload-payment','student',?,9900,'Paid')",args:[paper.contentId]});assert.equal(await mockEntitled("student",book),true);assert.equal(await mockEntitled("other-student",book),false);
 const attempt=await startExam("student",book,meta.title,questions,120);
 assert.equal(await completedMockPdf("student",attempt.id),null);assert.equal(await completedMockPdf("other-student",attempt.id),null);
 await finishExam("student",attempt.id,0,{1:2},[]);assert.deepEqual(await completedMockPdf("student",attempt.id),{key:"study-materials/upsc/tests/version-one.pdf",book,filename:"Test-paper.pdf"});assert.equal(await completedMockPdf("other-student",attempt.id),null);
 const replacement=await stageMock("admin","test-upload",{...meta,title:"Replacement paper"},"study-materials/upsc/tests/version-two.pdf",questions);await publishMock("admin",replacement,questions);
 assert.equal((await completedMockPdf("student",attempt.id))?.key,"study-materials/upsc/tests/version-one.pdf");assert.equal((await mockPaper(replacement))?.storageKey,"study-materials/upsc/tests/version-two.pdf");
 await assert.rejects(()=>publishMock("admin",replacement,questions),/draft/);
});
test("published free uploads are available without a payment, drafts are not",async()=>{
 const questions=parseMockText(sample,2).questions;const book=await stageMock("admin","free-upload",{title:"Free paper",summary:"A two question free test.",body:"",exam:"APPSC",language:"English",price:0,minutes:3,expected:2},"study-materials/appsc/tests/free.pdf",questions);
 assert.equal(await mockEntitled("reader",book),false);await publishMock("admin",book,questions);assert.equal(await mockEntitled("reader",book),true);
});
