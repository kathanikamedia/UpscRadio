import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { contents } from "@/lib/db";
import { currentAffairsDrafts } from "@/lib/study-material-drafts";
import { StudyMaterialDetail } from "@/components/study-material-detail";
export const dynamic="force-dynamic";
export const metadata={title:"Material draft previews",robots:{index:false,follow:false}};
export default async function MaterialDrafts(){
 await requireAdmin();
 const slugs=new Set<string>(currentAffairsDrafts.map(item=>item.slug));
 const drafts=(await contents("resource",false)).filter(item=>slugs.has(item.slug)&&!item.published);
 return <><div className="wrap section"><p className="eyebrow">STAFF REVIEW</p><h1>Study material drafts</h1><p>Two private PDF listings for review. No purchase or download is enabled.</p><Link href="/staff/?kind=resource">Back to catalogue management ↗</Link></div>{drafts.map(item=><StudyMaterialDetail key={item.id} item={item} preview/>)}{!drafts.length?<div className="wrap section">No matching unpublished drafts found.</div>:null}</>;
}
