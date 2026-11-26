"use server";
import { randomUUID } from "node:crypto";
import { requireUser } from "@/lib/auth";
import { execute,rateLimit } from "@/lib/db";
import { moodleIdentity } from "@/lib/identity";
import { razorpay,paymentsConfigured,fulfill } from "@/lib/payments";
import { moodleConfigured } from "@/lib/moodle";
import { redirect } from "next/navigation";
import {checkoutReady,paymentMode} from "@/lib/payment-policy";
import {checkoutProduct} from "@/lib/checkout-product";
import {checkoutHref,type ProductKind} from "@/lib/course-pricing";
import {materialAccess} from "@/lib/material-access";
import {findCoupon,discountFor,reserveRedemption} from "@/lib/coupons";
export async function beginCheckout(_state:string,data:FormData) {
 const slug=String(data.get("slug"));
 const rawKind=String(data.get("kind")||"course");if(!["course","resource"].includes(rawKind))return "Invalid purchase type.";
 const kind=rawKind as ProductKind,id=await requireUser(checkoutHref(kind,slug)),course=await checkoutProduct(kind,slug);
 if(kind==="resource"&&course&&(await materialAccess(id,course)).allowed)redirect(`/resources/${slug}/`);
 const test=paymentMode()==="test";
 if(!course||!checkoutReady(course,{configured:paymentsConfigured,testMode:test,moodle:moodleConfigured}))return "This course is awaiting checkout activation.";
 try {
  await rateLimit("checkout:"+id,8);
  if(kind==="course"&&Number(course.extra.moodle_course_id)>0)await moodleIdentity(id,true);
  const price=Number(course.extra.price_paise);
  if(!Number.isSafeInteger(price)||price<100)return "Ask admissions about the course fee.";
  const {coupon,error}=await findCoupon(data.get("coupon"));if(error)return error;
  const receipt=randomUUID(),amount=price-discountFor(price,coupon);
  // A new price (coupon added or removed) replaces an unpaid order instead of reusing it.
  await execute({sql:"UPDATE payments SET status='Abandoned' WHERE clerk_id=? AND course_id=? AND status='Pending' AND amount!=?",args:[id,course.id,amount]});
  const result=await execute({sql:"INSERT OR IGNORE INTO payments(id,clerk_id,course_id,amount,status) VALUES (?,?,?,?,'Creating') RETURNING id",args:[receipt,id,course.id,amount]});
  if(result.rows.length) {
   // A timed-out request remains Creating until reconciled against the provider receipt.
   const order=await razorpay<{id:string}>("orders",{amount,currency:"INR",receipt:receipt.replaceAll("-","")});
   await execute({sql:"UPDATE payments SET order_id=?,status='Pending' WHERE id=?",args:[order.id,receipt]});
   if(coupon)await reserveRedemption(order.id,coupon.code,id);
  }
  const row=(await execute({sql:"SELECT * FROM payments WHERE clerk_id=? AND course_id=? AND status IN ('Creating','Pending','Paid')",args:[id,course.id]})).rows[0];
  if(row?.status==="Paid") { await fulfill(String(row.id));return "You are enrolled. Open My learning."; }
  if(row?.status!=="Pending")return "An earlier checkout is awaiting confirmation. Contact admissions before retrying.";
 } catch {return "Checkout could not be completed. Contact admissions if an earlier payment is pending.";}
 const next=checkoutHref(kind,slug);
 redirect(next+(next.includes("?")?"&":"?")+"pay=1");
}
