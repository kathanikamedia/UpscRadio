"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from "react";
type Language="en"|"te";
const LanguageContext=createContext({language:"en" as Language,setLanguage:(_language:Language)=>{}});
export function SiteLanguage({children}:{children:ReactNode}){
 const [language,setValue]=useState<Language>("en");
 useEffect(()=>{try{if(localStorage.getItem("upsc-radio-language")==="te")setValue("te");}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=language==="te"?"te":"en-IN";},[language]);
 function setLanguage(value:Language){setValue(value);try{localStorage.setItem("upsc-radio-language",value);}catch{}}
 return <LanguageContext.Provider value={{language,setLanguage}}>{children}</LanguageContext.Provider>;
}
export const useSiteLanguage=()=>useContext(LanguageContext);
export function LanguageSwitch(){const {language,setLanguage}=useSiteLanguage();return <div className="home-language-switch" role="group" aria-label="Website language"><button type="button" aria-pressed={language==="en"} onClick={()=>setLanguage("en")}>English</button><button type="button" aria-pressed={language==="te"} onClick={()=>setLanguage("te")}>తెలుగు</button></div>;}
export function LocalText({en,te}:{en:string;te:string}){return <>{useSiteLanguage().language==="te"?te:en}</>;}
const words:Record<string,string>={"Menu":"మెనూ","Courses":"కోర్సులు","Mock Test":"మాక్ టెస్ట్","Study Materials":"అధ్యయన సామగ్రి","Watch":"వీక్షించండి","About us":"మా గురించి","Login":"ప్రవేశించండి","My learning":"నా అభ్యాసం","Your learning":"మీ అభ్యాసం","Overview":"అవలోకనం","Free mock test":"ఉచిత మాక్ టెస్ట్","Free starter course":"ఉచిత ప్రారంభ కోర్సు","Wishlist":"కోరికల జాబితా","Profile and account":"ప్రొఫైల్ మరియు ఖాతా","Explore":"అన్వేషించండి","All mock tests":"అన్ని మాక్ టెస్టులు","Find a course":"కోర్సును ఎంచుకోండి","My workspace":"నా అధ్యయన స్థలం","Need a hand?":"సహాయం కావాలా?","Get in touch with us":"మమ్మల్ని సంప్రదించండి","Start learning":"నేర్చుకోవడం ప్రారంభించండి","Discover":"తెలుసుకోండి","Your space":"మీ స్థలం","Contact us":"మమ్మల్ని సంప్రదించండి","Your cart":"మీ కార్ట్","Student dashboard":"విద్యార్థి డాష్‌బోర్డ్","Your account":"మీ ఖాతా","Staff sign in":"సిబ్బంది ప్రవేశం","Privacy policy":"గోప్యతా విధానం","Media & recognition":"మీడియా మరియు గుర్తింపు","YouTube & podcast":"యూట్యూబ్ మరియు పాడ్‌కాస్ట్","Previous Year Papers ↗":"గత సంవత్సరాల ప్రశ్నపత్రాలు ↗","Keep learning. Keep moving forward.":"నేర్చుకుంటూ ఉండండి. ముందుకు సాగండి.","Explore mock tests":"మాక్ టెస్టులు చూడండి","ONE DAY. ONE CHAPTER. ONE STEP CLOSER.":"ఒక రోజు. ఒక అధ్యాయం. లక్ష్యానికి మరొక అడుగు.","Your ambition deserves":"మీ ఆశయానికి","a place to grow.":"ఎదగడానికి ఒక వేదిక.","For the early starts, the late nights, and the dream that keeps you going.":"ఉదయపు సాధనకు, రాత్రి చదువుకు, ముందుకు నడిపించే మీ కలకు తోడుగా."};
export function SiteText({children}:{children:string}){return <>{useSiteLanguage().language==="te"?(words[children]||children):children}</>;}
