import {Localized} from "@/components/localized";
import Link from "next/link";
import {requireUser} from "@/lib/auth";
import {StudentExams} from "@/components/student-exams";
export const dynamic="force-dynamic";
export const metadata={title:"Exam attempts",robots:{index:false,follow:false}};
export default async function Attempts(){
 const id=await requireUser("/student/attempts/");
 return <Localized>{<div className="student-overview student-subpage"><header className="subpage-head"><div><p className="eyebrow">YOUR TESTS</p><h1>Exam attempts</h1><p>Resume a running test or review the answers of one you finished.</p></div><span className="section-links"><Link href="/student/results/">See my results ↗</Link><Link href="/test-series/">Find a mock test ↗</Link></span></header><StudentExams userId={id}/></div>}</Localized>;
}
