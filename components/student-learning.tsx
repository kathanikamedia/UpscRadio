
import {Localized} from "@/components/localized";
import { cache } from "react";
import Link from "next/link";
import { CourseLibrary, type LibraryCourse } from "./course-library";
import { moodle, moodleConfigured } from "@/lib/moodle";
import { moodleIdentity } from "@/lib/identity";
import { starterProgress } from "@/lib/course-progress";
import { FREE_COURSE_TITLE, FREE_LEARNING_URL, starterLessons } from "@/lib/free-course";
import {execute} from "@/lib/db";
type Course={id:number;fullname:string;progress?:number};
const learning=cache(async(userId:string)=>{
 let courses:Course[]=[];
 if(moodleConfigured){try{const mid=await moodleIdentity(userId);if(mid)courses=await moodle<Course[]>("core_enrol_get_users_courses",{userid:mid});}catch{const starter=await starterProgress(userId);return {courses,problem:true,starter};}}
 const starter=await starterProgress(userId);return {courses,problem:false,starter};
});
const nativeLearning=cache(async(userId:string)=>(await execute({sql:"SELECT DISTINCT c.id,c.slug,c.title,c.summary,c.category,c.extra FROM payments p JOIN content c ON c.id=p.course_id WHERE p.clerk_id=? AND p.status='Paid' AND (json_extract(c.extra,'$.question_bank') IS NOT NULL OR json_extract(c.extra,'$.delivery')='native')",args:[userId]})).rows);
export async function EnrolledCount({userId}:{userId:string}){const [result,native]=await Promise.all([learning(userId),nativeLearning(userId)]);return <Localized>{<strong>{result.problem?"—":result.courses.length+native.length+(result.starter.enrolled?1:0)}</strong>}</Localized>;}
export async function LearningCourses({userId}:{userId:string}){
 const {courses,problem,starter}=await learning(userId);
 const native=await nativeLearning(userId);
 const items:LibraryCourse[]=[
  ...(starter.enrolled?[{key:"starter",title:FREE_COURSE_TITLE,summary:"Your foundation for a more focused UPSC journey.",category:"Getting started",href:FREE_LEARNING_URL,free:true,enrolled:true,lessons:starterLessons.length,minutes:15,progress:Math.round(starter.completed.size/starterLessons.length*100)}]:[]),
  ...courses.map(course=>({key:"moodle-"+course.id,title:course.fullname,summary:"Return to your lessons, activities and assessments.",category:"Course",href:"/student/course/"+course.id,enrolled:true,progress:typeof course.progress==="number"?Math.max(0,Math.min(100,Math.round(course.progress))):undefined})),
  ...native.map(row=>{const extra=JSON.parse(String(row.extra));return {key:"native-"+row.id,title:String(row.title),summary:String(row.summary),category:String(row.category),href:extra.question_bank?`/student/exam/${extra.question_bank}/`:`/courses/${row.slug}/`,enrolled:true};}),
 ];
 return <Localized>{<>{problem?<p role="status">Some programmes couldn’t be loaded. Please try again shortly.</p>:null}<CourseLibrary courses={items} workspace/></>}</Localized>;
}
