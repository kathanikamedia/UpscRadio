"use server";
import {requireUser} from "@/lib/auth";
import {redirect} from "next/navigation";
export async function enrolFree(_state:string,_data:FormData):Promise<string>{
 await requireUser("/student/exam/free-polity/");
 redirect("/student/exam/free-polity/");
}
