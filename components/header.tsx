"use client";
import Link from "next/link";
import { AuthControls } from "./auth-controls";
import { usePathname } from "next/navigation";
import { useState } from "react";
export function Header({configured}:{configured:boolean}) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return <header><div className={"wrap header " + (open ? "open" : "")}>
    <Link className="brand" href="/"><span className="wordmark">UPSC <span>Radio</span></span></Link>
    <button className="menu" aria-controls="nav" aria-expanded={open} onClick={() => setOpen(!open)}>Menu</button>
    <nav id="nav" aria-label="Main navigation">{[["/courses/","Courses"],["/test-series/","Mock Test"],["/resources/","Study Materials"],["/explore/videos/","Watch"],["/explore/about/","About"]].map(([href,label]) => <Link key={href} href={href} aria-current={path === href ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}</nav>
    <div className="account"><AuthControls configured={configured}/><Link className="button small" href="/admissions/">Free counselling ↗</Link></div>
  </div></header>;
}
