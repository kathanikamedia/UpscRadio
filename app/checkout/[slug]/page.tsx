
import {Localized} from "@/components/localized";
import {requireUser} from "@/lib/auth";
import {content,execute} from "@/lib/db";
import {notFound} from "next/navigation";
import {ActionForm} from "@/components/action-form";
import {Pay} from "@/components/pay";
import {beginCheckout} from "./actions";
import {paymentMode,checkoutReady} from "@/lib/payment-policy";
import {paymentsConfigured} from "@/lib/payments";
import {moodleConfigured} from "@/lib/moodle";
export const dynamic="force-dynamic";
export default async function Checkout({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params,user=await requireUser(`/checkout/${slug}/`),course=await content("course",slug);if(!course)notFound();
 const payment=(await execute({sql:"SELECT * FROM payments WHERE clerk_id=? AND course_id=? AND status IN ('Creating','Pending','Paid')",args:[user,course.id]})).rows[0];
 const test=paymentMode()==="test";
 const available=checkoutReady(course,{configured:paymentsConfigured,testMode:test,moodle:moodleConfigured});
 if(payment?.status==="Paid")return <Localized><section className="wrap section narrow"><h1>Payment confirmed</h1><p>{course.title}</p><a className="button" href={course.extra.question_bank?`/student/exam/${course.extra.question_bank}/`:"/student/"}>Open your purchase</a><a href={`/student/receipt/${payment.id}/`}>View receipt</a></section></Localized>;
 if(!available)return <Localized><section className="wrap section narrow"><h1>Checkout is not available yet</h1><p>This programme is not open for purchase yet.</p></section></Localized>;
 return <Localized>{<section className="wrap section narrow"><h1>Secure checkout</h1>{test?<p role="status">TEST MODE · No real money will be charged.</p>:null}<article className="card"><h2>{course.title}</h2><p>₹{(Number(payment?.amount||course.extra.price_paise||0)/100).toLocaleString("en-IN")}</p>{payment?.status==="Pending"?<Pay order={String(payment.order_id)} keyId={process.env.RAZORPAY_KEY_ID!} receipt={String(payment.id)} amount={Number(payment.amount)}/>:<ActionForm action={beginCheckout} label={payment?.status==="Paid"?"Check course activation":"Start checkout"}><input type="hidden" name="slug" value={slug}/></ActionForm>}</article></section>}</Localized>;
}
