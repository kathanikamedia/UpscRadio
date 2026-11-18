import test from "node:test";
import assert from "node:assert/strict";
import { parsePapers } from "../lib/upsc-parser";
const table = (year:number, names=["GS I","GS II","Essay"]) => '<table><caption>Civil Services (Main) Examination, '+year+'</caption><tr><td><ul>'+names.map((name,i)=>'<li>'+name+'<a href="/sites/default/files/'+year+'-'+i+'.pdf">(1.8 MB)</a></li>').join("")+'</ul></td></tr></table>';
test("uses the first two papers from the latest Mains listing",()=>{
 const parsed=parsePapers('<table><caption>Another exam</caption></table>'+table(2027)+table(2026));
 assert.equal(parsed.examination,"Civil Services (Main) Examination, 2027");
 assert.deepEqual(parsed.papers.map(p=>p.title),["GS I","GS II"]);
 assert.equal(parsed.papers[0].size,"1.8 MB");
 assert.match(parsed.papers[0].url,/2027-0.pdf$/);
});
test("changes when UPSC changes the source ordering",()=>{
 assert.deepEqual(parsePapers(table(2028,["Essay","New GS","Other"])).papers.map(p=>p.title),["Essay","New GS"]);
});
test("rejects untrusted download URLs and missing source sections",()=>{
 assert.throws(()=>parsePapers(table(2027).replaceAll('href="/sites','href="https://example.com/sites')));
 assert.throws(()=>parsePapers("<h1>Service unavailable</h1>"));
});
