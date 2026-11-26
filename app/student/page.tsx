
import {Localized} from "@/components/localized";
import { UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import { StudentName } from "@/components/student-name";
import { StudentExams } from "@/components/student-exams";
import { PaymentHistory } from "@/components/payment-history";
import { EnrolledCount, LearningCourses,PurchasedMaterials } from "@/components/student-learning";
import { requireUser } from "@/lib/auth";
import { execute } from "@/lib/db";
import { ClipboardCheck, BookOpen, Bookmark, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic="force-dynamic";
export const metadata={title:"Student dashboard",robots:{index:false,follow:false}};
async function SavedCount({userId}:{userId:string}){
 const saved=await execute({sql:"SELECT COUNT(*) AS count FROM saved s JOIN content c ON c.id=s.content_id WHERE s.clerk_id=? AND c.published=1",args:[userId]});
 return <strong>{Number(saved.rows[0].count)}</strong>;
}
export default async function Student(){
 const id=await requireUser();
 return <Localized>{<div className="student-overview">
  <header className="student-welcome"><div><p className="eyebrow">YOUR STUDY SPACE</p><h1>Welcome, <StudentName/>.</h1><p>Small steps, taken consistently, bring your goal closer.</p></div><UserButton/></header>
  <div className="student-stats">
   <article><BookOpen aria-hidden="true"/><Suspense fallback={<strong aria-label="Loading programme count">—</strong>}><EnrolledCount userId={id}/></Suspense><span>Enrolled programmes</span></article>
   <article><Bookmark aria-hidden="true"/><Suspense fallback={<strong>—</strong>}><SavedCount userId={id}/></Suspense><span>Wishlist items</span></article>
   <article><ClipboardCheck aria-hidden="true"/><strong>1</strong><span>Free introductory mock</span></article>
  </div>
  <section className="student-next"><div><span className="access-label free">Free mock test</span><h2>Find your starting point.</h2><p>Try 10 polity questions and make your next revision session more focused.</p></div><Link className="button" href="/student/free-test/">Open free mock <ArrowRight size={16} aria-hidden="true"/></Link></section>
  <section className="dashboard-section"><div className="section-head"><h2>Your learning library</h2><Link href="/courses/">Explore courses ↗</Link></div><Suspense fallback={<p className="learning-pending" role="status">Loading your programmes…</p>}><LearningCourses userId={id}/></Suspense></section>
  <Suspense fallback={<p role="status">Loading exam attempts…</p>}><StudentExams userId={id} limit={3} preview/></Suspense>
  <Suspense fallback={null}><PurchasedMaterials userId={id}/></Suspense>
  <Suspense fallback={<p role="status">Loading payment history…</p>}><PaymentHistory userId={id} limit={3} preview/></Suspense>
 </div>}</Localized>;
}
