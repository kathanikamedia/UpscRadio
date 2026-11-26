export type Sellable={published?:boolean|number;extra:Record<string,unknown>;category?:string};
export function paymentMode(key=process.env.RAZORPAY_KEY_ID||""){return key.startsWith("rzp_test_")?"test":key.startsWith("rzp_live_")?"live":null;}
export function checkoutReady(item:Sellable,{configured,testAdmin=false,moodle=false}:{configured:boolean;testAdmin?:boolean;moodle?:boolean}){
 const e=item.extra,price=Number(e.price_paise);
 if(!configured||!item.published||e.demo||!Number.isSafeInteger(price)||price<100)return false;
 if(!testAdmin&&e.purchase_enabled!==true)return false;
 return Boolean((item.category==="Test Series"&&e.question_bank)||(e.delivery==="native")||(moodle&&Number(e.moodle_course_id)>0));
}
