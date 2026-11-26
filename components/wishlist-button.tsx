"use client";
import {Localized} from "@/components/localized";

import { useOptimistic, useTransition, useState } from "react";
import { Heart } from "lucide-react";
import { toggleSaved } from "@/app/student/actions";
import { useAccount } from "./account-state";
import { SignInPrompt } from "./sign-in-prompt";
export function WishlistButton({id,added=false,compact=false}:{id:number;added?:boolean;compact?:boolean}){
 const {userId,ready}=useAccount(),[selected,setSelected]=useOptimistic(added),[pending,start]=useTransition(),[error,setError]=useState("");
 if(compact){
  if(!userId)return <Localized>{<SignInPrompt className="wishlist-icon"><Heart size={19} aria-hidden="true"/><span className="sr-only">Add to wishlist</span></SignInPrompt>}</Localized>;
  return <Localized>{<button className="wishlist-icon" type="button" title={selected?"Remove from wishlist":"Add to wishlist"} aria-label={selected?"Remove from wishlist":"Add to wishlist"} aria-pressed={selected} disabled={!ready||pending} onClick={()=>start(async()=>{setSelected(!selected);setError("");try{const data=new FormData();data.set("id",String(id));await toggleSaved(data);}catch{setError("Could not update your wishlist. Please try again.");}})}><Heart size={19} fill={selected?"currentColor":"none"} aria-hidden="true"/></button>}</Localized>;
 }
 if(!userId)return <Localized>{<SignInPrompt className="button secondary wishlist-button"><Heart size={17} aria-hidden="true"/> Add to wishlist</SignInPrompt>}</Localized>;
 return <Localized>{<div><button className="button secondary wishlist-button" type="button" disabled={!ready||pending} aria-pressed={selected} onClick={()=>start(async()=>{setSelected(!selected);setError("");try{const data=new FormData();data.set("id",String(id));await toggleSaved(data);}catch{setError("Could not update your wishlist. Please try again.");}})}><Heart size={17} fill={selected?"currentColor":"none"} aria-hidden="true"/>{pending?"Updating…":selected?"Remove from wishlist":"Add to wishlist"}</button>{error?<small role="status">{error}</small>:null}</div>}</Localized>;
}
