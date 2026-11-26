export const UPSC_RULES_URL="https://upsc.gov.in/uploads/2026/05/Civil-Services-Preliminary-Examination-2026-Notice-E.pdf";
export const examModes=["practice","upsc-gs1","upsc-csat"] as const;
export type ExamMode=typeof examModes[number];
export type ExamRules={mode:ExamMode;label:string;marksPerQuestion:number;seconds:number;questionCount:number;maximum:number;qualifyingMarks:number|null;source:string};
// Subject mocks have no UPSC-mandated duration. Recommend the equivalent full-paper
// pace (120m/100 GS questions, 120m/80 CSAT questions), rounded up to whole minutes.
export function recommendedPracticeMinutes(count:number,subject:"general-studies"|"csat"="general-studies"){
 if(!Number.isInteger(count)||count<1||count>700)throw Error("Invalid question count.");
 return Math.ceil(count*(subject==="csat"?90:72)/60);
}
export function defaultPracticeSeconds(book:string,count:number){return book==="free-polity"?900:recommendedPracticeMinutes(count)*60;}
export function examRules(mode:ExamMode,count:number,seconds:number):ExamRules{
 if(!examModes.includes(mode)||!Number.isInteger(count)||count<1||count>700||!Number.isInteger(seconds)||seconds<60||seconds>50400)throw Error("Invalid test pattern or duration.");
 if(mode!=="practice"&&(count!==(mode==="upsc-gs1"?100:80)||seconds!==7200))throw Error(mode==="upsc-gs1"?"GS Paper I requires exactly 100 questions and 120 minutes.":"CSAT requires exactly 80 questions and 120 minutes.");
 const marksPerQuestion=mode==="upsc-csat"?2.5:2;
 return {mode,label:mode==="upsc-gs1"?"UPSC Prelims · GS Paper I":mode==="upsc-csat"?"UPSC Prelims · CSAT (GS Paper II)":"Subject practice · GS-I marking",marksPerQuestion,seconds,questionCount:count,maximum:count*marksPerQuestion,qualifyingMarks:mode==="upsc-csat"?66:null,source:UPSC_RULES_URL};
}
export function penaltyLabel(rules:ExamRules){return rules.marksPerQuestion===2.5?"⅚":"⅔";}
