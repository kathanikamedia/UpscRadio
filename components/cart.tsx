"use client";
import {Localized} from "@/components/localized";

import Link from "next/link";
import { useSyncExternalStore, useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useAccount } from "./account-state";
import { SignInPrompt } from "./sign-in-prompt";
function subscribe(callback:()=>void){window.addEventListener("storage",callback);window.addEventListener("radio-cart",callback);return()=>{window.removeEventListener("storage",callback);window.removeEventListener("radio-cart",callback);};}
function snapshot(userId:string|null){if(!userId)return "[]";try{return localStorage.getItem(`upsc-radio-cart-v2:${userId}`)||"[]";}catch{return "[]";}}
function parse(value:string):string[]{try{const items:unknown=JSON.parse(value);return Array.isArray(items)?[...new Set(items.filter((s):s is string=>typeof s==="string"&&/^[a-z0-9-]+$/.test(s)))].slice(0,100):[];}catch{return [];}}
export function useCart(){const {userId}=useAccount();return parse(useSyncExternalStore(subscribe,()=>snapshot(userId),()=>"[]"));}
export function saveCart(userId:string|null,items:string[]){if(!userId)throw Error("Sign in required");localStorage.setItem(`upsc-radio-cart-v2:${userId}`,JSON.stringify(items));window.dispatchEvent(new Event("radio-cart"));}
export function CartLink(){const items=useCart();return <Localized>{<Link className="cart-link" href="/cart/" aria-label={`Cart, ${items.length} ${items.length===1?"item":"items"}`}><ShoppingBag size={19} aria-hidden="true"/><span>Cart</span><span className="cart-count">{items.length}</span></Link>}</Localized>;}
export function AddToCart({slug}:{slug:string}){
 const {userId,ready}=useAccount(),items=useCart(),added=items.includes(slug);const [error,setError]=useState("");
 if(!userId)return <Localized>{<div className="add-cart-control"><SignInPrompt><ShoppingBag size={17} aria-hidden="true"/> Add to cart</SignInPrompt></div>}</Localized>;
 return <Localized>{<div className="add-cart-control">{added?<span className="button secondary cart-added" role="status"><Check size={17} aria-hidden="true"/> Added to cart</span>:<button className="button" type="button" disabled={!ready} onClick={()=>{try{saveCart(userId,[...items,slug]);setError("");}catch{setError("Allow browser storage to save your cart.");}}}><ShoppingBag size={17} aria-hidden="true"/> Add to cart</button>}{error?<small role="status">{error}</small>:null}</div>}</Localized>;
}
