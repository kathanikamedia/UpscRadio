import {redirect,notFound} from "next/navigation";
import {knownPracticeBook} from "@/lib/practice-bank";
export default async function Practice({params}:{params:Promise<{book:string}>}){
 const {book}=await params;if(!await knownPracticeBook(book))notFound();
 redirect(`/student/exam/${book}/`);
}
