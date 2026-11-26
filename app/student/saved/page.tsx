
import {Localized} from "@/components/localized";
import {requireUser} from "@/lib/auth";
import {execute} from "@/lib/db";
import {toggleSaved} from "../actions";
import Link from "next/link";
import {AddToCart} from "@/components/cart";
import {checkoutHref} from "@/lib/course-pricing";
export const dynamic="force-dynamic";
export const metadata={title:"Wishlist",robots:{index:false,follow:false}};
function priceOf(extra:unknown){try{return Number(JSON.parse(String(extra)).price_paise)||0;}catch{return 0;}}
export default async function Saved() {
 const id=await requireUser();
 const result=await execute({sql:"SELECT c.* FROM saved s JOIN content c ON c.id=s.content_id WHERE clerk_id=? AND published=1 ORDER BY s.created DESC",args:[id]});
 return <Localized>{<section className="wrap section"><h1>Wishlist</h1><div className="grid">{result.rows.length?result.rows.map(row=><article className="card" key={Number(row.id)}><h2><Link href={(row.kind==="resource"?"/resources/":row.category==="Test Series"?"/test-series/":"/courses/")+row.slug}>{String(row.title)}</Link></h2><p>{String(row.summary)}</p><div className="wishlist-actions">{row.kind==="course"?<AddToCart slug={String(row.slug)}/>:priceOf(row.extra)>0?<Link className="button" href={checkoutHref("resource",String(row.slug))}>Buy material</Link>:null}<form action={toggleSaved}><input type="hidden" name="id" value={Number(row.id)}/><button className="button secondary">Remove</button></form></div></article>):<p>Your wishlist is empty. Add courses and study materials to find them here.</p>}</div></section>}</Localized>;
}
