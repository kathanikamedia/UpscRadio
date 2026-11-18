import {requireUser} from "@/lib/auth";
import {execute} from "@/lib/db";
import {toggleSaved} from "../actions";
import Link from "next/link";
export const dynamic="force-dynamic";
export const metadata={title:"Saved courses and resources",robots:{index:false,follow:false}};
export default async function Saved() {
 const id=await requireUser();
 const result=await execute({sql:"SELECT c.* FROM saved s JOIN content c ON c.id=s.content_id WHERE clerk_id=? AND published=1 ORDER BY s.created DESC",args:[id]});
 return <section className="wrap section"><h1>Saved courses and resources</h1><div className="grid">{result.rows.length?result.rows.map(row=><article className="card" key={Number(row.id)}><h2><Link href={(row.kind==="course"?"/courses/":"/resources/")+row.slug}>{String(row.title)}</Link></h2><p>{String(row.summary)}</p><form action={toggleSaved}><input type="hidden" name="id" value={Number(row.id)}/><button className="button secondary">Remove from saved</button></form></article>):<p>Your saved courses and resources will appear here.</p>}</div></section>;
}
