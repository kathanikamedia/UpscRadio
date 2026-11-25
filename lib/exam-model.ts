export type ExamQuestion={number:number;question:string;options:string[];answer:number;explanation:string};
export type ExamAnswers=Record<string,number>;
export type ExamReview={correct:number;wrong:number;unanswered:number;marks:number;maximum:number;questions:(ExamQuestion&{selected?:number})[]};
export type ExamSession={id:string;title:string;started:number;deadline:number;serverNow:number;revision:number;questions:Omit<ExamQuestion,"answer"|"explanation">[];answers:ExamAnswers;marked:number[];result:ExamReview|null};
export function validateExamInput(questions:ExamQuestion[],answers:ExamAnswers,marked:number[]){
 if(!answers||typeof answers!=="object"||Array.isArray(answers)||!Array.isArray(marked)||Object.keys(answers).length>questions.length||marked.length>questions.length)throw Error("Invalid exam answers.");
 const numbers=new Set(questions.map(q=>String(q.number)));
 if(Object.entries(answers).some(([key,value])=>!numbers.has(key)||!Number.isInteger(value)||value<0||value>3)||marked.some(n=>!Number.isInteger(n)||!numbers.has(String(n))))throw Error("Invalid question or option.");
}
export function scoreExam(questions:ExamQuestion[],answers:ExamAnswers):ExamReview{
 validateExamInput(questions,answers,[]);
 const correct=questions.filter(q=>answers[q.number]===q.answer).length;
 const wrong=Object.keys(answers).length-correct;
 return {correct,wrong,unanswered:questions.length-correct-wrong,marks:Math.round((correct*2-wrong*2/3)*100)/100,maximum:questions.length*2,questions:questions.map(q=>({...q,selected:answers[q.number]}))};
}
