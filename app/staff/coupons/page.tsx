import {requireAdmin} from "@/lib/auth";
import {execute} from "@/lib/db";
import {ActionForm} from "@/components/action-form";
import {createCoupon,toggleCoupon} from "./actions";
export const dynamic="force-dynamic";
export const metadata={title:"Coupons",robots:{index:false,follow:false}};
export default async function Coupons(){
 await requireAdmin();
 const rows=(await execute("SELECT * FROM coupons ORDER BY created DESC")).rows;
 return <section className="staff-page"><header className="staff-page-header"><div><p className="eyebrow">OFFERS</p><h1>Coupon codes</h1><p>Create discount codes for mock tests, courses and study materials. Paid items never drop below ₹1.</p></div></header>
 <section className="section coupon-admin"><h2>New coupon</h2><ActionForm action={createCoupon} label="Create coupon"><div className="coupon-admin-fields"><label>Code<input name="code" required placeholder="LAUNCH20" pattern="[A-Za-z0-9_-]{3,30}"/></label><label>Discount type<select name="type"><option value="percent">Percentage (%)</option><option value="amount">Fixed amount (₹)</option></select></label><label>Discount<input name="value" type="number" min="1" step="any" required placeholder="20"/></label><label>Expires on (optional)<input name="expires" type="date"/></label><label>Maximum uses (optional)<input name="max_uses" type="number" min="0" step="1" placeholder="Unlimited"/></label></div></ActionForm></section>
 <section className="section"><h2>Existing coupons</h2>{rows.length?<table className="coupon-table"><thead><tr><th>Code</th><th>Discount</th><th>Used</th><th>Expires</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(row=><tr key={String(row.code)}><td><strong>{String(row.code)}</strong></td><td>{Number(row.percent_off)?`${Number(row.percent_off)}%`:`₹${(Number(row.amount_off)/100).toLocaleString("en-IN")}`}</td><td>{Number(row.used)}{row.max_uses?` / ${Number(row.max_uses)}`:""}</td><td>{row.expires?new Date(String(row.expires)).toLocaleDateString("en-IN"):"Never"}</td><td>{Number(row.active)?"Active":"Paused"}</td><td><form action={toggleCoupon}><input type="hidden" name="code" value={String(row.code)}/><button className="button secondary">{Number(row.active)?"Pause":"Resume"}</button></form></td></tr>)}</tbody></table>:<p>No coupons yet.</p>}</section></section>;
}
