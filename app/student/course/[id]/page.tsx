import { requireUser } from "@/lib/auth";
import { moodleIdentity } from "@/lib/identity";
import { moodle } from "@/lib/moodle";
import { notFound } from "next/navigation";
export const dynamic="force-dynamic";
export const metadata={title:"Course learning",robots:{index:false,follow:false}};
export default async function Course({params}:{params:Promise<{id:string}>}) {
  const user=await requireUser(), {id}=await params;
  if(!/^\d+$/.test(id))notFound();
  const mid=await moodleIdentity(user);
  if(!mid)notFound();
  let courses:{id:number;fullname:string}[];
  try {
    courses=await moodle("core_enrol_get_users_courses",{userid:mid});


  } catch { return <section className="wrap section"><h1>Course unavailable</h1><p>Please try again shortly.</p></section>; }
  const course=courses.find(c=>c.id===Number(id));if(!course)notFound();
  return <section className="wrap section"><h1>{course.fullname}</h1><p>Access lessons, mock tests, assignments, feedback and grades in the learning platform.</p><form method="post" action="/api/learning/launch"><input type="hidden" name="course" value={id}/><button className="button">Continue learning ↗</button></form></section>;
}
