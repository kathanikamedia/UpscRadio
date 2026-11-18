import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { requireUser } from "@/lib/auth";
import { moodle, moodleConfigured } from "@/lib/moodle";
import { moodleIdentity } from "@/lib/identity";
import { execute } from "@/lib/db";
import { ClipboardCheck, BookOpen, Bookmark, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic="force-dynamic";
export const metadata={title:"Student dashboard",robots:{index:false,follow:false}};

export default async function Student(){
 const id=await requireUser();
 const user=await currentUser();
 const [payments,saved]=await Promise.all([
  execute({sql:"SELECT p.*,c.title FROM payments p JOIN content c ON c.id=p.course_id WHERE clerk_id=? ORDER BY p.rowid DESC",args:[id]}),
  execute({sql:"SELECT COUNT(*) AS count FROM saved s JOIN content c ON c.id=s.content_id WHERE s.clerk_id=? AND c.published=1",args:[id]}),
 ]);
 let courses:{id:number;fullname:string;progress?:number}[]=[];
 let problem="";
 if(moodleConfigured){
  try {const mid=await moodleIdentity(id);if(mid)courses=await moodle("core_enrol_get_users_courses",{userid:mid});}
  catch {problem="Your courses could not be loaded. Please try again shortly.";}
 }
 return <div className="student-overview">
  <header className="student-welcome"><div><p className="eyebrow">YOUR STUDY SPACE</p><h1>Welcome, {user?.firstName||"student"}.</h1><p>Small steps, taken consistently, bring your goal closer.</p></div><UserButton/></header>
  <div className="student-stats">
   <article><BookOpen aria-hidden="true"/><strong>{courses.length}</strong><span>Enrolled programmes</span></article>
   <article><Bookmark aria-hidden="true"/><strong>{Number(saved.rows[0].count)}</strong><span>Wishlist items</span></article>
   <article><ClipboardCheck aria-hidden="true"/><strong>1</strong><span>Free introductory mock</span></article>
  </div>
  <section className="student-next"><div><span className="access-label free">Free mock test</span><h2>Find your starting point.</h2><p>Try 10 polity questions and make your next revision session more focused.</p></div><Link className="button" href="/student/free-test/">Open free mock <ArrowRight size={16} aria-hidden="true"/></Link></section>
  <section className="dashboard-section"><div className="section-head"><h2>Continue learning</h2><Link href="/courses/">Explore courses ↗</Link></div>{problem?<p role="status">{problem}</p>:null}
  <div className="grid">{courses.map(course=><article className="card" key={course.id}><h3>{course.fullname}</h3>{typeof course.progress==="number"?<><p>{Math.round(course.progress)}% complete</p><progress value={course.progress} max={100} aria-label={course.fullname+" progress"}/></>:null}<Link className="button" href={"/student/course/"+course.id}>Continue learning</Link></article>)}</div>
  {!courses.length?<div className="dashboard-empty"><BookOpen aria-hidden="true"/><p>Your enrolled programmes will appear here.</p><Link href="/courses/">Find your next course ↗</Link></div>:null}</section>
  <section className="dashboard-section"><h2>Payment history</h2>{payments.rows.length?payments.rows.map(payment=><article className="payment-row" key={String(payment.id)}><div><strong>{String(payment.title)}</strong><small>{String(payment.status)}{payment.status==="Paid"&&!payment.fulfilled?" · Course activation pending":""}</small></div><span>₹{(Number(payment.amount)/100).toLocaleString("en-IN")}</span>{payment.status==="Paid"?<Link href={"/student/receipt/"+payment.id}>Receipt ↗</Link>:null}</article>):<p className="muted">Your payment receipts will appear here after enrolment.</p>}</section>
 </div>;
}
