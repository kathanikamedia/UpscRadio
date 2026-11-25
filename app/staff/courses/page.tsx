import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { contents } from "@/lib/db";
import { BookOpen, CircleDollarSign, FilePenLine, Plus } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Course management", robots: { index: false, follow: false } };

export default async function StaffCourses() {
  await requireAdmin();
  const courses = await contents("course", false);
  return <section className="staff-page">
    <header className="staff-page-header">
      <div><p className="eyebrow">LEARNING CATALOGUE</p><h1>Courses</h1><p>Create, review and publish your learning programmes from one place.</p></div>
      <Link className="button" href="/staff/?kind=course"><Plus size={16}/>Create course</Link>
    </header>
    <div className="staff-guidance"><BookOpen size={18}/><p><strong>Before publishing:</strong> confirm the course title, learning outcomes, price and delivery plan. Paid courses should stay as drafts until Razorpay and Moodle are connected.</p></div>
    <div className="staff-content-grid">
      {courses.map(course => {
        const price = Number(course.extra.price_paise || 0);
        return <article className="staff-content-card" key={course.id}>
          <div className="staff-content-card-top"><span className={course.published ? "status-live" : "status-draft"}>{course.published ? "Published" : "Draft"}</span><span>{course.category || "Course"}</span></div>
          <h2>{course.title}</h2><p>{course.summary || "No course description added yet."}</p>
          <div className="staff-content-meta"><span><CircleDollarSign size={14}/>{price ? `₹${(price / 100).toLocaleString("en-IN")}` : "Free / price pending"}</span><span>{course.extra.moodle_course_id ? "Moodle linked" : "Moodle pending"}</span></div>
          <Link href={`/staff/?kind=course&edit=${course.slug}`}><FilePenLine size={15}/>Edit course</Link>
        </article>;
      })}
      {!courses.length ? <div className="staff-empty"><BookOpen size={25}/><h2>No courses yet</h2><p>Create a course, keep it as a draft, then publish only when it is ready for learners.</p><Link className="button" href="/staff/?kind=course">Create the first course</Link></div> : null}
    </div>
  </section>;
}
