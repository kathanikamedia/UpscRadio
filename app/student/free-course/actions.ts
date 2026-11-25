"use server";
import { requireUser } from "@/lib/auth";
import { enrolStarter, completeStarterLesson } from "@/lib/course-progress";
import { FREE_LEARNING_URL, starterLessons } from "@/lib/free-course";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function joinStarter(_state:string,_data:FormData) {
  const user=await requireUser(FREE_LEARNING_URL);
  try { await enrolStarter(user); } catch { return "We couldn’t start your course. Please try again."; }
  revalidatePath("/student/");
  redirect(FREE_LEARNING_URL);
}
export async function finishLesson(_state:string,data:FormData) {
  const user=await requireUser(FREE_LEARNING_URL);
  const slug=String(data.get("lesson")||"");
  const index=starterLessons.findIndex(lesson=>lesson.slug===slug);
  if(index<0)return "This lesson could not be found.";
  try { await completeStarterLesson(user,slug); } catch { return "Your progress couldn’t be saved. Please try again."; }
  revalidatePath("/student/");
  revalidatePath(FREE_LEARNING_URL);
  redirect(FREE_LEARNING_URL+"?lesson="+(starterLessons[index+1]?.slug||slug));
}
