import Link from "next/link";
import { BookOpen, Globe2, Landmark, ArrowUpRight } from "lucide-react";

export function HomeDiscover() {
  return <>
    <section className="discovery-section" aria-labelledby="discovery-title"><div className="wrap">
      <div className="discovery-heading"><p className="eyebrow">MAKE EVERY STUDY SESSION COUNT</p><h2 id="discovery-title">Find your next chapter.</h2><p>Explore study materials by subject. Build your understanding, one topic at a time.</p></div>
      <div className="category-tiles">{[
        {title:"Indian Polity",subtitle:"Understand the institutions that shape India.",query:"polity",Icon:Landmark,number:"01"},
        {title:"Current Affairs",subtitle:"Connect today’s events to your preparation.",query:"current-affairs",Icon:Globe2,number:"02"},
        {title:"General Studies",subtitle:"Make room for a stronger foundation.",query:"general-studies",Icon:BookOpen,number:"03"},
      ].map(({title,subtitle,query,Icon,number})=><Link className="category-tile" href={`/resources/?topic=${query}`} key={title}><span className="category-number">{number} / EXPLORE</span><Icon className="category-art" strokeWidth={1} aria-hidden="true"/><div><h3>{title}</h3><p>{subtitle}</p></div><ArrowUpRight className="category-arrow" aria-hidden="true"/></Link>)}</div>
    </div></section>
    <section className="wrap section organisation-section" aria-label="Our organisation">
    <div className="organisation-panel"><div><p className="eyebrow">OUR ORGANISATION</p><h2>A shared dream.<br/>A steady commitment.</h2></div><div><p>UPSC Radio brings together exam preparation and Telugu conversations around the journey to public service.</p><p>Explore courses, mock tests, study materials and official previous papers in one place, and use your student dashboard to return to your learning.</p><Link className="text-link" href="/explore/about/">Get to know UPSC Radio ↗</Link></div></div></section>
  </>;
}
