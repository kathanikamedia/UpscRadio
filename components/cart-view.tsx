"use client";
import {Localized} from "@/components/localized";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, BookOpen, Trash2, ShieldCheck } from "lucide-react";
import { useCart, saveCart } from "./cart";
import { useAccount } from "./account-state";
export type CartProduct={slug:string;title:string;price:number;demo:boolean;free:boolean;available:boolean;mock?:boolean};
const rupees=(value:number)=>`₹${(value/100).toLocaleString("en-IN")}`;
export function CartContents({products,addSlug}:{products:CartProduct[];addSlug?:string}){
 const slugs=useCart(),{userId,ready}=useAccount(),[excluded,setExcluded]=useState<string[]>([]),[error,setError]=useState("");
 const [adding,setAdding]=useState(Boolean(addSlug));
 useEffect(()=>{if(!ready||!userId||!adding)return;try{if(addSlug&&products.some(p=>p.slug===addSlug&&!p.free&&p.price>0)&&!slugs.includes(addSlug))saveCart(userId,[...slugs,addSlug]);window.history.replaceState(window.history.state,"","/cart/");}catch{setError("Could not update your cart. Please try again.");}setAdding(false);},[ready,userId,adding,addSlug,products,slugs]);
 const items=slugs.map(slug=>products.find(p=>p.slug===slug)||{slug,title:"Unavailable item",price:0,demo:false,free:false,available:false});
 const selected=items.filter(p=>p.available&&!excluded.includes(p.slug)),total=selected.reduce((sum,p)=>sum+p.price,0),available=items.filter(p=>p.available);
 function remove(slug:string){try{saveCart(userId,slugs.filter(s=>s!==slug));}catch{setError("Could not update your cart. Please try again.");}}
 if(!ready||adding)return <Localized>{<p role="status">Loading your cart…</p>}</Localized>;
 if(!items.length)return <Localized>{<div className="cart-empty"><span><ShoppingBag size={40} aria-hidden="true"/></span><h2>Your cart is waiting.</h2><p>Find a course that fits your preparation.</p><Link className="button" href="/courses/">Explore courses ↗</Link><Link href="/test-series/">Browse mock tests</Link></div>}</Localized>;
 return <Localized>{<div className="shopping-layout"><section className="shopping-items" aria-label="Cart items"><div className="shopping-heading"><h2>Shopping cart <span>({items.length})</span></h2><span>Price</span></div>{available.length?<label className="select-all"><input type="checkbox" checked={selected.length===available.length} onChange={e=>setExcluded(e.target.checked?[]:available.map(p=>p.slug))}/> Select all available courses</label>:null}{error?<p role="alert">{error}</p>:null}
 {items.map(item=><article className="shopping-row" key={item.slug}><input className="item-select" type="checkbox" checked={item.available&&!excluded.includes(item.slug)} disabled={!item.available} aria-label={`Select ${item.title}`} onChange={e=>setExcluded(current=>e.target.checked?current.filter(s=>s!==item.slug):[...current,item.slug])}/><Link className="cart-cover" href={item.mock?`/test-series/${item.slug}/`:`/courses/${item.slug}/`} tabIndex={-1} aria-hidden="true"><BookOpen size={40} strokeWidth={1.3}/><span>UPSC<br/>RADIO</span></Link><div className="shopping-description"><h3><Link href={item.mock?`/test-series/${item.slug}/`:`/courses/${item.slug}/`}>{item.title}</Link></h3><span className={item.available?"stock-status":"stock-pending"}>{item.free?"Free mock test":item.demo?"Demo course":item.available?"Available":"Enrolment opens soon"}</span><p className="course-format">{item.mock?"Online mock test + PDF · Personal access":"Digital course · Personal access"}</p><div className="shopping-actions">{item.free?<Link href="/student/free-test/">Open free mock</Link>:null}<button type="button" onClick={()=>remove(item.slug)} aria-label={`Remove ${item.title} from cart`}><Trash2 size={14} aria-hidden="true"/> Remove</button></div></div><strong className="shopping-price">{item.free?"Free":item.price>0?rupees(item.price):"Price pending"}</strong></article>)}
 <div className="shopping-bottom">Subtotal ({selected.length} {selected.length===1?"item":"items"}): <strong>{rupees(total)}</strong></div></section>
 <aside className="shopping-summary"><p>Subtotal ({selected.length} {selected.length===1?"item":"items"}): <strong>{rupees(total)}</strong></p>{selected.length?<Link className="button" href={`/cart/checkout/?items=${selected.map(p=>p.slug).join(",")}`}>Proceed to checkout</Link>:<button className="button" disabled>Proceed to checkout</button>}{!selected.length?<small>{available.length?"Select a course to continue.":"Checkout opens when course pricing and enrolment are available."}</small>:null}<span className="secure-checkout"><ShieldCheck size={16} aria-hidden="true"/> Secure checkout</span><Link className="continue-shopping" href="/courses/">Continue shopping ↗</Link></aside></div>}</Localized>;
}
