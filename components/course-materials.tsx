
import {Localized} from "@/components/localized";
import Link from "next/link";
import {BookOpen,FileText,Check,ArrowUpRight} from "lucide-react";
import {publishedCourseMaterials,publishedContent} from "@/lib/public-catalogue";
import {materialAccess,ownsProduct} from "@/lib/material-access";
import {bundleComparison,checkoutHref,rupees} from "@/lib/course-pricing";
import {checkoutReady,paymentMode} from "@/lib/payment-policy";
import {paymentsConfigured} from "@/lib/payments";
import type {Content} from "@/lib/db";
export async function CourseMaterials({slug,course,userId=null}:{slug:string;course?:Content;userId?:string|null}){
 const [rows,parent]=await Promise.all([publishedCourseMaterials(slug),course||publishedContent("course",slug)]);
 if(!parent)return null;
 const pdfs=rows.filter(row=>Boolean(row.extra.storage_key)),price=Number(parent.extra.price_paise)||0;
 const [owned,access]=await Promise.all([ownsProduct(userId,parent.id),Promise.all(rows.map(row=>materialAccess(userId,{id:row.id,extra:row.extra})))]);
 const comparison=bundleComparison(price,pdfs.map(row=>({price:row.price,owned:access[rows.indexOf(row)].allowed})));
 const testMode=paymentMode()==="test",options={configured:paymentsConfigured,testMode};
 const bundleReady=checkoutReady({...parent,extra:{...parent.extra,bundle_material_count:pdfs.length}},options);
 return <Localized><section className="course-pricing" aria-labelledby="course-pricing-title"><div className="library-section-title"><h2 id="course-pricing-title">Choose how you learn</h2><span>Full bundle or individual materials</span></div><article className="bundle-price-card"><div><span className="bundle-kicker"><BookOpen size={15}/> Full course bundle</span><h3>{parent.title}</h3><p>{pdfs.length} study materials included</p><small>One purchase gives you access to every published study material in this course.</small></div><div className="bundle-price-action"><strong>{price?rupees(price):"Bundle price to be announced"}</strong>{comparison.savings>0?<span className="bundle-saving">You save {rupees(comparison.savings)}</span>:null}{comparison.savings>0?<small>{access.some(item=>item.individual)?"Remaining materials separately:":"Individual total:"} {rupees(comparison.individualTotal)}</small>:null}{owned?<a className="button secondary" href="#course-material-list"><Check size={16}/> You own this bundle</a>:bundleReady?<Link className="button" href={checkoutHref("course",slug)}>Buy full bundle <ArrowUpRight size={16}/></Link>:<span className="bundle-pending">{pdfs.length?"Bundle checkout is not available yet":"Materials will be added here"}</span>}</div></article><div className="library-section-title material-pricing-title"><h3>Or choose individual materials</h3><span>Buy only what you need</span></div><div className="course-material-grid" id="course-material-list">{rows.map((row,index)=>{
 const entitlement=access[index],available=checkoutReady({kind:"resource",published:true,extra:row.extra},options);
 return <article className="course-material-card" key={row.id}><div className="material-price-top"><span className="material-price-icon"><FileText size={23}/></span><strong>{row.price?rupees(row.price):"Free"}</strong></div><small>{row.language} · PDF</small><h4>{row.title}</h4><p>{row.summary}</p>{entitlement.bundle?<span className="material-owned"><Check size={14}/> Included in your bundle</span>:entitlement.individual?<span className="material-owned"><Check size={14}/> Purchased</span>:null}<div className="material-price-actions">{entitlement.allowed&&row.extra.storage_key?<a className="button secondary" href={`/downloads/${row.slug}/`} target="_blank" rel="noopener noreferrer">Download PDF</a>:available?<Link className="button" href={checkoutHref("resource",row.slug)}>Buy material</Link>:null}<Link className="material-details-link" href={`/resources/${row.slug}/`}>View details <ArrowUpRight size={13}/></Link></div></article>;
 })}</div>{!rows.length?<p className="course-material-empty">No study materials have been added to this bundle yet.</p>:null}</section></Localized>;
}
