"use client";
import {Localized} from "@/components/localized";

import Link from "next/link";
import { SiteText, LanguageSwitch } from "./site-language";
import { AuthControls } from "./auth-controls";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CartLink } from "./cart";
import { ShopMenu } from "./shop-menu";
export function Header({configured}:{configured:boolean}) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return <Localized>{<header><div className={"wrap header " + (open ? "open" : "")}>
    <Link className="brand" href="/"><span className="wordmark">UPSC <span>Radio</span></span></Link>
    <button className="menu" aria-controls="nav" aria-expanded={open} onClick={() => setOpen(!open)}><SiteText>Menu</SiteText></button>
    <nav id="nav" aria-label="Main navigation"><ShopMenu onNavigate={()=>setOpen(false)}/>{[["/courses/","Courses"],["/test-series/","Mock Test"],["/explore/videos/","Watch"],["/explore/about/","About us"]].map(([href,label]) => <Link key={href} href={href} prefetch={true} aria-current={path === href ? "page" : undefined} onClick={() => setOpen(false)}>{<SiteText>{label}</SiteText>}</Link>)}</nav>
    <div className="account"><LanguageSwitch/><CartLink/><AuthControls configured={configured}/></div>
  </div></header>}</Localized>;
}
