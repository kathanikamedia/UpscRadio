import {randomUUID} from "node:crypto";
import {execute,getDatabase,initialize} from "./db";
import {validateMockQuestions} from "./mock-pdf-parser";
import type {ExamQuestion} from "./exam-model";
import {examRules,type ExamMode} from "./exam-rules";
export type MockMetadata={title:string;summary:string;body:string;exam:string;language:string;price:number;minutes:number;expected:number;mode?:ExamMode};
export async function mockPaper(book:string){const row=(await execute({sql:"SELECT m.*,c.published,c.extra FROM mock_papers m JOIN content c ON c.id=m.content_id WHERE m.book=?",args:[book]})).rows[0];if(!row)return null;return {book:String(row.book),contentId:Number(row.content_id),title:String(row.title),storageKey:String(row.storage_key),questions:JSON.parse(String(row.questions)) as ExamQuestion[],seconds:Number(row.seconds),status:String(row.status),published:Boolean(row.published),metadata:JSON.parse(String(row.metadata)) as MockMetadata};}
export async function mockEntitled(user:string,book:string){const row=(await execute({sql:"SELECT c.extra,EXISTS(SELECT 1 FROM payments p WHERE p.clerk_id=? AND p.course_id=c.id AND p.status='Paid') AS owned FROM mock_papers m JOIN content c ON c.id=m.content_id WHERE m.book=? AND m.status='published' AND c.published=1",args:[user,book]})).rows[0];return Boolean(row&&(Number(JSON.parse(String(row.extra)).price_paise||0)===0||Number(row.owned)===1));}
export async function stageMock(admin:string,slug:string,metadata:MockMetadata,key:string,questions:ExamQuestion[]){
 await initialize();const tx=await getDatabase().transaction("write");const book="mock-"+randomUUID();
 try{
  await tx.execute({sql:"INSERT INTO content(kind,slug,title,summary,body,category,published,extra) VALUES ('course',?,?,?,?, 'Test Series',0,'{}') ON CONFLICT(kind,slug) DO NOTHING",args:[slug,metadata.title,metadata.summary,metadata.body]});
  const target=(await tx.execute({sql:"SELECT id,category FROM content WHERE kind='course' AND slug=?",args:[slug]})).rows[0];if(!target||target.category!=="Test Series")throw Error("That URL name belongs to another course.");
  await tx.execute({sql:"INSERT INTO mock_papers(book,content_id,title,storage_key,questions,seconds,metadata,status) VALUES (?,?,?,?,?,?,?,'draft')",args:[book,Number(target.id),metadata.title,key,JSON.stringify(questions),metadata.minutes*60,JSON.stringify(metadata)]});
  await tx.execute({sql:"INSERT INTO audit(actor,action) VALUES (?,?)",args:[admin,`Uploaded mock PDF draft ${book}`]});await tx.commit();return book;
 }catch(error){await tx.rollback();throw error;}finally{tx.close();}
}
export async function publishMock(admin:string,book:string,questions:unknown){
 const paper=await mockPaper(book);if(!paper||paper.status!=="draft")throw Error("Open an unpublished upload draft first.");const verified=validateMockQuestions(questions,paper.metadata.expected);
 const rules=examRules(paper.metadata.mode||"practice",verified.length,paper.seconds);if(rules.mode!=="practice"&&paper.metadata.exam!=="UPSC")throw Error("UPSC full-paper presets can only be used for UPSC tests.");
 await initialize();const tx=await getDatabase().transaction("write");
 try{
  const old=(await tx.execute({sql:"SELECT extra FROM content WHERE id=?",args:[paper.contentId]})).rows[0];const extra=JSON.parse(String(old.extra));
  const v=paper.metadata;const metadata={...extra,question_bank:book,question_count:verified.length,exam:v.exam,language:v.language,price_paise:v.price,duration_minutes:v.minutes,paper_mode:v.mode||"practice",download_after_attempt:false,purchase_enabled:false,preparation:false,demo:false,pdf_uploaded:true};
  const update=await tx.execute({sql:"UPDATE mock_papers SET questions=?,status='published' WHERE book=? AND status='draft'",args:[JSON.stringify(verified),book]});if(!update.rowsAffected)throw Error("This draft was already published.");
  await tx.execute({sql:"UPDATE content SET title=?,summary=?,body=?,published=1,extra=? WHERE id=?",args:[v.title,v.summary,v.body,JSON.stringify(metadata),paper.contentId]});
  await tx.execute({sql:"INSERT INTO audit(actor,action) VALUES (?,?)",args:[admin,`Published mock PDF and MCQs ${book}`]});await tx.commit();
 }catch(error){await tx.rollback();throw error;}finally{tx.close();}
}
export async function attemptMockPdf(user:string,id:string){
 const attempt=(await execute({sql:"SELECT book,title,submitted FROM exam_attempts WHERE id=? AND clerk_id=?",args:[id,user]})).rows[0];
 if(!attempt)return null;
 return mockPdf(String(attempt.book),String(attempt.title));
}
export async function mockPdf(book:string,title?:string){
 const paper=await mockPaper(book);
 const name=title||paper?.title||book;
 const filename=(name.normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-|-$/g,"").slice(0,140)||"mock-test")+".pdf";
 if(paper)return paper.status==="published"?{key:paper.storageKey,book:paper.book,filename}:null;
 const legacy:Record<string,string>={"economy-1":"economy-part-1","economy-2":"economy-part-2","economy-3":"economy-part-3","economy-4":"economy-part-4","environment-1":"environment-part-1","environment-2":"environment-part-2","environment-3":"environment-part-3","current-affairs-english":"ap-current-affairs-bit-bank-2026-english"};
 const slug=legacy[book];if(!slug)return null;
 const row=(await execute({sql:"SELECT extra FROM content WHERE kind='resource' AND slug=?",args:[slug]})).rows[0];const key=row?JSON.parse(String(row.extra)).storage_key:undefined;
 return typeof key==="string"?{key,book,filename}:null;
}
