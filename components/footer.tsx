import Link from "next/link";
import Image from "next/image";
import { socials } from "@/lib/socials";

export function Footer() {
  return <footer className="site-footer">
    <div className="wrap">
      <div className="footer-invitation"><div><p className="footer-kicker">ONE DAY. ONE CHAPTER. ONE STEP CLOSER.</p><h2>Your ambition deserves<br/>a place to grow.</h2></div><Link className="button footer-cta" href="/test-series/">Explore mock tests <span aria-hidden="true">↗</span></Link></div>
      <div className="footer-grid">
        <div className="footer-brand"><Link href="/" aria-label="UPSC Radio home">UPSC <span>Radio</span></Link><p>For the early starts, the late nights, and the dream that keeps you going.</p><div className="footer-socials">{Object.entries(socials).map(([key,social])=><a key={key} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={`${social.name} ${social.handle} (opens in a new tab)`}><Image src={`/brands/${key}.${key==="facebook"?"svg":"png"}`} width={24} height={24} alt=""/>{social.name}<span aria-hidden="true">↗</span></a>)}</div></div>
        <nav aria-label="Footer learning"><h3>Start learning</h3><Link href="/courses/">Courses</Link><Link href="/test-series/">Mock Test</Link><Link href="/resources/">Study Materials</Link><a href="https://www.upsc.gov.in/examinations/previous-question-papers" target="_blank" rel="noopener noreferrer">Previous Year Papers ↗</a></nav>
        <nav aria-label="Footer about"><h3>Discover</h3><Link href="/explore/about/">About us</Link><Link href="/explore/media/">Media & recognition</Link><Link href="/explore/videos/">YouTube & podcast</Link><Link href="/admissions/">Contact us</Link></nav>
        <nav aria-label="Footer account"><h3>Your space</h3><Link href="/cart/">Your cart</Link><Link href="/student/">Student dashboard</Link><Link href="/student/saved/">Wishlist</Link><Link href="/student/profile/">Your account</Link><Link href="/staff/">Staff sign in</Link></nav>
      </div>
      <div className="footer-bottom"><small>© {new Date().getFullYear()} UPSC Radio. All rights reserved.</small><span>Keep learning. Keep moving forward.</span><Link href="/explore/privacy/">Privacy policy</Link></div>
    </div>
  </footer>;
}
