import {Localized} from "@/components/localized";
import Link from "next/link";
import {execute} from "@/lib/db";
const PAY_LABEL:Record<string,[string,string]>={Paid:["Paid","is-paid"],Pending:["Payment not completed","is-pending"],Refunded:["Refunded","is-refunded"]};
export async function PaymentHistory({userId,limit=20,preview=false}:{userId:string;limit?:number;preview?:boolean}){
 // Abandoned/Creating rows are internal states (a closed payment window, or a cart that replaced it), not purchases.
 const payments=await execute({sql:"SELECT p.id,p.status,p.fulfilled,p.amount,c.title,c.slug,c.kind FROM payments p JOIN content c ON c.id=p.course_id WHERE p.clerk_id=? AND p.status IN ('Paid','Pending','Refunded') ORDER BY p.rowid DESC LIMIT ?",args:[userId,limit]});
 return <Localized><section className="dashboard-section">{preview?<div className="section-head"><h2>Payment history</h2><Link href="/student/payments/">View all ↗</Link></div>:null}{payments.rows.length?payments.rows.map(payment=>{const status=String(payment.status),[label,tone]=PAY_LABEL[status]??[status,""];const retry=`/checkout/${payment.slug}/${payment.kind==="resource"?"?kind=resource":""}`;return <article className="payment-row" key={String(payment.id)}><div><strong>{String(payment.title)}</strong><small><span className={"pay-status "+tone}>{label}</span>{status==="Paid"&&!payment.fulfilled?"Course activation pending":null}</small></div><div className="payment-row-end"><span>₹{(Number(payment.amount)/100).toLocaleString("en-IN")}</span>{status==="Paid"?<Link href={"/student/receipt/"+payment.id}>Receipt ↗</Link>:status==="Pending"?<Link href={retry}>Complete payment ↗</Link>:null}</div></article>;}):<p className="muted">Your payment receipts will appear here after enrolment.</p>}</section></Localized>;
}

