import {redirect,notFound} from "next/navigation";
import {practiceBooks} from "@/lib/practice-bank";
export default async function Practice({params}:{params:Promise<{book:string}>}){
 const {book}=await params;if(!practiceBooks.includes(book))notFound();
 redirect(`/student/exam/${book}/`);
}
