
import { MockCatalogue } from "@/components/mock-catalogue";
import { publishedCatalogue } from "@/lib/public-catalogue";

export const dynamic="force-dynamic";
export const metadata={title:"Mock tests"};

export default async function MockTests({searchParams}:{searchParams:Promise<{exam?:string;q?:string;price?:string}>}) {
 const [params, courses]=await Promise.all([searchParams,publishedCatalogue("course")]);
 const catalogue=courses.filter(course=>course.category==="Test Series").map(({id,slug,title,summary,extra})=>({
   id,slug,title,summary,extra:Object.fromEntries(["exam","subject","price_paise","pdf_uploaded","question_count","duration_minutes","source_material_slug"].map(key=>[key,extra[key]]))
 }));
 const initial={q:String(params.q||""),exam:String(params.exam||""),price:String(params.price||"")};
 return <MockCatalogue key={JSON.stringify(initial)} catalogue={catalogue} initial={initial}/>;
}
