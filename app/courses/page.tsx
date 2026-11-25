import { identity } from "@/lib/auth";
import { execute } from "@/lib/db";
import { publishedCatalogue } from "@/lib/public-catalogue";
import { starterProgress } from "@/lib/course-progress";
import { FREE_COURSE_TITLE, FREE_COURSE_URL, FREE_LEARNING_URL, starterLessons } from "@/lib/free-course";
import { CourseLibrary, type LibraryCourse } from "@/components/course-library";
export const dynamic="force-dynamic";
export const metadata={title:"Courses · Learn with UPSC Radio"};
export default async function Courses(){
 const [user,catalogue]=await Promise.all([identity(),publishedCatalogue("course")]);
 const [starter,wishlist]=await Promise.all([user?starterProgress(user):null,user?execute({sql:"SELECT content_id FROM saved WHERE clerk_id=?",args:[user]}):null]);
 const saved=new Set(wishlist?.rows.map(row=>Number(row.content_id))||[]);
 const courses:LibraryCourse[]=[{key:"starter",title:FREE_COURSE_TITLE,summary:"Understand the exam, build a study routine and make your practice count.",category:"Getting started",href:starter?.enrolled?FREE_LEARNING_URL:FREE_COURSE_URL,free:true,lessons:starterLessons.length,minutes:15,enrolled:starter?.enrolled,progress:starter?.enrolled?Math.round(starter.completed.size/starterLessons.length*100):undefined},...catalogue.filter(item=>item.category!=="Test Series").map(item=>({key:String(item.id),title:item.title,summary:item.summary,category:item.category||"General Studies",href:"/courses/"+item.slug+"/",slug:item.slug,id:item.id,wished:saved.has(item.id),demo:Boolean(item.extra.demo),price:Number(item.extra.price_paise)||undefined}))];
 return <section className="wrap section course-catalogue"><div className="course-library-heading"><div><p className="eyebrow">YOUR NEXT CHAPTER</p><h1>Make room for your ambition.</h1><p>Find a course. Build understanding. Keep moving forward.</p></div><span className="course-heading-note">UPSC RADIO · LEARNING SPACE</span></div><CourseLibrary courses={courses}/></section>;
}
