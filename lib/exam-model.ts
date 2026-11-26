export type ExamQuestion={number:number;question:string;options:string[];answer:number;explanation:string};
export type ExamAnswers=Record<string,number>;
export type ExamReview={correct:number;wrong:number;unanswered:number;marks:number;maximum:number;earned:number;penalty:number;accuracy:number|null;qualified:boolean|null;questions:(ExamQuestion&{selected?:number})[]};
export type ExamSession={id:string;title:string;started:number;deadline:number;submitted:number|null;serverNow:number;revision:number;rules:ExamRules;questions:Omit<ExamQuestion,"answer"|"explanation">[];answers:ExamAnswers;marked:number[];result:ExamReview|null};
export function validateExamInput(questions:ExamQuestion[],answers:ExamAnswers,marked:number[]){
 if(!answers||typeof answers!=="object"||Array.isArray(answers)||!Array.isArray(marked)||Object.keys(answers).length>questions.length||marked.length>questions.length)throw Error("Invalid exam answers.");
 const numbers=new Set(questions.map(q=>String(q.number)));
 if(Object.entries(answers).some(([key,value])=>!numbers.has(key)||!Number.isInteger(value)||value<0||value>3)||marked.some(n=>!Number.isInteger(n)||!numbers.has(String(n))))throw Error("Invalid question or option.");
}
export function scoreExam(questions:ExamQuestion[],answers:ExamAnswers,rules:ExamRules=examRules("practice",questions.length,900)):ExamReview{
 validateExamInput(questions,answers,[]);
 const checked=examRules(rules.mode,questions.length,rules.seconds);
 const correct=questions.filter(q=>answers[q.number]===q.answer).length;
 const wrong=Object.keys(answers).length-correct;
 // Keep thirds exact through the calculation; round only the final displayed totals.
 const raw=(correct*3-wrong)*checked.marksPerQuestion/3,round=(n:number)=>Math.round(n*100)/100;
 return {correct,wrong,unanswered:questions.length-correct-wrong,marks:round(raw),maximum:checked.maximum,earned:correct*checked.marksPerQuestion,penalty:round(wrong*checked.marksPerQuestion/3),accuracy:correct+wrong?round(correct/(correct+wrong)*100):null,qualified:checked.qualifyingMarks===null?null:raw>=checked.qualifyingMarks,questions:questions.map(q=>({...q,selected:answers[q.number]}))};
}
import {examRules,type ExamRules} from "./exam-rules";
