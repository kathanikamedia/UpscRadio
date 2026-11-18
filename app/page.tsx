import { Suspense } from "react";
import { HomePapers, HomeResources, HomeStories } from "@/components/home-content";
import Link from "next/link";
import Image from "next/image";
import { socials } from "@/lib/socials";
import { ClipboardCheck, LibraryBig, Files, ChevronDown, ArrowUpRight, Check, Headphones, BookOpen, Target } from "lucide-react";
import { ConversionBanner } from "@/components/conversion-banner";
import { HomeDiscover } from "@/components/home-discover";
export const dynamic = "force-dynamic";
export default function Home() {
  return <div className="home-redesign">
    <section className="learning-hero" aria-labelledby="learning-hero-title">
      <div className="wrap">
        <div className="learning-hero-copy">
          <p className="learning-badge"><span aria-hidden="true"/> UPSC RADIO · PREPARE WITH PURPOSE</p>
          <h1 id="learning-hero-title">Your UPSC dream.<br/><span>Closer, every day.</span></h1>
          <p>For the early starts. The late nights. The future you believe in.<br className="desktop-break"/> Make your next study session count.</p>
          <div className="learning-hero-actions"><Link className="button" href="/test-series/" prefetch={true}>Explore mock tests <ArrowUpRight size={17} aria-hidden="true"/></Link><Link className="button secondary" href="/courses/" prefetch={true}>Find your course <ArrowUpRight size={17} aria-hidden="true"/></Link></div>
        </div>
        <div className="learning-hero-scene">
          <div className="learning-scene-halo" aria-hidden="true"/>
          <Image className="learning-students" src="/group-study.webp" alt="A group of aspirants studying together with books and notes" width={1774} height={887} sizes="(max-width: 700px) 100vw, 800px" preload/>
          <div className="learning-note learning-note-focus"><span className="learning-note-icon"><Target size={17} aria-hidden="true"/></span><strong>A little progress, daily.</strong><div className="focus-checks"><span><Check aria-hidden="true"/> Learn</span><span><Check aria-hidden="true"/> Revise</span><span><Check aria-hidden="true"/> Practice</span></div></div>
          <Link href="/test-series/" className="learning-note learning-note-mock"><span className="learning-note-label">YOUR NEXT CHALLENGE <ArrowUpRight size={15} aria-hidden="true"/></span><ClipboardCheck size={27} aria-hidden="true"/><strong>Turn preparation<br/>into practice.</strong><span className="learning-note-footer">Explore Mock Test <ArrowUpRight size={14} aria-hidden="true"/></span></Link>
          <Link href="/explore/videos/" className="learning-note learning-note-podcast"><span className="podcast-disc"><Headphones size={21} aria-hidden="true"/></span><span><small>LEARN. LISTEN. KEEP GOING.</small><strong>UPSC Radio Podcast</strong></span><ArrowUpRight size={16} aria-hidden="true"/></Link>
        </div>
        <div className="learning-hero-footnote"><span aria-hidden="true"/> A shared dream. A steady commitment.</div>
      </div>
    </section>
    <div className="wrap learning-section-heading"><div><p className="eyebrow">YOUR PREPARATION, CONNECTED</p><h2>Less searching. More learning.</h2></div><p>The essentials for your next step,<br/>together in one place.</p></div>
    <div className="wrap home-feature-grid">
      {[["Mock Test","Browse UPSC practice tests and registration availability.","/test-series/","Browse mock tests"],["Study Materials","Find textbooks and published preparation resources.","/resources/","Browse study materials"],["Previous Year Papers","Official UPSC Prelims and Mains papers by year.","https://www.upsc.gov.in/examinations/previous-question-papers","Open UPSC archive"]].map(([title,text,href,label]) => <section className="card home-feature" key={title}><span className="feature-icon">{title==="Mock Test"?<ClipboardCheck/>:title==="Study Materials"?<LibraryBig/>:<Files/>}</span><h2>{title}</h2>{title==="Previous Year Papers"?<Suspense fallback={<p className="feed-loading" role="status">Loading official papers…</p>}><HomePapers/></Suspense>:<p>{text}</p>}<Link className="button" href={href} target={href.startsWith("https://") ? "_blank" : undefined} rel={href.startsWith("https://") ? "noopener noreferrer" : undefined}>{label} ↗</Link></section>)}
    </div>
    <HomeResources />
    <section className="learning-method wrap" aria-labelledby="learning-method-title">
      <div className="learning-method-intro"><p className="eyebrow">ONE SESSION AT A TIME</p><h2 id="learning-method-title">Give your ambition<br/>a daily rhythm.</h2><p>Preparation feels clearer when you know your next step. Build understanding, test it, then return a little stronger.</p><Link className="text-link" href="/courses/">Find a place to begin <ArrowUpRight size={16} aria-hidden="true"/></Link></div>
      <div className="learning-method-grid">{[
        {number:"01",title:"Build your foundation",text:"Explore courses and choose the subjects you want to strengthen.",href:"/courses/",Icon:BookOpen},
        {number:"02",title:"Make it stick",text:"Revisit the concepts with focused study materials.",href:"/resources/",Icon:LibraryBig},
        {number:"03",title:"Put it into practice",text:"Explore mock tests and official previous year papers.",href:"/test-series/",Icon:ClipboardCheck},
        {number:"04",title:"Stay connected",text:"Make room for Telugu conversations on the UPSC journey.",href:"/explore/videos/",Icon:Headphones},
      ].map(({number,title,text,href,Icon})=><Link className="learning-method-card" href={href} key={number}><div><span>{number}</span><Icon size={22} strokeWidth={1.5} aria-hidden="true"/></div><h3>{title}</h3><p>{text}</p><ArrowUpRight className="method-arrow" size={17} aria-hidden="true"/></Link>)}</div>
    </section>
    <Suspense fallback={null}><HomeStories/></Suspense>
    <HomeDiscover />
    <div className="wrap home-conversion"><ConversionBanner title="You’ve put in the hours. Now test your progress." text="Explore mock tests or find a course for your next step."/></div>
    <section className="wrap social-section" aria-labelledby="social-title">
      <div><p className="eyebrow">UPSC RADIO PODCAST</p><h2 id="social-title">Follow the conversation.</h2></div>
      <div className="social-links">
        {Object.entries(socials).map(([key,social])=><a key={key} target="_blank" rel="noopener noreferrer" href={social.url}><Image className="social-brand-logo" src={`/brands/${key}.${key==="facebook"?"svg":"png"}`} width={32} height={32} alt=""/><span><strong>{social.name}</strong><small>{social.handle}</small></span><span aria-hidden="true">↗</span></a>)}
      </div>
    </section>
    <section className="faq-section" aria-labelledby="faq-heading">
      <div className="wrap faq-layout">
        <div className="faq-intro">
          <p className="eyebrow">FAQ</p>
          <h2 id="faq-heading">Questions,<br/>answered.</h2>
          <p>A little clarity for your next step. Find answers about courses, mock tests and study resources.</p>
          <Link className="faq-contact" href="/admissions/">Still need help? Get in touch <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="faq-list">
          <details name="learning-faq"><summary>How do I access my courses?<ChevronDown aria-hidden="true"/></summary><p>Sign in and open your student dashboard. When your enrolment is active, you can access your courses from My learning.</p></details>
          <details name="learning-faq"><summary>Where can I find mock tests?<ChevronDown aria-hidden="true"/></summary><p>Explore the <Link href="/test-series/">Mock Test section</Link> for the introductory free mock and upcoming test series. Each test shows its current availability before you register.</p></details>
          <details name="learning-faq"><summary>Where are the study materials?<ChevronDown aria-hidden="true"/></summary><p>Visit <Link href="/resources/">Study Materials</Link> to browse published resources by subject and exam. Available materials include download links or links to the original source.</p></details>
          <details name="learning-faq"><summary>How do I find previous year papers?<ChevronDown aria-hidden="true"/></summary><p>The Previous Year Papers section on this page links to official UPSC papers. You can also <a href="https://www.upsc.gov.in/examinations/previous-question-papers" target="_blank" rel="noopener noreferrer">browse the UPSC archive ↗</a>.</p></details>
          <details name="learning-faq"><summary>Do I need an account for the cart and wishlist?<ChevronDown aria-hidden="true"/></summary><p>Yes. Sign in to add courses or tests to your cart and save items to your wishlist.</p></details>
          <details name="learning-faq"><summary>How can I ask about a course or mock test?<ChevronDown aria-hidden="true"/></summary><p><Link href="/admissions/">Send an enquiry</Link> with the course or test you’re interested in, and your preferred contact details.</p></details>
        </div>
      </div>
    </section>
  </div>;
}
