"use client";
import {createContext,useContext,useEffect,useState,useCallback,useMemo,type ReactNode} from "react";
import {translateText,type SiteLanguageCode} from "@/lib/translations";
type Language=SiteLanguageCode;
const LanguageContext=createContext({language:"en" as Language,setLanguage:(_language:Language)=>{}});
export function SiteLanguage({children,initialLanguage="en"}:{children:ReactNode;initialLanguage?:Language}){
 const [language,setValue]=useState<Language>(initialLanguage);
 const setLanguage=useCallback((value:Language)=>{setValue(value);try{localStorage.setItem("upsc-radio-language",value);}catch{}document.cookie=`upsc-radio-language=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol==="https:"?"; Secure":""}`;},[]);
 useEffect(()=>{try{if(!document.cookie.includes("upsc-radio-language=")&&localStorage.getItem("upsc-radio-language")==="te")setLanguage("te");}catch{}const sync=(event:StorageEvent)=>{if(event.key==="upsc-radio-language")setValue(event.newValue==="te"?"te":"en");};window.addEventListener("storage",sync);return()=>window.removeEventListener("storage",sync);},[setLanguage]);
 useEffect(()=>{document.documentElement.lang=language==="te"?"te":"en-IN";},[language]);
 const value=useMemo(()=>({language,setLanguage}),[language,setLanguage]);
 return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export const useSiteLanguage=()=>useContext(LanguageContext);
export function LanguageSwitch(){const {language,setLanguage}=useSiteLanguage();return <div className="home-language-switch" role="group" data-no-translate aria-label={language==="te"?"వెబ్‌సైట్ భాష":"Website language"}><button type="button" aria-pressed={language==="en"} onClick={()=>setLanguage("en")}>English</button><button type="button" aria-pressed={language==="te"} onClick={()=>setLanguage("te")}>తెలుగు</button></div>;}
export function LocalText({en,te}:{en:string;te:string}){return <>{useSiteLanguage().language==="te"?te:en}</>;}
export function SiteText({children}:{children:string}){return <>{translateText(children,useSiteLanguage().language)}</>;}
export function useTranslation(){const {language}=useSiteLanguage();return {language,t:(text:string)=>translateText(text,language)};}
