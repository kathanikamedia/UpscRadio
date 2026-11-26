
import {Localized} from "@/components/localized";
import {cache,Suspense} from "react";
import {CourseLibrary,type LibraryCourse} from "./course-library";
import {moodle,moodleConfigured} from "@/lib/moodle";
import {moodleIdentity} from "@/lib/identity";
import {starterProgress} from "@/lib/course-progress";
import {FREE_COURSE_TITLE,FREE_LEARNING_URL,starterLessons} from "@/lib/free-course";
import {execute} from "@/lib/db";
type Course={id:number;fullname:string;progress?:number};
// Request-only deduplication; no shared cross-user cache of private student data.
const nativeLearning=cache(async(userId:string)=>{
 const [starter,result]=await Promise.all([starterProgress(userId),execute({sql:"SELECT DISTINCT c.id,c.slug,c.title,c.summary,c.category,c.extra FROM payments p JOIN content c ON c.id=p.course_id WHERE p.clerk_id=? AND p.status='Paid' AND (json_extract(c.extra,'$.question_bank') IS NOT NULL OR json_extract(c.extra,'$.delivery')='native')",args:[userId]})]);
 return {starter,owned:result.rows};
});
const legacyLearning=cache(async(userId:string)=>{
 if(!moodleConfigured)return {courses:[] as Course[],problem:false};
 try{const mid=await moodleIdentity(userId);return {courses:mid?await moodle<Course[]>("core_enrol_get_users_courses",{userid:mid}):[],problem:false};}
 catch{return {courses:[] as Course[],problem:true};}
});
export async function EnrolledCount({userId}:{userId:string}){
 const [native,legacy]=await Promise.all([nativeLearning(userId),legacyLearning(userId)]);
 return <strong>{legacy.problem?"—":legacy.courses.length+native.owned.length+(native.starter.enrolled?1:0)}</strong>;
}
async function LegacyCourses({userId}:{userId:string}){
 const {courses,problem}=await legacyLearning(userId);
 const items:LibraryCourse[]=courses.map(course=>({key:"moodle-"+course.id,title:course.fullname,summary:"Return to your lessons, activities and assessments.",category:"Course",href:"/student/course/"+course.id,enrolled:true,progress:typeof course.progress==="number"?Math.max(0,Math.min(100,Math.round(course.progress))):undefined}));
 return <Localized>{problem?<p role="status">Some programmes couldn’t be loaded. Please try again shortly.</p>:items.length?<CourseLibrary courses={items} workspace/>:null}</Localized>;
}
export async function LearningCourses({userId}:{userId:string}){
 const {starter,owned}=await nativeLearning(userId);
 const items:LibraryCourse[]=[
  ...(starter.enrolled?[{key:"starter",title:FREE_COURSE_TITLE,summary:"Your foundation for a more focused UPSC journey.",category:"Getting started",href:FREE_LEARNING_URL,free:true,enrolled:true,lessons:starterLessons.length,minutes:15,progress:Math.round(starter.completed.size/starterLessons.length*100)}]:[]),
  ...owned.map(row=>{const extra=JSON.parse(String(row.extra));return {key:"native-"+row.id,title:String(row.title),summary:String(row.summary),category:String(row.category),href:extra.question_bank?`/student/exam/${extra.question_bank}/`:`/courses/${row.slug}/`,enrolled:true};}),
 ];
 return <Localized><>{items.length||!moodleConfigured?<CourseLibrary courses={items} workspace/>:null}{moodleConfigured?<Suspense fallback={<p role="status">Loading additional programmes…</p>}><LegacyCourses userId={userId}/></Suspense>:null}</></Localized>;
}
