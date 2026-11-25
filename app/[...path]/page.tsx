import { AddToCart } from "@/components/cart";
import { FREE_MOCK_SLUG } from "@/lib/mock-tests";
import Link from "next/link";
import { MaterialCover } from "@/components/material-cover";
import { WishlistButton } from "@/components/wishlist-button";
import { identity } from "@/lib/auth";
import { execute } from "@/lib/db";
import { notFound } from "next/navigation";
import { contents } from "@/lib/db";
import { publishedContent } from "@/lib/public-catalogue";
import { FreeCourseCard } from "@/components/free-course-card";
import { CourseMaterials } from "@/components/course-materials";
import { CourseDetail } from "@/components/course-detail";
import { StudyMaterialDetail } from "@/components/study-material-detail";
import { requiresPurchase } from "@/lib/study-material-drafts";
export const dynamic="force-dynamic";
type Props={params:Promise<{path?:string[]}>;searchParams:Promise<Record<string,string|string[]|undefined>>};
export async function generateMetadata({params}:Props) { const {path=[]}=await params;return {title:path[1]?.replaceAll("-"," ") || ({"courses":"Courses","test-series":"Mock Test","resources":"Study Materials","books":"Books"}[path[0]]||"UPSC RADIO")}; }
export default async function PublicPage({params,searchParams}:Props) {
  const {path=[]}=await params;
  const query=await searchParams;
  const root=path[0];
  const kinds:Record<string,string>={courses:"course","test-series":"course",resources:"resource",books:"resource",people:"profile"};
  const kind=kinds[root];
  if(root==="account" && path[1]==="reset") return <section className="wrap section"><h1>Password recovery</h1><p>Choose “Forgot password” on the sign-in form.</p><Link href="/account/login/">Open sign-in</Link></section>;
  if(root==="explore" && path.length===2) {
    const section=path[1];
    const titles:Record<string,string>={about:"About UPSC RADIO",privacy:"Privacy",faculty:"Faculty",results:"Results and achievements",media:"Media and recognition",videos:"Watch UPSC RADIO"};
    if(!titles[section]) notFound();
    const settings=(await contents("settings",false))[0]?.extra || {};
    const profileKinds:Record<string,string>={faculty:"Faculty",results:"Result",media:"Recognition"};
    const profiles=(await contents("profile")).filter(p=>p.category===profileKinds[section]);
    return <><div className="page-head"><div className="wrap"><h1>{titles[section]}</h1></div></div><section className="wrap section">
      {section==="videos"?<div className="actions"><a target="_blank" rel="noopener noreferrer" className="button" href="https://www.youtube.com/@UPSCRadio/videos">Latest videos ↗</a><a target="_blank" rel="noopener noreferrer" className="button secondary" href="https://www.youtube.com/@UPSCRadio/playlists">Playlists ↗</a></div>:section==="about"||section==="privacy"?<div className="prose"><p className="preserve">{String(settings[section] || (section==="about"?"UPSC RADIO brings together conversations and preparation resources for the Civil Services Examination.":"Information submitted through this website is used to answer enquiries and provide account and course access. Contact admissions about your information."))}</p></div>:<div className="grid">{profiles.length?profiles.map(p=><article className="card" key={p.id}><h2><Link href={"/people/"+p.slug}>{p.title}</Link></h2><p>{p.summary}</p></article>):<p>No entries have been published.</p>}</div>}
    </section></>;
  }
  if(!kind || path.length>2) notFound();
  if(path[1]) {
    const [item,viewer]=await Promise.all([publishedContent(kind,path[1]),identity()]);if(!item) notFound();
    const price=Number(item.extra.price_paise || 0);

    const wished=viewer?Boolean((await execute({sql:"SELECT 1 FROM saved WHERE clerk_id=? AND content_id=?",args:[viewer,item.id]})).rows.length):false;
    if(kind==="course"&&item.category==="Test Series"&&item.extra.question_bank)return <section className="wrap section mock-test-detail"><Link href="/test-series/">← Mock Tests</Link><p className="eyebrow">{String(item.extra.exam||"APPSC")} · {String(item.extra.language||"English")}</p><h1>{item.title}</h1>{typeof item.extra.source_material_slug==="string"?<MaterialCover slug={item.extra.source_material_slug} title={item.title}/>:null}<p>{item.summary}</p>{item.body&&item.body!==item.summary?<section className="prose"><h2>About this mock test</h2>{item.body.split(/\n\s*\n/).filter(Boolean).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</section>:null}{["syllabus","inclusions"].map(key=>item.extra[key]?<section className="prose" key={key}><h2>{key==="syllabus"?"Topics covered":"What’s included"}</h2><p className="preserve">{String(item.extra[key])}</p></section>:null)}<div className="card"><h2>Test details</h2><p>{Number(item.extra.question_count)} questions · ₹{price/100} provisional price</p><p>Timed attempts include saved answers, question navigation, review flags and an answer review after submission. Only reviewed questions are available; purchases are not open yet.</p><p>The source PDF is linked to this test for revision. Telugu Current Affairs is PDF-only.</p>{viewer?<Link className="button secondary" href={"/student/exam/"+String(item.extra.question_bank)+"/"}>Open exam room ↗</Link>:<Link className="button" href="/account/login/">Sign in</Link>}</div></section>;
    if(kind==="resource"&&requiresPurchase(item.extra))return <StudyMaterialDetail item={item} actions={<WishlistButton id={item.id} added={wished}/>}/>;
    if(kind==="course") return <CourseDetail title={item.title} summary={item.summary} category={item.category} demo={Boolean(item.extra.demo)} duration={item.extra.duration?String(item.extra.duration):undefined} language={item.extra.language?String(item.extra.language):undefined} body={item.body||item.summary} sections={[...(item.extra.syllabus?[{title:"Syllabus",description:String(item.extra.syllabus)}]:[]),...(item.extra.inclusions?[{title:"What’s included",description:String(item.extra.inclusions)}]:[])]} actions={<>{item.slug===FREE_MOCK_SLUG?<Link className="button" href="/student/free-test/">Open free mock ↗</Link>:<AddToCart slug={item.slug}/>}<WishlistButton id={item.id} added={wished}/></>}><CourseMaterials slug={item.slug}/><div className="course-outcomes"><h3>{item.extra.demo?"Programme preview":"Programme information"}</h3><p>{item.slug===FREE_MOCK_SLUG?"Free introductory mock. Open the test page for its current availability.":price?"Programme price: ₹"+(price/100).toLocaleString("en-IN"):"Pricing and enrolment availability will be announced. Contact us to learn more."}</p><Link href="/admissions/">Ask about this programme ↗</Link></div></CourseDetail>;
    return <><div className="page-head"><div className="wrap"><p className="eyebrow">{item.category}</p><h1>{item.title}</h1><p>{item.summary}</p></div></div><div className="wrap section columns"><article className="prose">{item.extra.demo?<span className="demo-label">Demo course</span>:null}<p className="preserve">{item.body}</p>{["syllabus","inclusions"].map(k=>item.extra[k]?<section key={k}><h2>{k==="syllabus"?"Syllabus":"What’s included"}</h2><p className="preserve">{String(item.extra[k])}</p></section>:null)}
      {kind==="resource" && (item.extra.storage_key || item.extra.document)?<p><a className="button secondary" href={"/downloads/"+item.slug}>Download PDF</a></p>:null}
      {kind==="resource" && typeof item.extra.url==="string" && /^https?:\/\//.test(item.extra.url)?<a target="_blank" rel="noopener noreferrer" className="button" href={item.extra.url}>Open resource ↗</a>:null}
    </article>{kind==="course"?<aside className="card"><h2>Programme details</h2><p>{item.slug===FREE_MOCK_SLUG?"Free introductory test":price?"₹"+(price/100).toLocaleString("en-IN"):"Price to be announced"}</p>{["mode","duration","language"].map(k=>item.extra[k]?<p key={k}>{String(item.extra[k])}</p>:null)}<Link className="button" href="/admissions/">Enquire about this course</Link>{item.slug===FREE_MOCK_SLUG?<Link className="button secondary" href="/student/free-test/">Open free mock</Link>:<AddToCart slug={item.slug}/>}<div className="detail-wishlist"><WishlistButton id={item.id} added={wished}/></div></aside>:null}</div></>;
  }
  const [userId,catalogue]=await Promise.all([identity(),contents(kind)]);
  const saved=userId?new Set((await execute({sql:"SELECT content_id FROM saved WHERE clerk_id=?",args:[userId]})).rows.map(r=>Number(r.content_id))):new Set<number>();
  let items=catalogue;
  if(root==="test-series")items=items.filter(i=>i.category==="Test Series");
  if(root==="books")items=items.filter(i=>i.category==="Books");
  const categories=[...new Set(items.map(i=>i.category))].sort();
  const q=String(query.q||"").slice(0,100), category=String(query.category||"");
  items=items.filter(i=>(!q||(i.title+" "+i.summary).toLowerCase().includes(q.toLowerCase()))&&(!category||i.category===category));
  if(query.sort==="title")items.sort((a,b)=>a.title.localeCompare(b.title));
  const pages=Math.max(1,Math.ceil(items.length/9)), page=Math.min(pages,Math.max(1,Math.floor(Number(query.page))||1));
  const title={"courses":"Courses","test-series":"Mock Test","resources":"Study Materials","books":"Books"}[root];
  return <><div className="page-head"><div className="wrap"><h1>{title}</h1></div></div><section className="wrap section"><form className="filters filter-panel"><label>Search<input name="q" defaultValue={q}/></label><label>Category<select name="category" defaultValue={category}><option value="">All categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Sort<select name="sort" defaultValue={String(query.sort||"")}><option value="">Newest</option><option value="title">Title A–Z</option></select></label><button className="button">Apply filters</button></form>{root==="courses"&&!q&&!category&&page===1?<div className="grid starter-feature"><FreeCourseCard/></div>:null}<div className="catalogue-summary"><p>{items.length} catalogue results</p><Link href={"/"+root}>Clear filters</Link></div><div className="grid">{items.length?items.slice((page-1)*9,page*9).map(item=><article className="card catalogue-card" key={item.id}><p className="eyebrow">{item.category}</p><h2><Link href={"/"+(kind==="course"?"courses":"resources")+"/"+item.slug}>{item.title}</Link></h2>{item.extra.demo?<span className="demo-label">Demo course</span>:null}<p>{item.summary}</p>{kind==="course"?<div className="catalogue-cart"><AddToCart slug={item.slug}/></div>:null}<div className="catalogue-card-actions"><WishlistButton id={item.id} added={saved.has(item.id)}/><Link className="catalogue-details" href={"/"+(kind==="course"?"courses":"resources")+"/"+item.slug}>View details <span aria-hidden="true">↗</span></Link></div></article>):<article className="card"><p>{q||category?"No entries match your filters.":"Details will appear here when published."}</p><Link href="/admissions/">Ask admissions about availability</Link></article>}</div>
    {pages>1?<nav className="pagination" aria-label="Pagination">{Array.from({length:pages},(_,n)=><Link key={n} href={"?"+new URLSearchParams({q,category,page:String(n+1),sort:String(query.sort||"")})} aria-current={page===n+1?"page":undefined}>{n+1}</Link>)}</nav>:null}
  </section></>;
}
