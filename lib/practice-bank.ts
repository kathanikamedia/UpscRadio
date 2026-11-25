import {execute} from "./db";
import {currentUser} from "@clerk/nextjs/server";
export const practiceBooks=["economy-1","economy-2","economy-3","economy-4","environment-1","environment-2","environment-3","current-affairs-english"];
export async function canPractise(userId:string,book:string){
 if(!practiceBooks.includes(book))return false;
 const user=await currentUser();if(user?.id===userId&&user.publicMetadata.role==="admin")return true;
 const slug=book.replace(/-(\d)$/,"-part-$1");
 const owned=await execute({sql:"SELECT 1 FROM payments p JOIN content c ON c.id=p.course_id WHERE p.clerk_id=? AND p.status='Paid' AND ((c.kind='course' AND c.category='Test Series' AND json_extract(c.extra,'$.question_bank')=?) OR (c.kind='resource' AND c.slug=?)) LIMIT 1",args:[userId,book,slug]});return owned.rows.length>0;
}
