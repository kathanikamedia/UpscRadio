import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { requireUser } from "@/lib/auth";
import { moodle, moodleConfigured, moodleLink } from "@/lib/moodle";
import { moodleIdentity } from "@/lib/identity";
import { execute } from "@/lib/db";
import Link from "next/link";
export const dynamic="force-dynamic";
export const metadata={title:"My learning",robots:{index:false,follow:false}};
export default async function Student() {
  const id=await requireUser();
  const user=await currentUser();
  const payments=await execute({sql:"SELECT p.*,c.title FROM payments p JOIN content c ON c.id=p.course_id WHERE clerk_id=? ORDER BY rowid DESC",args:[id]});
  let courses:{id:number;fullname:string;progress?:number}[]=[], problem="";
  if(moodleConfigured) {
    try { const mid=await moodleIdentity(id);if(mid)courses=await moodle("core_enrol_get_users_courses",{userid:mid}); }
    catch {problem="The learning platform is temporarily unavailable. Please try again shortly.";}
  } else problem="Course access is awaiting activation. Contact admissions about your enrolment.";
  return <><div className="page-head"><div><p className="eyebrow">YOUR LEARNING</p><h1>Welcome, {user?.firstName || "student"}.</h1><UserButton/></div></div><div className="section"><h2>Enrolled courses</h2>{problem?<p role="status">{problem}</p>:null}<div className="grid">{courses.map(c=><article className="card" key={c.id}><h3>{c.fullname}</h3>{typeof c.progress==="number"?<><p>Progress {Math.round(c.progress)}%</p><progress value={c.progress} max={100} aria-label={c.fullname+" progress"}/></>:null}<Link className="button" href={"/student/course/"+c.id}>Open course</Link></article>)}</div>{!courses.length&&!problem?<p>No courses are enrolled yet. <Link href="/courses/">Browse courses</Link></p>:null}
  <h2>Payment history</h2>{payments.rows.length?payments.rows.map(p=><article className="card" key={String(p.id)}><h3>{String(p.title)}</h3><p>₹{(Number(p.amount)/100).toLocaleString("en-IN")} · {String(p.status)}</p>{p.status==="Paid"?<><Link href={"/student/receipt/"+p.id}>View receipt</Link>{!p.fulfilled?<p>Course activation pending. <Link href="/admissions/">Contact admissions for help</Link></p>:null}</>:null}</article>):<p>No payments recorded.</p>}
  </div></>;
}
