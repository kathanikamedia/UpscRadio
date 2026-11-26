import {Localized} from "./localized";
import {ActionForm} from "./action-form";
import {beginCheckout} from "@/app/checkout/[slug]/actions";
import type {ProductKind} from "@/lib/course-pricing";
/** Optional coupon input placed inside a checkout form. Hidden behind a link so it doesn't distract buyers without one. */
export function CouponField(){
 return <Localized><details className="coupon-field"><summary>Have a coupon code?</summary><input name="coupon" placeholder="Enter code" autoComplete="off" aria-label="Coupon code"/></details></Localized>;
}
/** Re-quotes an unpaid order with a coupon. */
export function CouponBox({slug,kind}:{slug:string;kind:ProductKind}){
 return <ActionForm action={beginCheckout} label="Apply coupon"><input type="hidden" name="slug" value={slug}/><input type="hidden" name="kind" value={kind}/><label className="coupon-inline">Coupon code<input name="coupon" placeholder="Enter code" autoComplete="off" required/></label></ActionForm>;
}
