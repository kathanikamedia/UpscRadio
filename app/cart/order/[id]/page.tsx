import {Localized} from "@/components/localized";
import Link from "next/link";
import {notFound} from "next/navigation";
import {requireUser} from "@/lib/auth";
import {cartOrder} from "@/lib/cart-orders";
import {rupees} from "@/lib/course-pricing";
import {paymentMode} from "@/lib/payment-policy";
import {Pay} from "@/components/pay";
import {ClearCart} from "@/components/clear-cart";
import {CheckCircle2,ArrowRight} from "lucide-react";
export const dynamic="force-dynamic";
export const metadata={title:"Your order",robots:{index:false,follow:false}};
export default async function CartOrderPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{pay?:string}>}){
 const {id}=await params,{pay}=await searchParams;
 const user=await requireUser(`/cart/order/${id}/`);
 const order=await cartOrder(user,id);if(!order)notFound();
 const paid=order.status==="Paid",discount=Number(order.subtotal)-Number(order.amount);
 return <Localized>{<section className="wrap section cart-checkout"><h1>{paid?"Payment confirmed":order.status==="Refunded"?"Order refunded":"Complete your payment"}</h1>{!paid&&paymentMode()==="test"?<p className="purchase-alert">Test Mode · No real money will be charged.</p>:null}
 <div className="cart-checkout-layout"><section className="cart-checkout-items" aria-label="Items"><h2>Order summary</h2><ul>{order.items.map(line=><li key={line.slug}><Link href={(line.mock?"/test-series/":"/courses/")+line.slug+"/"}>{line.title}</Link>{paid?<Link className="button secondary" href={(line.mock?"/test-series/":"/courses/")+line.slug+"/"}>Open <ArrowRight size={14}/></Link>:<span>{rupees(line.price)}</span>}</li>)}</ul></section>
 <aside className="cart-checkout-summary"><dl><div><dt>Subtotal</dt><dd>{rupees(Number(order.subtotal))}</dd></div>{discount>0?<div className="coupon-line"><dt>Discount{order.coupon?` (${String(order.coupon)})`:""}</dt><dd>−{rupees(discount)}</dd></div>:null}<div className="cart-total"><dt>{paid?"Paid":"Total"}</dt><dd>{rupees(Number(order.amount))}</dd></div></dl>
 {paid?<><ClearCart slugs={order.items.map(line=>line.slug)}/><p className="purchase-owned"><CheckCircle2 size={18}/> Your access is ready</p><Link className="button" href="/student/">Go to My learning</Link></>:order.status==="Pending"?<Pay order={String(order.order_id)} keyId={process.env.RAZORPAY_KEY_ID!} receipt={id} amount={Number(order.amount)} autoOpen={pay==="1"} verifyPath="/api/payments/verify-cart" successPath={`/cart/order/${id}/`}/>:<p>This order can no longer be paid. <Link href="/cart/">Return to your cart</Link>.</p>}</aside></div></section>}</Localized>;
}
