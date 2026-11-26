
import {Localized} from "@/components/localized";
import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { CourseDetail } from "@/components/course-detail";
import { LearningActivity } from "@/components/learning-activity";
import { identity } from "@/lib/auth";
import { starterProgress, starterActivity } from "@/lib/course-progress";
import { FREE_COURSE_TITLE, FREE_LEARNING_URL, starterLessons } from "@/lib/free-course";
import { joinStarter } from "@/app/student/free-course/actions";
export const metadata={title:"Free UPSC Preparation Starter Course"};
export const dynamic="force-dynamic";
export default async function StarterCourse(){
 const user=await identity();
 const [progress,events]=await Promise.all([user?starterProgress(user):null,user?starterActivity(user):[]]);
 return <Localized>{<CourseDetail title={FREE_COURSE_TITLE} summary="A clearer first step towards your UPSC goal. Understand the exam, build a realistic routine and learn how to review your practice." category="Getting started" free duration="About 15 minutes · 3 lessons" language="English" body="Your ambition deserves a practical starting point. This introductory course helps you understand the examination, plan a repeatable study routine and turn practice into useful revision. Each short reading lesson includes an activity you can put into action today." sections={starterLessons.map(lesson=>({title:lesson.title,description:lesson.introduction+"\n\nYour activity: "+lesson.task,minutes:lesson.minutes}))} progress={progress?.enrolled?Math.round(progress.completed.size/starterLessons.length*100):undefined} actions={<>{progress?.enrolled?<Link className="button" href={FREE_LEARNING_URL}>Continue learning ↗</Link>:<ActionForm action={joinStarter} label={user?"Get started free":"Sign in to start free"}><></></ActionForm>}{user?<LearningActivity events={events} completed={progress?.completed.size||0} total={starterLessons.length}/>:null}</>}><div className="course-outcomes"><h3>A small course. A useful first step.</h3><p>Three focused lessons, practical activities and progress saved to your account. Read at your own pace and return whenever you need a reset.</p></div></CourseDetail>}</Localized>;
}
