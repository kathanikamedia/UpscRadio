"use client";
import {Localized} from "@/components/localized";

import Link from "next/link";
import { SiteText, LanguageSwitch } from "./site-language";
import { AuthControls } from "./auth-controls";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CartLink } from "./cart";
import { ShopMenu } from "./shop-menu";
import { Heart } from "lucide-react";
export function Header({configured}:{configured:boolean}) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return <Localized>{<header><div className={"wrap header " + (open ? "open" : "")}>
    <Link className="brand" href="/"><span className="wordmark">UPSC <span>Radio</span></span></Link>
    <button className="menu" aria-controls="nav" aria-expanded={open} onClick={() => setOpen(!open)}><SiteText>Menu</SiteText></button>
    <nav id="nav" aria-label="Main navigation"><ShopMenu onNavigate={()=>setOpen(false)}/>{[["/courses/","Courses"],["/test-series/","Mock Test"],["/resources/","Study materials"],["/explore/videos/","Watch"],["/explore/about/","About us"]].map(([href,label]) => <Link key={href} href={href} prefetch={true} aria-current={path === href || (href!=="/" && path.startsWith(href)) ? "page" : undefined} onClick={() => setOpen(false)}>{<SiteText>{label}</SiteText>}</Link>)}</nav>
    <div className="account"><LanguageSwitch compact/><span className="account-divider" aria-hidden="true"/><CartLink/><Link className="cart-link wishlist-link" href="/student/saved/" prefetch={true} aria-label="Wishlist" title="Wishlist" aria-current={path==="/student/saved/"?"page":undefined}><Heart size={19} aria-hidden="true"/><span><SiteText>Wishlist</SiteText></span></Link><AuthControls configured={configured}/></div>
  </div></header>}</Localized>;
}
