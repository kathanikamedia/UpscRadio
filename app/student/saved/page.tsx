import {requireUser} from "@/lib/auth";
import {execute} from "@/lib/db";
import {toggleSaved} from "../actions";
import Link from "next/link";
export const dynamic="force-dynamic";
export const metadata={title:"Wishlist",robots:{index:false,follow:false}};
export default async function Saved() {
 const id=await requireUser();
 const result=await execute({sql:"SELECT c.* FROM saved s JOIN content c ON c.id=s.content_id WHERE clerk_id=? AND published=1 ORDER BY s.created DESC",args:[id]});
 return <section className="wrap section"><h1>Wishlist</h1><div className="grid">{result.rows.length?result.rows.map(row=><article className="card" key={Number(row.id)}><h2><Link href={(row.kind==="course"?"/courses/":"/resources/")+row.slug}>{String(row.title)}</Link></h2><p>{String(row.summary)}</p><form action={toggleSaved}><input type="hidden" name="id" value={Number(row.id)}/><button className="button secondary">Remove from wishlist</button></form></article>):<p>Your wishlist is empty. Add courses and study materials to find them here.</p>}</div></section>;
}
