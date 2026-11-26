"use client";
import {Localized} from "@/components/localized";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
const groups=[
 {title:"TSPSC",links:[["Study Materials","/resources/?exam=TSPSC"],["Courses","/courses/?q=TSPSC"],["Mock tests","/test-series/?exam=TSPSC"]]},
 {title:"APPSC",links:[["Study Materials","/resources/?exam=APPSC"],["Courses","/courses/?q=APPSC"],["Mock tests","/test-series/?exam=APPSC"]]},
 {title:"Current Affairs",links:[["All current affairs","/resources/?q=current+affairs"],["Daily","/resources/?q=daily+current+affairs"],["Weekly","/resources/?q=weekly+current+affairs"],["Monthly","/resources/?q=monthly+current+affairs"]]},
 {title:"Other Study Materials",links:[["All study materials","/resources/"],["Books","/books/"],["Previous Year Papers","https://www.upsc.gov.in/examinations/previous-question-papers"]]},
];
export function ShopMenu({onNavigate}:{onNavigate:()=>void}){
 const root=useRef<HTMLDetailsElement>(null);
 function close(){if(root.current){root.current.open=false;root.current.querySelectorAll("details").forEach(d=>d.open=false);}onNavigate();}
 useEffect(()=>{function outside(event:PointerEvent){if(root.current&&!root.current.contains(event.target as Node))root.current.open=false;}function escape(event:KeyboardEvent){if(event.key==="Escape"&&root.current?.open){root.current.open=false;root.current.querySelector("summary")?.focus();}}document.addEventListener("pointerdown",outside);document.addEventListener("keydown",escape);return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape);};},[]);
 return <Localized>{<details ref={root} className="shop-menu"><summary>Shop <ChevronDown size={13} aria-hidden="true"/></summary><div className="shop-dropdown"><Link href="/resources/?exam=UPSC" onClick={close}>UPSC</Link>{groups.map(group=><details className="shop-submenu" key={group.title} onToggle={event=>{const current=event.currentTarget;if(current.open)root.current?.querySelectorAll<HTMLDetailsElement>(".shop-submenu").forEach(other=>{if(other!==current)other.open=false;});}}><summary>{group.title}<ChevronRight size={14} aria-hidden="true"/></summary><div className="shop-submenu-links">{group.links.map(([label,href])=><Link key={href} href={href} onClick={close} target={href.startsWith("https:")?"_blank":undefined} rel={href.startsWith("https:")?"noopener noreferrer":undefined}>{label}{href.startsWith("https:")?" ↗":""}</Link>)}</div></details>)}<Link href="/test-series/#test-schedule" onClick={close}>Test Series Schedules</Link><Link className="shop-all" href="/courses/" onClick={close}>Shop All ↗</Link></div></details>}</Localized>;
}
