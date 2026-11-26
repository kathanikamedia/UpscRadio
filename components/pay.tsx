"use client";
import {Localized} from "@/components/localized";

import Script from "next/script";
import {useState,useEffect,useRef} from "react";
type Widget={open:()=>void;on:(event:string,cb:()=>void)=>void};
declare global {interface Window {Razorpay:new(options:Record<string,unknown>)=>Widget}}
export function Pay({order,keyId,amount,receipt,autoOpen=false}:{order:string;keyId:string;amount:number;receipt:string;autoOpen?:boolean}) {
 const [ready,setReady]=useState(false),[status,setStatus]=useState(""),[busy,setBusy]=useState(false),opened=useRef(false);
 function pay() {
  setBusy(true);setStatus("");
  const widget=new window.Razorpay({key:keyId,order_id:order,amount,currency:"INR",name:"UPSC RADIO",
   modal:{ondismiss:()=>setBusy(false)},handler:async(result:{razorpay_payment_id:string;razorpay_signature:string})=>{
    setStatus("Verifying payment…");
    try {const r=await fetch("/api/payments/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...result,receipt})});if(!r.ok)throw Error();location.assign("/student/receipt/"+receipt);}
    catch{setStatus("Confirmation is pending. Check My learning before retrying.");setBusy(false);}
   }});
  widget.on("payment.failed",()=>{setBusy(false);setStatus("Payment was unsuccessful. You can try again.");});widget.open();
 }
 // Arriving from "Buy now" opens Razorpay once; the button stays for retries.
 useEffect(()=>{if(autoOpen&&ready&&!opened.current){opened.current=true;pay();}},[autoOpen,ready]); // eslint-disable-line react-hooks/exhaustive-deps
 return <Localized>{<><Script src="https://checkout.razorpay.com/v1/checkout.js" onReady={()=>setReady(true)} onError={()=>setStatus("Payment provider did not load. Refresh to try again.")}/>{status?<p role="status">{status}</p>:null}<button className="button" disabled={!ready||busy} onClick={pay}>{busy?"Please wait…":"Pay with Razorpay"}</button></>}</Localized>;
}
