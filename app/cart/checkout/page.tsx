import {Localized} from "@/components/localized";
import Link from "next/link";
import {requireUser} from "@/lib/auth";
import {cartQuote} from "@/lib/cart-orders";
import {rupees} from "@/lib/course-pricing";
import {paymentMode} from "@/lib/payment-policy";
import {ActionForm} from "@/components/action-form";
import {beginCartCheckout} from "./actions";
import {ShieldCheck,Tag} from "lucide-react";
export const dynamic="force-dynamic";
export const metadata={title:"Checkout",robots:{index:false,follow:false}};
export default async function CartCheckout({searchParams}:{searchParams:Promise<{items?:string;coupon?:string}>}){
 const {items="",coupon=""}=await searchParams;
 const slugs=items.slice(0,2000).split(",");
 const user=await requireUser(`/cart/checkout/?items=${encodeURIComponent(items)}`);
 const quote=await cartQuote(user,slugs,coupon);
 const discount=quote.subtotal-quote.total;
 return <Localized>{<section className="wrap section cart-checkout"><Link className="mock-back" href="/cart/">← Back to cart</Link><h1>Checkout</h1>{paymentMode()==="test"?<p className="purchase-alert">Test Mode · No real money will be charged.</p>:null}
 {quote.lines.length?<div className="cart-checkout-layout"><section className="cart-checkout-items" aria-label="Items"><h2>{quote.lines.length} {quote.lines.length===1?"item":"items"}</h2><ul>{quote.lines.map(line=><li key={line.slug}><Link href={(line.mock?"/test-series/":"/courses/")+line.slug+"/"}>{line.title}</Link><span>{rupees(line.price)}</span></li>)}</ul>{quote.skipped?<p className="purchase-small">{quote.skipped} already purchased {quote.skipped===1?"item was":"items were"} left out.</p>:null}</section>
 <aside className="cart-checkout-summary"><form className="coupon-form" method="get"><input type="hidden" name="items" value={items}/><label><Tag size={15} aria-hidden="true"/> Coupon code<span><input name="coupon" defaultValue={coupon} placeholder="Enter code" autoComplete="off"/><button className="button secondary" type="submit">Apply</button></span></label>{quote.couponError?<p className="coupon-error" role="alert">{quote.couponError}</p>:quote.coupon?<p className="coupon-ok" role="status">{quote.coupon.code} applied</p>:null}</form>
 <dl><div><dt>Subtotal</dt><dd>{rupees(quote.subtotal)}</dd></div>{discount>0?<div className="coupon-line"><dt>Discount</dt><dd>−{rupees(discount)}</dd></div>:null}<div className="cart-total"><dt>Total</dt><dd>{rupees(quote.total)}</dd></div></dl>
 <ActionForm action={beginCartCheckout} label={`Pay ${rupees(quote.total)}`}><input type="hidden" name="items" value={quote.lines.map(line=>line.slug).join(",")}/><input type="hidden" name="coupon" value={quote.couponError?"":coupon}/></ActionForm><p className="purchase-small"><ShieldCheck size={14}/> One secure payment by Razorpay for everything</p></aside></div>
 :<p>No items in your selection can be purchased right now. <Link href="/cart/">Return to your cart</Link>.</p>}</section>}</Localized>;
}
