import type {ExamQuestion} from "./exam-model";
const tidy=(text:string)=>text.replace(/\r/g,"").replace(/\u00a0/g," ").replace(/[ \t]+\n/g,"\n").trim();
const explanationText=(text:string)=>tidy(text).replace(/\n\s*\n(?:[A-Z][^\n.!?;:]{0,100}\n?){1,3}$/,"").trim();
export function parseMockText(source:string,expected:number){
 if(!Number.isInteger(expected)||expected<1||expected>700)throw Error("Set the expected question count between 1 and 700.");
 const text=tidy(source).replace(/^.*@APPSCExamEdge.*$|^Join t\.me\/APPSCExamEdge.*$|^Page \d+(?: of \d+)?\s*$|^AP Current Affairs Bit Bank 2026 \| Page \d+.*$/gim,"");
 const keyStart=/^\s*Answer\s+Key(?:\s*(?:and|with|&)\s+Explanations?)?\s*$/im.exec(text);
 let body=keyStart?text.slice(0,keyStart.index):text;
 const section=/^SECTION\s+1\s*$/m.exec(body);if(section)body=body.slice(section.index);
 const feedback=keyStart?text.slice(keyStart.index):"",keys=new Map<number,Set<number>>();
 for(const match of feedback.matchAll(/\b(\d{1,3})[.)]\s*\(([a-d])\)/gi)){const number=Number(match[1]);const set=keys.get(number)||new Set<number>();set.add(match[2].toLowerCase().charCodeAt(0)-97);keys.set(number,set);}
 const explanations=new Map<number,string>();
 const notes=[...feedback.matchAll(/^\s*(\d{1,3})[.)]\s*\(([a-d])\)\s+([^\n]+)/gim)];
 notes.forEach((match,i)=>{let value=feedback.slice(match.index!+match[0].length-match[3].length,notes[i+1]?.index??feedback.length);value=value.split(/^\s*\d+\.\s+[A-Z].*\(Q\s*\d/m)[0];if(!/\d+[.)]\s*\([a-d]\)/i.test(value))explanations.set(Number(match[1]),tidy(value));});
 const grouped=[...text.matchAll(/^\s*Answers?\s+and\s+Explanations?\s*$/gim)];
 grouped.forEach((group,groupIndex)=>{
  const start=group.index!+group[0].length,limit=grouped[groupIndex+1]?.index??text.length;
  const candidate=text.slice(start,limit),entries=[...candidate.matchAll(/^\s*(\d{1,3})[.)]\s*Answer\s*:\s*\(([a-d])\)\s*([^\n]*)/gim)];
  if(!entries.length)return;
  const last=entries.at(-1)!,tailStart=last.index!+last[0].length;
  const next=new RegExp(`^\\s*${Number(last[1])+1}[.)]\\s+(?!Answer\\s*:)`,"im").exec(candidate.slice(tailStart));
  const end=next?tailStart+next.index:candidate.length;
  entries.forEach((m,i)=>{const number=Number(m[1]),set=keys.get(number)||new Set<number>();set.add(m[2].toLowerCase().charCodeAt(0)-97);keys.set(number,set);explanations.set(number,explanationText(candidate.slice(m.index!+m[0].length-m[3].length,entries[i+1]?.index??end)));});
  body=body.replace(text.slice(group.index!,start+end),"\n");
 });
 const questions:ExamQuestion[]=[],issues:string[]=[];let position=0;
 for(let number=1;number<=expected;number++){
  const heading=new RegExp(`^\\s*${number}[.)]\\s+`,"m").exec(body.slice(position));
  if(!heading){issues.push(`Question ${number}: numbered question heading was not found.`);break;}
  const start=position+heading.index+heading[0].length,tail=body.slice(start);
  const labels=[...tail.matchAll(/(?<![\p{L}\p{N}])\(([a-d])\)\s+|^\s*([A-D])[.)]\s+/gimu)].slice(0,4);
  if(labels.length!==4||labels.map(m=>(m[1]||m[2]).toLowerCase()).join("")!=="abcd"){issues.push(`Question ${number}: four options labelled A–D could not be identified.`);break;}
  const afterD=start+labels[3].index!+labels[3][0].length;
  const next=new RegExp(`^\\s*${number+1}[.)]\\s+`,"m").exec(body.slice(afterD));
  const end=next?afterD+next.index:body.length;
  let block=body.slice(start,end).split(/^SECTION\s+\d+\s*$/m)[0];
  const answerMarker=/^\s*(?:Correct\s+)?Answer\s*[:：-]\s*\(?([a-d])\)?[.)]?/im.exec(block);
  const explanationMarker=/^\s*(?:Explanation|Reason)\s*[:：-]\s*/im.exec(block);
  const inlineAnswer=answerMarker?answerMarker[1].toLowerCase().charCodeAt(0)-97:undefined;
  const inlineExplanation=explanationMarker?tidy(block.slice(explanationMarker.index+explanationMarker[0].length)):"";
  if(answerMarker)block=block.slice(0,answerMarker.index);
  const answerSet=keys.get(number);let answer=inlineAnswer??(answerSet?.size===1?[...answerSet][0]:-1);
  if(answerSet&&((answerSet.size!==1)||(inlineAnswer!==undefined&&!answerSet.has(inlineAnswer))))answer=-1;
  const options=labels.map((label,i)=>tidy(block.slice(label.index!+label[0].length,i<3?labels[i+1].index:block.length)).replace(/\s+/g," "));
  const question=tidy(block.slice(0,labels[0].index));
  questions.push({number,question,options,answer,explanation:inlineExplanation||explanations.get(number)||""});
  if(answer<0)issues.push(`Question ${number}: answer key is missing or conflicting.`);
  if(!question||options.some(value=>!value))issues.push(`Question ${number}: question or option text is empty.`);
  if(!questions.at(-1)!.explanation)issues.push(`Question ${number}: add its explanation before publishing.`);
  position=end;
 }
 if(questions.length!==expected)issues.push(`Found ${questions.length} of ${expected} expected questions. Check the PDF layout or correct the draft.`);
 if(questions.length===expected&&new RegExp(`^\\s*${expected+1}[.)]\\s+`,"m").test(body.slice(position)))issues.push("The PDF contains additional questions. Check the expected question count.");
 return {questions,issues};
}
export function validateMockQuestions(value:unknown,expected:number):ExamQuestion[]{
 if(!Array.isArray(value)||value.length!==expected||expected<1||expected>700)throw Error("The question count must match the complete test.");
 return value.map((q,i)=>{
  if(!q||q.number!==i+1||typeof q.question!=="string"||!q.question.trim()||q.question.length>12000||!Array.isArray(q.options)||q.options.length!==4||q.options.some((o:unknown)=>typeof o!=="string"||!o.trim()||o.length>6000)||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||typeof q.explanation!=="string"||!q.explanation.trim()||q.explanation.length>18000)throw Error(`Question ${i+1}: check the question, four options, correct answer and explanation.`);
  return {number:i+1,question:q.question.trim(),options:q.options.map((s:string)=>s.trim()),answer:q.answer,explanation:q.explanation.trim()};
 });
}
export function validateMockDraft(value:unknown,expected:number):ExamQuestion[]{
 if(!Array.isArray(value)||value.length>expected||expected>700)throw Error("Invalid draft question count.");
 return value.map((q,i)=>{if(!q||q.number!==i+1||typeof q.question!=="string"||q.question.length>12000||!Array.isArray(q.options)||q.options.length!==4||q.options.some((o:unknown)=>typeof o!=="string"||o.length>6000)||!Number.isInteger(q.answer)||q.answer< -1||q.answer>3||typeof q.explanation!=="string"||q.explanation.length>18000)throw Error(`Check draft question ${i+1}.`);return {number:i+1,question:q.question,options:q.options,answer:q.answer,explanation:q.explanation};});
}
export async function extractMockPdf(bytes:Uint8Array,expected:number){
 if(bytes.length>4_000_000||Buffer.from(bytes.subarray(0,5)).toString()!=="%PDF-")throw Error("Choose a valid PDF under 4 MB.");
 const {getDocumentProxy,extractText}=await import("unpdf");
 const pdf=await getDocumentProxy(bytes,{isEvalSupported:false,useSystemFonts:false});
 try{if(pdf.numPages>400)throw Error("Split PDFs longer than 400 pages into separate tests.");const {text,totalPages}=await extractText(pdf);const first=text.findIndex(page=>/^\s*1[.)]\s/m.test(page)&&[...page.matchAll(/(?<![\p{L}\p{N}])\(([a-d])\)\s+|^\s*([A-D])[.)]\s+/gimu)].slice(0,4).map(m=>(m[1]||m[2]).toLowerCase()).join("")==="abcd");const source=text.slice(Math.max(0,first)).join("\n");if(source.length>3_000_000)throw Error("This PDF contains too much text. Split it into separate tests.");if(source.trim().length<100)return {questions:[],issues:["This PDF is scanned or has no readable question text. Enter the questions, options, correct answers and explanations in the draft, or upload a text-based PDF."],pages:totalPages};return {...parseMockText(source,expected),pages:totalPages};}finally{await pdf.destroy();}
}
