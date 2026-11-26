
import {Localized} from "@/components/localized";
import Image from "next/image";
import { FileText } from "lucide-react";
import economy1 from "@/public/materials/economy-part-1-cover.webp";
import economy2 from "@/public/materials/economy-part-2-cover.webp";
import economy3 from "@/public/materials/economy-part-3-cover.webp";
import economy4 from "@/public/materials/economy-part-4-cover.webp";
import environment1 from "@/public/materials/environment-part-1-cover.webp";
import environment2 from "@/public/materials/environment-part-2-cover.webp";
import environment3 from "@/public/materials/environment-part-3-cover.webp";
import currentEnglish from "@/public/materials/ap-current-affairs-2026-english.webp";
import currentTelugu from "@/public/materials/ap-current-affairs-2026-telugu.webp";
const covers:Record<string,string>={
 "ap-current-affairs-bit-bank-2026-english":currentEnglish.src,
 "ap-current-affairs-bit-bank-2026-telugu":currentTelugu.src,
 "economy-part-1":economy1.src,"economy-part-2":economy2.src,"economy-part-3":economy3.src,"economy-part-4":economy4.src,"environment-part-1":environment1.src,"environment-part-2":environment2.src,"environment-part-3":environment3.src,
};
export function MaterialCover({slug,title,eager=false}:{slug:string;title:string;eager?:boolean}){const src=covers[slug];return <Localized>{src?<Image unoptimized loading={eager?"eager":"lazy"} src={src} width={636} height={900} alt={`${title} cover`} sizes="(max-width: 700px) 90vw, 350px" style={{width:"100%",height:240,objectFit:"contain",background:"#faf6f9"}}/>:<FileText size={48} strokeWidth={1.2}/>}</Localized>;}
export function materialCoverPath(slug:string){return covers[slug];}
