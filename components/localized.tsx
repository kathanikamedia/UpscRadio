"use client";
import {Children,cloneElement,isValidElement,type ReactNode,type ReactElement} from "react";
import {useSiteLanguage} from "./site-language";
import {translateText,type SiteLanguageCode} from "@/lib/translations";
// Translate rendered copy, not DOM nodes or form values. React retains event handlers,
// component state and original English identifiers when the interface language changes.
export function localizeTree(node:ReactNode,language:SiteLanguageCode):ReactNode{
 if(language!=="te")return node;
 if(typeof node==="string")return translateText(node,language);
 if(Array.isArray(node))return Children.map(node,child=>localizeTree(child,language));
 if(!isValidElement(node))return node;
 const element=node as ReactElement<Record<string,unknown>>,props=element.props;
 if(props.translate==="no"||props["data-no-translate"]||["script","style","code","pre","textarea"].includes(String(element.type)))return node;
 const updated:Record<string,unknown>={};
 for(const attribute of ["placeholder","aria-label","title","alt"])if(typeof props[attribute]==="string")updated[attribute]=translateText(props[attribute] as string,language);
 if(element.type==="option"&&props.value===undefined&&typeof props.children==="string")updated.value=props.children;
 if(props.children!==undefined)updated.children=localizeTree(props.children as ReactNode,language);
 if(props.fallback!==undefined)updated.fallback=localizeTree(props.fallback as ReactNode,language);
 return cloneElement(element,updated);
}
export function Localized({children}:{children:ReactNode}){return <>{localizeTree(children,useSiteLanguage().language)}</>;}
