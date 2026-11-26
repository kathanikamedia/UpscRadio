
import {Localized} from "@/components/localized";
import { requireUser } from "@/lib/auth";
import { execute } from "@/lib/db";
import { notFound } from "next/navigation";
export const metadata={title:"Payment receipt",robots:{index:false,follow:false}};
export default async function Receipt({params}:{params:Promise<{id:string}>}) {
 const user=await requireUser(),{id}=await params;
 const result=await execute({sql:"SELECT p.*,c.title FROM payments p JOIN content c ON p.course_id=c.id WHERE p.id=? AND p.clerk_id=? AND p.status='Paid'",args:[id,user]});
 const p=result.rows[0];if(!p)notFound();
 return <Localized>{<section className="wrap section narrow"><h1>Payment receipt</h1><article className="card"><h2>UPSC RADIO</h2><p>{String(p.title)}</p><p>Received ₹{(Number(p.amount)/100).toLocaleString("en-IN")}</p><p>Receipt {String(p.id)}</p><p>Transaction {String(p.payment_id)}</p><p>{String(p.captured)}</p></article></section>}</Localized>;
}
