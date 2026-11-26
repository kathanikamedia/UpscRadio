import {Localized} from "./localized";
import Link from "next/link";
import {ClipboardCheck,BookOpen} from "lucide-react";
import {rupees} from "@/lib/course-pricing";
import type {CartLine} from "@/lib/cart-orders";
/** Shared item list for the cart checkout and order pages. */
export function CheckoutItems({lines,heading,paid=false}:{lines:CartLine[];heading:string;paid?:boolean}){
 return <Localized><section className="ck-card ck-items" aria-label={heading}><h2>{heading}</h2><ul>{lines.map(line=>{const href=(line.mock?"/test-series/":"/courses/")+line.slug+"/";const Icon=line.mock?ClipboardCheck:BookOpen;return <li key={line.slug}><span className="ck-thumb"><Icon size={20} aria-hidden="true"/></span><div className="ck-item-text"><span className="ck-type">{line.mock?"Mock test":"Course"}</span><Link href={href}>{line.title}</Link></div>{paid?<Link className="button secondary ck-open" href={href}>Open</Link>:<strong className="ck-price">{rupees(line.price)}</strong>}</li>;})}</ul></section></Localized>;
}
export function PriceRows({subtotal,total,coupon,paid=false}:{subtotal:number;total:number;coupon?:string|null;paid?:boolean}){
 const discount=subtotal-total;
 return <Localized><div className="ck-rows"><div className="ck-row"><span>Subtotal</span><span>{rupees(subtotal)}</span></div>{discount>0?<div className="ck-row ck-discount"><span>Discount{coupon?` (${coupon})`:""}</span><span>−{rupees(discount)}</span></div>:null}<div className="ck-row ck-total"><span>{paid?"Paid":"Total"}</span><span>{rupees(total)}</span></div></div></Localized>;
}
