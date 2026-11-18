import { cache } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { moodle, moodleConfigured } from "@/lib/moodle";
import { moodleIdentity } from "@/lib/identity";
type Course={id:number;fullname:string;progress?:number};
const learning=cache(async(userId:string)=>{
 let courses:Course[]=[];
 if(moodleConfigured){try{const mid=await moodleIdentity(userId);if(mid)courses=await moodle<Course[]>("core_enrol_get_users_courses",{userid:mid});}catch{return {courses,problem:true};}}
 return {courses,problem:false};
});
export async function EnrolledCount({userId}:{userId:string}){const result=await learning(userId);return <strong>{result.problem?"—":result.courses.length}</strong>;}
export async function LearningCourses({userId}:{userId:string}){const {courses,problem}=await learning(userId);return <>{problem?<p role="status">Your courses could not be loaded. Please try again shortly.</p>:null}<div className="grid">{courses.map(course=><article className="card" key={course.id}><h3>{course.fullname}</h3>{typeof course.progress==="number"?<><p>{Math.round(course.progress)}% complete</p><progress value={course.progress} max={100} aria-label={course.fullname+" progress"}/></>:null}<Link className="button" href={"/student/course/"+course.id}>Continue learning</Link></article>)}</div>{!problem&&!courses.length?<div className="dashboard-empty"><BookOpen aria-hidden="true"/><p>Your enrolled programmes will appear here.</p><Link href="/courses/">Find your next course ↗</Link></div>:null}</>;}
