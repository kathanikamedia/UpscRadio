import { execute } from "./db";
import { FREE_COURSE_SLUG, starterLessons } from "./free-course";

export async function enrolStarter(userId: string) {
  await execute({sql:"INSERT OR IGNORE INTO course_enrolments(clerk_id,course_slug) VALUES (?,?)",args:[userId,FREE_COURSE_SLUG]});
}
export async function starterProgress(userId: string) {
  const progress=await execute({sql:"SELECT 'enrolled' AS kind,'' AS lesson_slug FROM course_enrolments WHERE clerk_id=? AND course_slug=? UNION ALL SELECT 'lesson' AS kind,lesson_slug FROM lesson_completions WHERE clerk_id=? AND course_slug=?",args:[userId,FREE_COURSE_SLUG,userId,FREE_COURSE_SLUG]});
  const valid = new Set(starterLessons.map(lesson=>lesson.slug));
  return {enrolled:progress.rows.some(row=>row.kind==="enrolled"), completed:new Set(progress.rows.filter(row=>row.kind==="lesson").map(row=>String(row.lesson_slug)).filter(slug=>valid.has(slug)))};
}
export async function completeStarterLesson(userId: string, slug: string) {
  if(!starterLessons.some(lesson=>lesson.slug===slug)) throw new Error("Unknown lesson");
  const result=await execute({sql:"INSERT OR IGNORE INTO lesson_completions(clerk_id,course_slug,lesson_slug) SELECT ?,?,? WHERE EXISTS (SELECT 1 FROM course_enrolments WHERE clerk_id=? AND course_slug=?)",args:[userId,FREE_COURSE_SLUG,slug,userId,FREE_COURSE_SLUG]});
  return result.rowsAffected>0;
}
export async function starterActivity(userId:string){
 const result=await execute({sql:"SELECT 'enrolment' AS type, '' AS lesson_slug, created AS date FROM course_enrolments WHERE clerk_id=? AND course_slug=? UNION ALL SELECT 'lesson' AS type, lesson_slug, completed AS date FROM lesson_completions WHERE clerk_id=? AND course_slug=? ORDER BY date DESC",args:[userId,FREE_COURSE_SLUG,userId,FREE_COURSE_SLUG]});
 return result.rows.flatMap(row=>{
  const lesson=starterLessons.find(item=>item.slug===String(row.lesson_slug));
  if(row.type==="lesson"&&!lesson)return [];
  return [{type:row.type as "enrolment"|"lesson",title:lesson?"Completed: "+lesson.title:"Started UPSC Preparation Starter",date:String(row.date).replace(" ","T")+"Z"}];
 });
}
