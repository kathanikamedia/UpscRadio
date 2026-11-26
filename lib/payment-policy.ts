export type Sellable={kind?:string;published?:boolean|number;extra:Record<string,unknown>;category?:string};
export function paymentMode(key=process.env.RAZORPAY_KEY_ID||""){return key.startsWith("rzp_test_")?"test":key.startsWith("rzp_live_")?"live":null;}
export function checkoutReady(item:Sellable,{configured,testMode=false,moodle=false}:{configured:boolean;testMode?:boolean;moodle?:boolean}){
 const e=item.extra,price=Number(e.price_paise);
 const simulatedMock=testMode&&item.category==="Test Series"&&typeof e.question_bank==="string"&&e.question_bank.length>0;
 if(!configured||!item.published||e.sale_enabled===false||(e.demo&&!simulatedMock)||!Number.isSafeInteger(price)||price<100)return false;
 if(!testMode&&e.purchase_enabled!==true)return false;
 if(item.kind==="resource")return typeof e.storage_key==="string"&&e.storage_key.length>0;
 if(e.pricing_model==="bundle"&&Number(e.bundle_material_count||0)<1)return false;
 return Boolean((item.category==="Test Series"&&e.question_bank)||(e.delivery==="native")||(moodle&&Number(e.moodle_course_id)>0));
}
