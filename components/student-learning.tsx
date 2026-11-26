
import {Localized} from "@/components/localized";
import { cache } from "react";
import Link from "next/link";
import { CourseLibrary, type LibraryCourse } from "./course-library";
import { moodle, moodleConfigured } from "@/lib/moodle";
import { moodleIdentity } from "@/lib/identity";
import { starterProgress } from "@/lib/course-progress";
import { FREE_COURSE_TITLE, FREE_LEARNING_URL, starterLessons } from "@/lib/free-course";
type Course={id:number;fullname:string;progress?:number};
const learning=cache(async(userId:string)=>{
 let courses:Course[]=[];
 if(moodleConfigured){try{const mid=await moodleIdentity(userId);if(mid)courses=await moodle<Course[]>("core_enrol_get_users_courses",{userid:mid});}catch{const starter=await starterProgress(userId);return {courses,problem:true,starter};}}
 const starter=await starterProgress(userId);return {courses,problem:false,starter};
});
export async function EnrolledCount({userId}:{userId:string}){const result=await learning(userId);return <Localized>{<strong>{result.problem?"—":result.courses.length+(result.starter.enrolled?1:0)}</strong>}</Localized>;}
export async function LearningCourses({userId}:{userId:string}){
 const {courses,problem,starter}=await learning(userId);
 const items:LibraryCourse[]=[
  ...(starter.enrolled?[{key:"starter",title:FREE_COURSE_TITLE,summary:"Your foundation for a more focused UPSC journey.",category:"Getting started",href:FREE_LEARNING_URL,free:true,enrolled:true,lessons:starterLessons.length,minutes:15,progress:Math.round(starter.completed.size/starterLessons.length*100)}]:[]),
  ...courses.map(course=>({key:"moodle-"+course.id,title:course.fullname,summary:"Return to your lessons, activities and assessments.",category:"Course",href:"/student/course/"+course.id,enrolled:true,progress:typeof course.progress==="number"?Math.max(0,Math.min(100,Math.round(course.progress))):undefined})),
 ];
 return <Localized>{<>{problem?<p role="status">Some programmes couldn’t be loaded. Please try again shortly.</p>:null}<CourseLibrary courses={items} workspace/></>}</Localized>;
}
