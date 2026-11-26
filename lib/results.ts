import {execute} from "./db";
export type AttemptPoint={id:string;submitted:number;percent:number;marks:number;maximum:number;accuracy:number|null};
export type TestResult={book:string;title:string;attempts:AttemptPoint[];best:number;latest:number;average:number;percentile:number|null;participants:number};
const pct=(marks:number,maximum:number)=>maximum>0?Math.round(Math.max(0,marks)/maximum*1000)/10:0;
/** Percentile among each learner's best score on the same test; hidden until enough people have taken it. */
export function percentileOf(score:number,others:number[]){if(others.length<5)return null;const below=others.filter(value=>value<score).length,equal=others.filter(value=>value===score).length;return Math.round((below+equal/2)/others.length*100);}
export async function studentResults(user:string){
 const rows=(await execute({sql:"SELECT id,book,title,submitted,json_extract(result,'$.marks') AS marks,json_extract(result,'$.maximum') AS maximum,json_extract(result,'$.accuracy') AS accuracy FROM exam_attempts WHERE clerk_id=? AND submitted IS NOT NULL ORDER BY submitted",args:[user]})).rows;
 const byBook=new Map<string,TestResult>();
 for(const row of rows){
  const book=String(row.book),point={id:String(row.id),submitted:Number(row.submitted),marks:Number(row.marks),maximum:Number(row.maximum),percent:pct(Number(row.marks),Number(row.maximum)),accuracy:row.accuracy===null?null:Number(row.accuracy)};
  const entry=byBook.get(book)||{book,title:String(row.title),attempts:[],best:0,latest:0,average:0,percentile:null,participants:0};
  entry.attempts.push(point);byBook.set(book,entry);
 }
 const tests=[...byBook.values()];
 if(tests.length){
  const peers=(await execute({sql:`SELECT book,clerk_id,MAX(CAST(json_extract(result,'$.marks') AS REAL)/NULLIF(CAST(json_extract(result,'$.maximum') AS REAL),0)) AS best FROM exam_attempts WHERE submitted IS NOT NULL AND book IN (${tests.map(()=>"?").join(",")}) GROUP BY book,clerk_id`,args:tests.map(test=>test.book)})).rows;
  for(const test of tests){
   const scores=test.attempts.map(a=>a.percent);
   test.best=Math.max(...scores);test.latest=scores[scores.length-1];test.average=Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10)/10;
   const others=peers.filter(p=>String(p.book)===test.book).map(p=>Math.round(Math.max(0,Number(p.best))*1000)/10);
   test.participants=others.length;test.percentile=percentileOf(test.best,others);
  }
 }
 const all=tests.flatMap(test=>test.attempts),accuracies=all.map(a=>a.accuracy).filter((a):a is number=>a!==null);
 return {
  tests:tests.sort((a,b)=>b.attempts[b.attempts.length-1].submitted-a.attempts[a.attempts.length-1].submitted),
  totalAttempts:all.length,
  average:all.length?Math.round(all.reduce((a,b)=>a+b.percent,0)/all.length*10)/10:null,
  best:all.length?Math.max(...all.map(a=>a.percent)):null,
  accuracy:accuracies.length?Math.round(accuracies.reduce((a,b)=>a+b,0)/accuracies.length):null,
  weakest:[...tests].filter(test=>test.average<60).sort((a,b)=>a.average-b.average).slice(0,3),
 };
}
