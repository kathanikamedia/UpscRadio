"use server";
import { requireUser } from "@/lib/auth";
import { content, execute } from "@/lib/db";
import { FREE_MOCK_SLUG } from "@/lib/mock-tests";
import { moodle, moodleConfigured } from "@/lib/moodle";
import { moodleIdentity } from "@/lib/identity";
import { redirect } from "next/navigation";
export async function enrolFree(_state:string,_data:FormData){
 const user=await requireUser();
 const test=await content("course",FREE_MOCK_SLUG);
 const courseId=Number(test?.extra.moodle_course_id);
 if(!test||!moodleConfigured||!courseId)return "The free mock is being prepared. It will be available here when learning access opens.";
 try{
  const moodleId=await moodleIdentity(user,true);
  await moodle("enrol_manual_enrol_users",{"enrolments[0][roleid]":5,"enrolments[0][userid]":moodleId!,"enrolments[0][courseid]":courseId});
  await execute({sql:"INSERT INTO audit(actor,action) VALUES (?,?)",args:[user,"Enrolled in free introductory mock"]});
 }catch{return "The learning platform could not open your test. Please try again shortly.";}
 redirect("/student/course/"+courseId);
}
