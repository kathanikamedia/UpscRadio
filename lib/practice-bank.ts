import {execute} from "./db";
import {currentUser} from "@clerk/nextjs/server";
import {mockPaper,mockEntitled} from "./mock-papers";
export const practiceBooks=["economy-1","economy-2","economy-3","economy-4","environment-1","environment-2","environment-3","current-affairs-english"];
export async function knownPracticeBook(book:string){return practiceBooks.includes(book)||Boolean((await mockPaper(book))?.status==="published");}
export async function canPractise(userId:string,book:string){
 const paper=await mockPaper(book);
 if(!practiceBooks.includes(book)&&(!paper||paper.status!=="published"))return false;
 if(paper&&await mockEntitled(userId,book))return true;
 if(!paper){
  const slug=book.replace(/-(\d)$/,"-part-$1");
  const owned=await execute({sql:"SELECT 1 FROM payments p JOIN content c ON c.id=p.course_id WHERE p.clerk_id=? AND p.status='Paid' AND ((c.kind='course' AND c.category='Test Series' AND json_extract(c.extra,'$.question_bank')=?) OR (c.kind='resource' AND c.slug=?)) LIMIT 1",args:[userId,book,slug]});if(owned.rows.length)return true;
 }
 const user=await currentUser();return user?.id===userId&&user.publicMetadata.role==="admin";
}
