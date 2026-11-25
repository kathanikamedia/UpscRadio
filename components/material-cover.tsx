import Image from "next/image";
import { FileText } from "lucide-react";
const covers:Record<string,string>={
 "ap-current-affairs-bit-bank-2026-english":"/materials/ap-current-affairs-2026-english.webp",
 "ap-current-affairs-bit-bank-2026-telugu":"/materials/ap-current-affairs-2026-telugu.webp",
 ...Object.fromEntries(["economy-part-1","economy-part-2","economy-part-3","economy-part-4","environment-part-1","environment-part-2","environment-part-3"].map(slug=>[slug,`/materials/${slug}.jpg`])),
};
export function MaterialCover({slug,title}:{slug:string;title:string}){const src=covers[slug];return src?<Image src={src} width={636} height={900} alt={`${title} cover`} sizes="(max-width: 700px) 90vw, 350px" style={{width:"100%",height:240,objectFit:"contain",background:"#faf6f9"}}/>:<FileText size={48} strokeWidth={1.2}/>;}
export function materialCoverPath(slug:string){return covers[slug];}
