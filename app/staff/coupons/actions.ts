"use server";
import {revalidatePath} from "next/cache";
import {requireAdmin} from "@/lib/auth";
import {execute} from "@/lib/db";
import {normaliseCode} from "@/lib/coupons";
export async function createCoupon(_state:string,data:FormData){
 const admin=await requireAdmin();
 const code=normaliseCode(data.get("code"));if(!code)return "Use 3–30 letters, numbers, - or _ for the code.";
 const type=String(data.get("type")),value=Number(data.get("value"));
 if(!Number.isFinite(value)||value<=0)return "Enter a discount above zero.";
 if(type==="percent"&&(value>90||!Number.isInteger(value)))return "Percentage discounts must be a whole number from 1 to 90.";
 const percent=type==="percent"?value:0,amount=type==="amount"?Math.round(value*100):0;
 const expires=String(data.get("expires")||"");if(expires&&Number.isNaN(Date.parse(expires)))return "Choose a valid expiry date.";
 const maxUses=Number(data.get("max_uses")||0);if(!Number.isInteger(maxUses)||maxUses<0)return "Maximum uses must be a whole number.";
 const result=await execute({sql:"INSERT OR IGNORE INTO coupons(code,percent_off,amount_off,expires,max_uses) VALUES (?,?,?,?,?)",args:[code,percent,amount,expires?expires+"T23:59:59+05:30":null,maxUses||null]});
 if(!result.rowsAffected)return "A coupon with that code already exists.";
 await execute({sql:"INSERT INTO audit(actor,action) VALUES (?,?)",args:[admin.id,`Created coupon ${code}`]});
 revalidatePath("/staff/coupons");return `Coupon ${code} created.`;
}
export async function toggleCoupon(data:FormData){
 const admin=await requireAdmin(),code=normaliseCode(data.get("code"));if(!code)return;
 await execute({sql:"UPDATE coupons SET active=1-active WHERE code=?",args:[code]});
 await execute({sql:"INSERT INTO audit(actor,action) VALUES (?,?)",args:[admin.id,`Toggled coupon ${code}`]});
 revalidatePath("/staff/coupons");
}
