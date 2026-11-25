"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function HomeLanguageIntro(){
 const [language,setLanguage]=useState<"en"|"te">("en");
 const telugu=language==="te";
 return <div className="learning-hero-copy">
  <div className="home-language-switch" role="group" aria-label="Homepage introduction language">
   <button type="button" aria-pressed={!telugu} onClick={()=>setLanguage("en")}>English</button>
   <button type="button" aria-pressed={telugu} onClick={()=>setLanguage("te")}>తెలుగు</button>
  </div>
  {telugu?<div lang="te"><h1 id="learning-hero-title">సేవ చేయాలనే కల.<br/><span>సాధనకు ఒక ప్రణాళిక.</span></h1><p>మీ UPSC ప్రయాణానికి స్ఫూర్తితో పాటు సరైన ప్రణాళిక కూడా అవసరం.<br/>మూలాంశాలు నేర్చుకోండి, ప్రశ్నలను సాధన చేయండి, అధికారిక సమాచారం తెలుసుకోండి.</p></div>:<><h1 id="learning-hero-title">A dream to serve.<br/><span>A plan to prepare.</span></h1><p>Your UPSC journey deserves more than motivation.<br className="desktop-break"/> Build your basics, practise questions and stay close to official updates.</p></>}
  <div className="learning-hero-actions"><Link className="button" href="/test-series/">{telugu?"మాక్ టెస్టులు చూడండి":"Explore mock tests"} <ArrowUpRight size={17} aria-hidden="true"/></Link><Link className="button secondary" href="/courses/">{telugu?"కోర్సులను చూడండి":"Find your course"} <ArrowUpRight size={17} aria-hidden="true"/></Link></div>
  {telugu?<p className="home-language-note" lang="te">ప్రస్తుతం ప్రధాన పరిచయం మాత్రమే తెలుగులో అందుబాటులో ఉంది.</p>:null}
 </div>;
}
