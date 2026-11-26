
import {Localized} from "@/components/localized";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { contents } from "@/lib/db";
import {bundleAvailability} from "@/lib/checkout-product";
import {checkoutReady,paymentMode} from "@/lib/payment-policy";
import {paymentsConfigured} from "@/lib/payments";
import {moodleConfigured} from "@/lib/moodle";
export const dynamic="force-dynamic";
export const metadata={title:"Review your items",robots:{index:false,follow:false}};
export default async function CartCheckout({searchParams}:{searchParams:Promise<{items?:string}>}){await requireUser();const {items=""}=await searchParams;const slugs=new Set(items.slice(0,10000).split(",").slice(0,100));const courses=(await bundleAvailability(await contents("course"))).filter(c=>slugs.has(c.slug)&&checkoutReady(c,{configured:paymentsConfigured,testMode:paymentMode()==="test",moodle:moodleConfigured}));return <Localized>{<section className="wrap section"><Link href="/cart/">← Back to cart</Link><h1>Review your items</h1><p>Each item has its own payment. Complete checkout for the items you want.</p><div className="grid">{courses.map(c=><article className="card" key={c.id}><h2>{c.title}</h2><p>₹{(Number(c.extra.price_paise)/100).toLocaleString("en-IN")}</p><Link className="button" href={`/checkout/${c.slug}/`}>Purchase this item ↗</Link></article>)}</div>{!courses.length?<p>No available items selected. <Link href="/cart/">Return to your cart</Link>.</p>:null}</section>}</Localized>;}
