import Link from "next/link";

export function HomeDiscover() {
  return <>
    <section className="wrap section organisation-section" aria-label="Our organisation">
    <div className="organisation-panel"><div><p className="eyebrow">OUR ORGANISATION</p><h2>A shared dream.<br/>A steady commitment.</h2></div><div><p>UPSC Radio brings together exam preparation and Telugu conversations around the journey to public service.</p><p>Explore courses, mock tests, study materials and official previous papers in one place, and use your student dashboard to return to your learning.</p><Link className="text-link" href="/explore/about/">Get to know UPSC Radio ↗</Link></div></div></section>
  </>;
}
