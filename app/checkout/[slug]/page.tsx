import {requireUser} from "@/lib/auth";
import {content,execute} from "@/lib/db";
import {notFound} from "next/navigation";
import {ActionForm} from "@/components/action-form";
import {Pay} from "@/components/pay";
import {beginCheckout} from "./actions";
export const dynamic="force-dynamic";
export default async function Checkout({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params,user=await requireUser(`/checkout/${slug}/`),course=await content("course",slug);if(!course)notFound();
 const payment=(await execute({sql:"SELECT * FROM payments WHERE clerk_id=? AND course_id=? AND status IN ('Creating','Pending','Paid')",args:[user,course.id]})).rows[0];
 return <section className="wrap section narrow"><h1>Course enrolment</h1><article className="card"><h2>{course.title}</h2><p>₹{(Number(payment?.amount||course.extra.price_paise||0)/100).toLocaleString("en-IN")}</p>{payment?.status==="Pending"?<Pay order={String(payment.order_id)} keyId={process.env.RAZORPAY_KEY_ID!} receipt={String(payment.id)} amount={Number(payment.amount)}/>:<ActionForm action={beginCheckout} label={payment?.status==="Paid"?"Check course activation":"Start checkout"}><input type="hidden" name="slug" value={slug}/></ActionForm>}</article></section>;
}
