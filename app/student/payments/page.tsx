import {Localized} from "@/components/localized";
import {requireUser} from "@/lib/auth";
import {PaymentHistory} from "@/components/payment-history";
export const dynamic="force-dynamic";
export const metadata={title:"Payment history",robots:{index:false,follow:false}};
export default async function Payments(){
 const id=await requireUser("/student/payments/");
 return <Localized>{<div className="student-overview student-subpage"><header className="subpage-head"><div><p className="eyebrow">YOUR PURCHASES</p><h1>Payment history</h1><p>Every payment you made, with receipts. Unfinished payments can be completed from here.</p></div></header><PaymentHistory userId={id} limit={100}/></div>}</Localized>;
}
