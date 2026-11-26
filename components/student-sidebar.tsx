"use client";
import {Localized} from "@/components/localized";

import Link from "next/link";
import { SiteText } from "./site-language";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardCheck, Heart, UserRound, LibraryBig, ListChecks, GraduationCap, ArrowUpRight, CircleHelp } from "lucide-react";

const groups=[
 {label:"Your learning",items:[
  {href:"/student/",label:"Overview",Icon:LayoutDashboard},
  {href:"/student/free-test/",label:"Free mock test",Icon:ClipboardCheck},
  {href:"/student/free-course/",label:"Free starter course",Icon:GraduationCap},
  {href:"/student/saved/",label:"Wishlist",Icon:Heart},
  {href:"/student/profile/",label:"Profile and account",Icon:UserRound},
 ]},
 {label:"Explore",items:[
  {href:"/test-series/",label:"All mock tests",Icon:ListChecks},
  {href:"/courses/",label:"Find a course",Icon:LibraryBig},
 ]},
];
export function StudentSidebar(){
 const pathname=usePathname().replace(/\/$/,"");
 return <Localized>{<aside className="student-sidebar" aria-label="Student workspace"><div className="workspace-heading"><span className="workspace-symbol"><GraduationCap size={25} strokeWidth={1.6} aria-hidden="true"/></span><div><span className="workspace-kicker">UPSC RADIO</span><h2><SiteText>My workspace</SiteText></h2></div></div>
 <nav className="workspace-navigation" aria-label="Student navigation">{groups.map(group=><div className="workspace-group" key={group.label}><p>{<SiteText>{group.label}</SiteText>}</p><ul>{group.items.map(({href,label,Icon})=>{const base=href.replace(/\/$/,""),active=base==="/student"?pathname===base||pathname.startsWith("/student/course/")||pathname.startsWith("/student/receipt/"):pathname===base||pathname.startsWith(base+"/");return <li key={href}><Link href={href} aria-current={active?"page":undefined}><Icon size={19} strokeWidth={1.7} aria-hidden="true"/><span>{<SiteText>{label}</SiteText>}</span>{group.label==="Explore"?<ArrowUpRight className="workspace-arrow" size={14} aria-hidden="true"/>:null}</Link></li>;})}</ul></div>)}</nav>
 <Link className="workspace-help" href="/admissions/"><CircleHelp size={18} aria-hidden="true"/><span><SiteText>Need a hand?</SiteText><small><SiteText>Get in touch with us</SiteText></small></span><ArrowUpRight size={14} aria-hidden="true"/></Link></aside>}</Localized>;
}
