import { readFile } from "node:fs/promises";
import { getDatabase, initialize, closeDatabase } from "../lib/db";
import { databaseConfig } from "../lib/database-config.mjs";

const books=["economy-1","economy-2","economy-3","economy-4","environment-1","environment-2","environment-3"];
try {
 if(process.argv.includes("--hosted")&&databaseConfig().url.startsWith("file:"))throw Error("Hosted database required.");
 const data=await Promise.all(books.map(async book=>({book,data:JSON.parse(await readFile(`private/practice-review/${book}.json`,"utf8"))})));
 for(const {book,data:bank} of data){
  if(bank.review_required!==true||bank.missing.length||bank.candidates.length!==bank.expected)throw Error(`Incomplete extraction: ${book}`);
  if(new Set(bank.candidates.map((q:{number:number})=>q.number)).size!==bank.expected)throw Error(`Duplicate question: ${book}`);
 }
 if(!process.argv.includes("--write")){console.log("Seven question banks validated structurally. Dry run only.");}
 else {
  await initialize();
  for(const {book,data:bank} of data){
   const feedback=bank.candidates.filter((q:{explanation?:string})=>q.explanation);
   for(let i=0;i<feedback.length;i+=50)await getDatabase().batch(feedback.slice(i,i+50).map((q:{number:number;explanation:string})=>({sql:"INSERT INTO question_explanations(book_slug,question_number,explanation) VALUES (?,?,?) ON CONFLICT(book_slug,question_number) DO NOTHING",args:[book,q.number,q.explanation]})),"write");
   for(let i=0;i<bank.candidates.length;i+=50){
    await getDatabase().batch(bank.candidates.slice(i,i+50).map((q:{number:number;question:string;options:string[];answer:string})=>({sql:"INSERT INTO question_drafts(book_slug,question_number,question,options,answer,reviewed) VALUES (?,?,?,?,?,0) ON CONFLICT(book_slug,question_number) DO NOTHING",args:[book,q.number,q.question,JSON.stringify(q.options),q.answer]})),"write");
   }
  }
  console.log("Imported question candidates as unpublished, unreviewed drafts. Existing questions were preserved.");
 }
}catch(error){console.error(error instanceof Error?error.message:"Import failed");process.exitCode=1;}finally{closeDatabase();}
