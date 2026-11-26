
import {Localized} from "@/components/localized";
import {requireUser} from "@/lib/auth";
import {execute,type Content} from "@/lib/db";
import {notFound} from "next/navigation";
import {PurchaseLayout} from "@/components/purchase-layout";
import {paymentMode} from "@/lib/payment-policy";
import Link from "next/link";
import {CheckCircle2,Download} from "lucide-react";
export const metadata={title:"Payment receipt",robots:{index:false,follow:false}};
export default async function Receipt({params}:{params:Promise<{id:string}>}){
 const {id}=await params,user=await requireUser(`/student/receipt/${id}/`);
 const p=(await execute({sql:"SELECT p.*,c.title,c.slug,c.kind,c.summary,c.category,c.extra FROM payments p JOIN content c ON p.course_id=c.id WHERE p.id=? AND p.clerk_id=? AND p.status='Paid'",args:[id,user]})).rows[0];if(!p)notFound();
 const extra=JSON.parse(String(p.extra)),item:Content={id:Number(p.course_id),kind:String(p.kind),slug:String(p.slug),title:String(p.title),summary:String(p.summary),body:"",category:String(p.category),published:1,extra};
 return <PurchaseLayout item={item} amount={Number(p.amount)} test={paymentMode()==="test"} heading="Payment confirmed"><Localized><p className="purchase-owned"><CheckCircle2 size={19}/> Your access is ready</p><p>Thank you. Your purchase is saved in My learning.</p>{item.kind==="resource"?<a className="button" href={`/downloads/${item.slug}/`}><Download size={16}/> Download PDF</a>:extra.question_bank?<><Link className="button" href={`/student/exam/${extra.question_bank}/`}>Start or resume test</Link><a className="button secondary" href={`/api/mock-tests/${extra.question_bank}/pdf/`}><Download size={16}/> Download test PDF</a></>:<Link className="button" href={`/courses/${item.slug}/`}>Open your bundle</Link>}<Link className="button secondary" href="/student/">Go to My learning</Link><details className="purchase-receipt-details"><summary>Payment details</summary><dl><div><dt>Receipt</dt><dd>{String(p.id)}</dd></div><div><dt>Transaction</dt><dd>{String(p.payment_id)}</dd></div><div><dt>Payment time (UTC)</dt><dd>{String(p.captured)}</dd></div></dl></details></Localized></PurchaseLayout>;
}
