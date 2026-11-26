import {Localized} from "@/components/localized";
import Link from "next/link";
import {requireUser} from "@/lib/auth";
import {cartQuote} from "@/lib/cart-orders";
import {rupees} from "@/lib/course-pricing";
import {paymentMode} from "@/lib/payment-policy";
import {ActionForm} from "@/components/action-form";
import {CheckoutItems,PriceRows} from "@/components/checkout-summary";
import {beginCartCheckout} from "./actions";
import {ShieldCheck} from "lucide-react";
export const dynamic="force-dynamic";
export const metadata={title:"Checkout",robots:{index:false,follow:false}};
export default async function CartCheckout({searchParams}:{searchParams:Promise<{items?:string;coupon?:string}>}){
 const {items="",coupon=""}=await searchParams;
 const slugs=items.slice(0,2000).split(",");
 const user=await requireUser(`/cart/checkout/?items=${encodeURIComponent(items)}`);
 const quote=await cartQuote(user,slugs,coupon);
 return <Localized>{<section className="wrap section ck-page"><Link className="mock-back" href="/cart/">← Back to cart</Link><h1>Checkout</h1>{paymentMode()==="test"?<p className="ck-test">Test Mode · No real money will be charged.</p>:null}
 {quote.lines.length?<div className="ck-layout"><div><CheckoutItems lines={quote.lines} heading={`${quote.lines.length} ${quote.lines.length===1?"item":"items"}`}/>{quote.skipped?<p className="ck-note">{quote.skipped} already purchased {quote.skipped===1?"item was":"items were"} left out.</p>:null}</div>
 <aside className="ck-card ck-summary"><h2>Order summary</h2><form className="ck-coupon" method="get"><input type="hidden" name="items" value={items}/><span className="ck-label">Coupon code</span><div className="ck-coupon-row"><input name="coupon" defaultValue={coupon} placeholder="Enter code" autoComplete="off" aria-label="Coupon code"/><button type="submit">Apply</button></div>{quote.couponError?<p className="ck-coupon-msg is-error" role="alert">{quote.couponError}</p>:quote.coupon?<p className="ck-coupon-msg is-ok" role="status">✓ {quote.coupon.code} applied</p>:null}</form>
 <PriceRows subtotal={quote.subtotal} total={quote.total} coupon={quote.coupon?.code}/>
 <div className="ck-pay"><ActionForm action={beginCartCheckout} label={`Pay ${rupees(quote.total)}`}><input type="hidden" name="items" value={quote.lines.map(line=>line.slug).join(",")}/><input type="hidden" name="coupon" value={quote.couponError?"":coupon}/></ActionForm></div><p className="ck-secure"><ShieldCheck size={15} aria-hidden="true"/> One secure payment by Razorpay for everything</p></aside></div>
 :<div className="ck-card ck-empty"><p>No items in your selection can be purchased right now.</p><Link className="button" href="/cart/">Return to your cart</Link></div>}</section>}</Localized>;
}
