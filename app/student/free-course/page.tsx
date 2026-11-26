
import {Localized} from "@/components/localized";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { starterProgress, starterActivity } from "@/lib/course-progress";
import { LearningActivity } from "@/components/learning-activity";
import { FREE_COURSE_TITLE, FREE_COURSE_URL, FREE_LEARNING_URL, starterLessons } from "@/lib/free-course";
import { ActionForm } from "@/components/action-form";
import { finishLesson, joinStarter } from "./actions";
export const dynamic="force-dynamic";
export const metadata={title:"Learn · UPSC Preparation Starter",robots:{index:false,follow:false}};
export default async function StarterLearning({searchParams}:{searchParams:Promise<{lesson?:string}>}){
  const user=await requireUser(FREE_LEARNING_URL);
  const [progress,events]=await Promise.all([starterProgress(user),starterActivity(user)]);
  if(!progress.enrolled)return <Localized>{<section className="card"><p className="eyebrow">FREE COURSE</p><h1>{FREE_COURSE_TITLE}</h1><p>Three short lessons to turn your ambition into a practical starting plan.</p><ActionForm action={joinStarter} label="Start free course"><></></ActionForm><Link href={FREE_COURSE_URL}>View course details ↗</Link></section>}</Localized>;
  const query=await searchParams;
  const lesson=starterLessons.find(item=>item.slug===query.lesson)||starterLessons.find(item=>!progress.completed.has(item.slug))||starterLessons[0];
  const complete=progress.completed.size===starterLessons.length;
  return <Localized>{<div className="starter-learning"><header><LearningActivity events={events} completed={progress.completed.size} total={starterLessons.length}/><p className="eyebrow">YOUR FREE COURSE</p><h1>{FREE_COURSE_TITLE}</h1><p>{progress.completed.size} of {starterLessons.length} lessons complete</p><progress value={progress.completed.size} max={starterLessons.length} aria-label="Course progress"/></header>{complete?<div className="starter-complete" role="status"><strong>Course complete. Your next step is yours to choose.</strong><p>Revisit any lesson, explore study materials or practise with previous papers.</p><Link href="/resources/">Explore study materials ↗</Link></div>:null}<nav className="starter-lesson-nav" aria-label="Course lessons">{starterLessons.map((item,index)=><Link key={item.slug} href={FREE_LEARNING_URL+"?lesson="+item.slug} aria-current={lesson.slug===item.slug?"page":undefined}><span>{progress.completed.has(item.slug)?"✓":String(index+1).padStart(2,"0")}</span>{item.title}</Link>)}</nav><article className="card starter-lesson"><p className="eyebrow">{lesson.minutes} MIN READ</p><h2>{lesson.title}</h2><p className="starter-lead">{lesson.introduction}</p>{lesson.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}<section className="starter-activity"><h3>Make it practical</h3><p>{lesson.task}</p></section>{lesson.source?<p><a href={lesson.source} target="_blank" rel="noopener noreferrer">{lesson.sourceLabel} ↗</a></p>:null}{progress.completed.has(lesson.slug)?<p className="starter-done">✓ Lesson completed</p>:<ActionForm action={finishLesson} label="Mark complete & continue"><input type="hidden" name="lesson" value={lesson.slug}/></ActionForm>}</article></div>}</Localized>;
}
