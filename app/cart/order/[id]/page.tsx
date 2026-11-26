import {Localized} from "@/components/localized";
import Link from "next/link";
import {notFound} from "next/navigation";
import {requireUser} from "@/lib/auth";
import {cartOrder} from "@/lib/cart-orders";
import {paymentMode} from "@/lib/payment-policy";
import {Pay} from "@/components/pay";
import {ClearCart} from "@/components/clear-cart";
import {CheckoutItems,PriceRows} from "@/components/checkout-summary";
import {CheckCircle2,ShieldCheck} from "lucide-react";
export const dynamic="force-dynamic";
export const metadata={title:"Your order",robots:{index:false,follow:false}};
export default async function CartOrderPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{pay?:string}>}){
 const {id}=await params,{pay}=await searchParams;
 const user=await requireUser(`/cart/order/${id}/`);
 const order=await cartOrder(user,id);if(!order)notFound();
 const paid=order.status==="Paid";
 return <Localized>{<section className="wrap section ck-page"><h1>{paid?"Payment confirmed":order.status==="Refunded"?"Order refunded":"Complete your payment"}</h1>{!paid&&paymentMode()==="test"?<p className="ck-test">Test Mode · No real money will be charged.</p>:null}
 <div className="ck-layout"><CheckoutItems lines={order.items} heading={paid?"Your purchases":"Order summary"} paid={paid}/>
 <aside className="ck-card ck-summary"><h2>{paid?"Receipt":"Payment"}</h2><PriceRows subtotal={order.subtotal} total={order.amount} coupon={order.coupon} paid={paid}/>
 {paid?<><ClearCart slugs={order.items.map(line=>line.slug)}/><p className="ck-success"><CheckCircle2 size={18} aria-hidden="true"/> Your access is ready</p><div className="ck-pay"><Link className="button" href="/student/">Go to My learning</Link></div></>:order.status==="Pending"?<><div className="ck-pay"><Pay order={order.order_id} keyId={process.env.RAZORPAY_KEY_ID!} receipt={id} amount={order.amount} autoOpen={pay==="1"} verifyPath="/api/payments/verify-cart" successPath={`/cart/order/${id}/`}/></div><p className="ck-secure"><ShieldCheck size={15} aria-hidden="true"/> Secure payment by Razorpay</p></>:<p className="ck-note">This order can no longer be paid. <Link href="/cart/">Return to your cart</Link>.</p>}</aside></div></section>}</Localized>;
}
