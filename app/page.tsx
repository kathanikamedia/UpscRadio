import { Suspense } from "react";
import { HomePapers, HomeResources, HomeStories } from "@/components/home-content";
import Link from "next/link";
import Image from "next/image";
import { socials } from "@/lib/socials";
import { ClipboardCheck, LibraryBig, Files } from "lucide-react";
import { ConversionBanner } from "@/components/conversion-banner";
import { HomeDiscover } from "@/components/home-discover";
export const dynamic = "force-dynamic";
export default function Home() {
  return <>
    <section className="showcase hero-with-background" aria-label="UPSC RADIO">
      <Image className="hero-students-background" src="/group-study.webp" alt="" fill sizes="(max-width: 760px) 100vw, 75vw" preload />
      <div className="wrap aspirant-hero">
        <div className="aspirant-copy">
          <p className="hero-kicker"><span aria-hidden="true"/> FOR THE DREAM YOU KEEP SHOWING UP FOR</p>
          <h1 className="hero-wordmark">UPSC <span>Radio</span></h1>
          <p className="hero-emotion">Every hour you put in brings your dream closer.</p>
          <div className="hero-actions"><Link className="button hero-course-link" href="/test-series/" prefetch={true}>Mock Test ↗</Link><Link className="hero-secondary" href="/courses/" prefetch={true}>Explore courses <span aria-hidden="true">↗</span></Link></div>
        </div>
      </div>
    </section>
    <div className="wrap home-feature-grid">
      {[["Mock Test","Browse UPSC practice tests and registration availability.","/test-series/","Browse mock tests"],["Study Materials","Find textbooks and published preparation resources.","/resources/","Browse study materials"],["Previous Year Papers","Official UPSC Prelims and Mains papers by year.","https://www.upsc.gov.in/examinations/previous-question-papers","Open UPSC archive"]].map(([title,text,href,label]) => <section className="card home-feature" key={title}><span className="feature-icon">{title==="Mock Test"?<ClipboardCheck/>:title==="Study Materials"?<LibraryBig/>:<Files/>}</span><h2>{title}</h2>{title==="Previous Year Papers"?<Suspense fallback={<p className="feed-loading" role="status">Loading official papers…</p>}><HomePapers/></Suspense>:<p>{text}</p>}<Link className="button" href={href} target={href.startsWith("https://") ? "_blank" : undefined} rel={href.startsWith("https://") ? "noopener noreferrer" : undefined}>{label} ↗</Link></section>)}
    </div>
    <HomeResources />
    <Suspense fallback={null}><HomeStories/></Suspense>
    <HomeDiscover />
    <div className="wrap home-conversion"><ConversionBanner title="You’ve put in the hours. Now test your progress." text="Explore mock tests or find a course for your next step."/></div>
    <section className="wrap social-section" aria-labelledby="social-title">
      <div><p className="eyebrow">UPSC RADIO PODCAST</p><h2 id="social-title">Follow the conversation.</h2></div>
      <div className="social-links">
        {Object.entries(socials).map(([key,social])=><a key={key} target="_blank" rel="noopener noreferrer" href={social.url}><Image className="social-brand-logo" src={`/brands/${key}.${key==="facebook"?"svg":"png"}`} width={32} height={32} alt=""/><span><strong>{social.name}</strong><small>{social.handle}</small></span><span aria-hidden="true">↗</span></a>)}
      </div>
    </section>
    <section className="wrap section faq"><h2>Questions about learning</h2><details><summary>How do I access my courses?</summary><p>Sign in and open My learning. Enrolled courses appear in your personal workspace.</p></details><details><summary>Where can I find official previous papers?</summary><p>Use Previous Year Papers above to open the UPSC archive.</p></details><details><summary>How can I ask about a course or mock test?</summary><p><Link href="/admissions/">Send an admissions request</Link> with your course or mock test enquiry.</p></details></section>
  </>;
}
