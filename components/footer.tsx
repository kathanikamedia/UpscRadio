import Link from "next/link";
import { SiteText } from "./site-language";
import Image from "next/image";
import { socials } from "@/lib/socials";

export function Footer() {
  return <footer className="site-footer">
    <div className="wrap">
      <div className="footer-invitation"><div><p className="footer-kicker"><SiteText>ONE DAY. ONE CHAPTER. ONE STEP CLOSER.</SiteText></p><h2><SiteText>Your ambition deserves</SiteText><br/><SiteText>a place to grow.</SiteText></h2></div><Link className="button footer-cta" href="/test-series/">Explore mock tests <span aria-hidden="true">↗</span></Link></div>
      <div className="footer-grid">
        <div className="footer-brand"><Link href="/" aria-label="UPSC Radio home">UPSC <span>Radio</span></Link><p><SiteText>For the early starts, the late nights, and the dream that keeps you going.</SiteText></p><div className="footer-socials">{Object.entries(socials).map(([key,social])=><a key={key} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={`${social.name} ${social.handle} (opens in a new tab)`}><Image src={`/brands/${key}.${key==="facebook"?"svg":"png"}`} width={24} height={24} alt=""/>{social.name}<span aria-hidden="true">↗</span></a>)}</div></div>
        <nav aria-label="Footer learning"><h3><SiteText>Start learning</SiteText></h3><Link href="/courses/"><SiteText>Courses</SiteText></Link><Link href="/test-series/"><SiteText>Mock Test</SiteText></Link><Link href="/resources/"><SiteText>Study Materials</SiteText></Link><a href="https://www.upsc.gov.in/examinations/previous-question-papers" target="_blank" rel="noopener noreferrer"><SiteText>Previous Year Papers ↗</SiteText></a></nav>
        <nav aria-label="Footer about"><h3><SiteText>Discover</SiteText></h3><Link href="/explore/about/"><SiteText>About us</SiteText></Link><Link href="/explore/media/"><SiteText>Media & recognition</SiteText></Link><Link href="/explore/videos/"><SiteText>YouTube & podcast</SiteText></Link><Link href="/admissions/"><SiteText>Contact us</SiteText></Link></nav>
        <nav aria-label="Footer account"><h3><SiteText>Your space</SiteText></h3><Link href="/cart/"><SiteText>Your cart</SiteText></Link><Link href="/student/"><SiteText>Student dashboard</SiteText></Link><Link href="/student/saved/"><SiteText>Wishlist</SiteText></Link><Link href="/student/profile/"><SiteText>Your account</SiteText></Link><Link href="/staff/"><SiteText>Staff sign in</SiteText></Link></nav>
      </div>
      <div className="footer-bottom"><small>© {new Date().getFullYear()} UPSC Radio. All rights reserved.</small><span><SiteText>Keep learning. Keep moving forward.</SiteText></span><Link href="/explore/privacy/"><SiteText>Privacy policy</SiteText></Link></div>
    </div>
  </footer>;
}
