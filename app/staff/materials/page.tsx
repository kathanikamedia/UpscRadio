import Link from "next/link";
import {requireAdmin} from "@/lib/auth";
import {contents} from "@/lib/db";
import {MaterialUploadForm} from "@/components/material-upload-form";
import {StudyMaterialDetail} from "@/components/study-material-detail";
export const dynamic="force-dynamic";
export const metadata={title:"Manage study materials",robots:{index:false,follow:false}};
export default async function Materials({searchParams}:{searchParams:Promise<{edit?:string;preview?:string}>}){
 await requireAdmin();const query=await searchParams,items=await contents("resource",false),edit=items.find(item=>String(item.id)===query.edit),preview=items.find(item=>String(item.id)===query.preview);
 return <section className="staff-materials-page"><div className="staff-page"><header className="staff-page-header"><div><p className="eyebrow">MATERIAL MANAGEMENT</p><h1>Study materials</h1><p>Upload PDFs, manage descriptions and publish your catalogue.</p></div><Link className="button" href="/staff/materials/#upload">Upload new PDF</Link></header><div className="staff-content-grid">{items.map(item=><article className="staff-content-card" key={item.id}><span className={item.published?"status-live":"status-draft"}>{item.published?"Published":"Draft"}</span><h2>{item.title}</h2><p>{item.category} · {String(item.extra.language||"Language pending")} · ₹{Number(item.extra.price_paise||0)/100}</p><div className="actions"><Link href={"?edit="+item.id+"#upload"}>Edit / replace PDF</Link><Link href={"?preview="+item.id+"#preview"}>Preview</Link>{item.published?<Link href={"/resources/"+item.slug+"/"}>View listing ↗</Link>:null}</div></article>)}</div><section id="upload" style={{scrollMarginTop:110,marginTop:30}}><MaterialUploadForm key={edit?.id||"new"} item={edit}/>{edit?<Link href="/staff/materials/#upload">Create a new material instead</Link>:null}</section></div>{preview?<div id="preview"><StudyMaterialDetail item={preview} preview/></div>:null}</section>;
}
