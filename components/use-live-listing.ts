"use client";
import { useEffect, useState } from "react";
const interval=600000;
export function useLiveListing<T>(url:string,initial:T|null){
 const [listing,setListing]=useState(initial);
 useEffect(()=>{
  let lastAttempt=Date.now(),pending=false;
  const controller=new AbortController();
  async function update(){
   if(document.visibilityState!=="visible"||pending||Date.now()-lastAttempt<interval)return;
   lastAttempt=Date.now();pending=true;
   try{const response=await fetch(url,{cache:"no-store",signal:AbortSignal.any([controller.signal,AbortSignal.timeout(10000)])});if(response.ok){const result=await response.json() as T|null;if(result&&!controller.signal.aborted)setListing(result);}}
   catch{/* Keep the last successful listing. */}finally{pending=false;}
  }
  const timer=setInterval(update,interval);
  document.addEventListener("visibilitychange",update);
  return()=>{clearInterval(timer);controller.abort();document.removeEventListener("visibilitychange",update);};
 },[url]);
 return listing;
}
