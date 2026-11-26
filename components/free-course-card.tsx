
import {Localized} from "@/components/localized";
import Link from "next/link";
import { FREE_COURSE_TITLE, FREE_COURSE_URL } from "@/lib/free-course";
export function FreeCourseCard({compact=false}:{compact?:boolean}){
 return <Localized>{<article className={compact?"course-preview home-course-preview":"card catalogue-card"}><span className="access-label free">Free course · ₹0</span><h3><Link href={FREE_COURSE_URL}>{FREE_COURSE_TITLE}</Link></h3><p>Understand the exam, build a study routine and make practice count. Three short lessons to find your starting point.</p><div className="home-course-actions"><Link className="button" href={FREE_COURSE_URL}>Start free course ↗</Link><Link className="home-course-details" href={FREE_COURSE_URL}>View details ↗</Link></div></article>}</Localized>;
}
