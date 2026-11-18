import Link from "next/link";
import { latestPapers } from "@/lib/upsc";
import { Papers } from "@/components/papers";
import { Reveal } from "@/components/reveal";
import { ClipboardCheck, LibraryBig, Files } from "lucide-react";
import { contents } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Home() {
  const papers = await latestPapers();
  const news = (await contents("resource")).filter(item => item.category === "Official News" && item.slug !== "official-upsc-notices").slice(0,3);
  const featured=(await contents("course")).slice(0,3);
  const stories=(await contents("profile")).filter(p=>["Testimonial","Result"].includes(p.category)).slice(0,3);
  return <>
    <section className="showcase" aria-label="UPSC RADIO"><div className="wrap artwork-hero"><h1 className="hero-wordmark">UPSC <span>Radio</span></h1></div></section>
    <Reveal className="wrap home-feature-grid">
      {[["Mock Test","Browse UPSC practice tests and registration availability.","/test-series/","Browse mock tests"],["Study Materials","Find textbooks and published preparation resources.","/resources/","Browse study materials"],["Previous Year Papers","Official UPSC Prelims and Mains papers by year.","https://www.upsc.gov.in/examinations/previous-question-papers","Open UPSC archive"]].map(([title,text,href,label]) => <section className="card home-feature" key={title}><span className="feature-icon">{title==="Mock Test"?<ClipboardCheck/>:title==="Study Materials"?<LibraryBig/>:<Files/>}</span><h2>{title}</h2>{title==="Previous Year Papers"?<Papers initial={papers}/>:<p>{text}</p>}<Link className="button" href={href}>{label} ↗</Link></section>)}
    </Reveal>
    <div className="wrap home-resources"><section className="card home-reference"><h2>Latest UPSC news</h2>{news.map(item => <p key={item.id}><Link href={"/resources/"+item.slug+"/"}>{item.title}</Link></p>)}<a className="text-link" href="https://www.upsc.gov.in/whats-new">See official UPSC updates ↗</a></section>
    <section className="card home-reference"><h2>Courses</h2><Link className="text-link" href="/courses/">Explore courses ↗</Link></section></div>
    {featured.length ? <section className="wrap section"><div className="section-head"><h2>Featured courses</h2><Link href="/courses/">All courses ↗</Link></div><div className="grid">{featured.map(c=><article className="card" key={c.id}><p className="eyebrow">{c.category}</p><h3>{c.title}</h3><p>{c.summary}</p><Link href={"/courses/"+c.slug}>Explore course ↗</Link></article>)}</div></section>:null}
    {stories.length ? <section className="wrap section"><h2>Student stories</h2><div className="grid">{stories.map(s=><article className="card" key={s.id}><h3>{s.title}</h3><p>{s.summary}</p><Link href={"/people/"+s.slug}>Read story ↗</Link></article>)}</div></section>:null}
    <section className="wrap section faq"><h2>Questions about learning</h2><details><summary>How do I access my courses?</summary><p>Sign in and open My learning. Enrolled courses appear in your personal workspace.</p></details><details><summary>Where can I find official previous papers?</summary><p>Use Previous Year Papers above to open the UPSC archive.</p></details><details><summary>How can I ask about a course or mock test?</summary><p><Link href="/admissions/">Send an admissions request</Link> with your course or mock test enquiry.</p></details></section>
  </>;
}
