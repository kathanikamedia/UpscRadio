
import {Localized} from "@/components/localized";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { contents } from "@/lib/db";
export const dynamic="force-dynamic";
export const metadata={title:"Review your courses",robots:{index:false,follow:false}};
export default async function CartCheckout({searchParams}:{searchParams:Promise<{items?:string}>}){await requireUser();const {items=""}=await searchParams;const slugs=new Set(items.slice(0,10000).split(",").slice(0,100));const courses=(await contents("course")).filter(c=>slugs.has(c.slug)&&!c.extra.demo&&Number(c.extra.price_paise)>0);return <Localized>{<section className="wrap section"><Link href="/cart/">← Back to cart</Link><h1>Review your courses</h1><p>Each course has its own payment and enrolment. Complete the checkouts below for the courses you want.</p><div className="grid">{courses.map(c=><article className="card" key={c.id}><h2>{c.title}</h2><p>₹{(Number(c.extra.price_paise)/100).toLocaleString("en-IN")}</p><Link className="button" href={`/checkout/${c.slug}/`}>Checkout this course ↗</Link></article>)}</div>{!courses.length?<p>No available courses selected. <Link href="/cart/">Return to your cart</Link>.</p>:null}</section>}</Localized>;}
