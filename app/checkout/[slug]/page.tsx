
import {Localized} from "@/components/localized";
import {requireUser} from "@/lib/auth";
import {execute} from "@/lib/db";
import {notFound} from "next/navigation";
import {ActionForm} from "@/components/action-form";
import {Pay} from "@/components/pay";
import {beginCheckout} from "./actions";
import {paymentMode,checkoutReady} from "@/lib/payment-policy";
import {paymentsConfigured} from "@/lib/payments";
import {moodleConfigured} from "@/lib/moodle";
import {checkoutProduct} from "@/lib/checkout-product";
import {materialAccess} from "@/lib/material-access";
import {checkoutHref,type ProductKind} from "@/lib/course-pricing";
import {PurchaseLayout} from "@/components/purchase-layout";
import Link from "next/link";
import {CouponBox,CouponField} from "@/components/coupon-field";
export const dynamic="force-dynamic";
export default async function Checkout({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{kind?:string;pay?:string}>}){
 const {slug}=await params,{kind:requestedKind,pay}=await searchParams,kind:ProductKind=requestedKind==="resource"?"resource":"course";
 const user=await requireUser(checkoutHref(kind,slug)),course=await checkoutProduct(kind,slug);if(!course)notFound();
 const payment=(await execute({sql:"SELECT * FROM payments WHERE clerk_id=? AND course_id=? AND status IN ('Creating','Pending','Paid')",args:[user,course.id]})).rows[0];
 const test=paymentMode()==="test",available=checkoutReady(course,{configured:paymentsConfigured,testMode:test,moodle:moodleConfigured});
 const owned=payment?.status==="Paid"||(kind==="resource"&&(await materialAccess(user,course)).allowed);
 return <PurchaseLayout item={course} test={test} amount={Number(payment?.amount??course.extra.price_paise)} heading={owned?"Your purchase is ready":"Complete your purchase"}><Localized>{owned?<><p className="purchase-owned">Access available</p>{kind==="resource"?<a className="button" href={`/downloads/${slug}/`}>Download PDF</a>:course.extra.question_bank?<><Link className="button" href={`/student/exam/${course.extra.question_bank}/`}>Open exam room</Link><a className="button secondary" href={`/api/mock-tests/${course.extra.question_bank}/pdf/`}>Download test PDF</a></>:<Link className="button" href={`/courses/${slug}/`}>Open your bundle</Link>}{payment?.status==="Paid"?<Link href={`/student/receipt/${payment.id}/`}>View receipt</Link>:null}</>:!available?<><p>Purchases for this item are not available yet.</p><Link className="button secondary" href="/admissions/">Ask about availability</Link></>:payment?.status==="Pending"?<><Pay order={String(payment.order_id)} keyId={process.env.RAZORPAY_KEY_ID!} receipt={String(payment.id)} amount={Number(payment.amount)} autoOpen={pay==="1"}/>{Number(payment.amount)<Number(course.extra.price_paise)?<p className="coupon-ok">Coupon applied · You save ₹{((Number(course.extra.price_paise)-Number(payment.amount))/100).toLocaleString("en-IN")}</p>:<CouponBox slug={slug} kind={kind}/>}</>:<><p>Review the details, then continue to Razorpay to pay securely.</p><ActionForm action={beginCheckout} label="Continue to payment"><input type="hidden" name="slug" value={slug}/><input type="hidden" name="kind" value={kind}/><CouponField/></ActionForm></>}</Localized></PurchaseLayout>;
}
