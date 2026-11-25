import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { contents } from "@/lib/db";
import { currentAffairsDrafts, additionalMaterialDrafts } from "@/lib/study-material-drafts";
import { StudyMaterialDetail } from "@/components/study-material-detail";
import { FileLock2 } from "lucide-react";
export const dynamic="force-dynamic";
export const metadata={title:"Material draft previews",robots:{index:false,follow:false}};
export default async function MaterialDrafts(){
 await requireAdmin();
 const slugs=new Set<string>([...currentAffairsDrafts,...additionalMaterialDrafts].map(item=>item.slug));
 const drafts=(await contents("resource",false)).filter(item=>slugs.has(item.slug)&&!item.published);
 return <section className="staff-materials-page"><div className="staff-page staff-materials-header"><header className="staff-page-header"><div><p className="eyebrow">PRIVATE CATALOGUE</p><h1>Study material drafts</h1><p>Review every title, cover and access rule before a material reaches learners.</p></div><Link className="button secondary" href="/staff/?kind=resource">Catalogue editor ↗</Link></header><div className="staff-guidance"><FileLock2 size={18}/><p><strong>Protected by design.</strong> These PDFs are private in R2 and cannot be downloaded or sold until payment access is activated.</p></div></div>{drafts.map(item=><StudyMaterialDetail key={item.id} item={item} preview/>)}{!drafts.length?<div className="staff-page staff-empty">No matching unpublished drafts found.</div>:null}</section>;
}
