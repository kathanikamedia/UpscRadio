import {execute} from "./db";
export type Coupon={code:string;percent_off:number;amount_off:number};
// Razorpay rejects orders below ₹1, so a coupon never takes a paid item below that.
export const MIN_PAISE=100;
export function normaliseCode(raw:unknown){const code=String(raw??"").trim().toUpperCase();return /^[A-Z0-9_-]{3,30}$/.test(code)?code:"";}
export function discountFor(amount:number,coupon:Coupon|null){
 if(!coupon||amount<=MIN_PAISE)return 0;
 const off=coupon.percent_off>0?Math.floor(amount*Math.min(coupon.percent_off,100)/100):Math.max(0,coupon.amount_off);
 return Math.min(off,amount-MIN_PAISE);
}
/** Splits a discounted total across items in proportion to their prices; the parts always add up to the total. */
export function allocate(prices:number[],total:number){
 const subtotal=prices.reduce((sum,price)=>sum+price,0);if(!subtotal)return prices.map(()=>0);
 const parts=prices.map(price=>Math.floor(price*total/subtotal));parts[0]+=total-parts.reduce((sum,part)=>sum+part,0);return parts;
}
export async function findCoupon(raw:unknown):Promise<{coupon:Coupon|null;error?:string}>{
 if(!String(raw??"").trim())return {coupon:null};
 const code=normaliseCode(raw);if(!code)return {coupon:null,error:"That coupon code is not valid."};
 const row=(await execute({sql:"SELECT * FROM coupons WHERE code=?",args:[code]})).rows[0];
 if(!row||!Number(row.active))return {coupon:null,error:"That coupon code is not valid."};
 if(row.expires&&Date.parse(String(row.expires))<Date.now())return {coupon:null,error:"That coupon has expired."};
 if(row.max_uses!==null&&Number(row.max_uses)>0&&Number(row.used)>=Number(row.max_uses))return {coupon:null,error:"That coupon has been fully used."};
 return {coupon:{code,percent_off:Number(row.percent_off)||0,amount_off:Number(row.amount_off)||0}};
}
export async function reserveRedemption(orderId:string,code:string,clerk:string){await execute({sql:"INSERT OR IGNORE INTO coupon_redemptions(order_id,code,clerk_id) VALUES (?,?,?)",args:[orderId,code,clerk]});}
export async function confirmRedemption(orderId:string){
 const row=(await execute({sql:"UPDATE coupon_redemptions SET status='Paid' WHERE order_id=? AND status='Pending' RETURNING code",args:[orderId]})).rows[0];
 if(row)await execute({sql:"UPDATE coupons SET used=used+1 WHERE code=?",args:[String(row.code)]});
}
