"use client";
import {Localized} from "@/components/localized";

import Script from "next/script";
import {useState} from "react";
type Widget={open:()=>void;on:(event:string,cb:()=>void)=>void};
declare global {interface Window {Razorpay:new(options:Record<string,unknown>)=>Widget}}
export function Pay({order,keyId,amount,receipt}:{order:string;keyId:string;amount:number;receipt:string}) {
 const [ready,setReady]=useState(false),[status,setStatus]=useState(""),[busy,setBusy]=useState(false);
 function pay() {
  setBusy(true);
  const widget=new window.Razorpay({key:keyId,order_id:order,amount,currency:"INR",name:"UPSC RADIO",
   modal:{ondismiss:()=>setBusy(false)},handler:async(result:{razorpay_payment_id:string;razorpay_signature:string})=>{
    setStatus("Verifying payment…");
    try {const r=await fetch("/api/payments/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...result,receipt})});if(!r.ok)throw Error();location.assign("/student/receipt/"+receipt);}
    catch{setStatus("Confirmation is pending. Check My learning before retrying.");setBusy(false);}
   }});
  widget.on("payment.failed",()=>{setBusy(false);setStatus("Payment was unsuccessful. You can try again.");});widget.open();
 }
 return <Localized>{<><Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={()=>setReady(true)} onError={()=>setStatus("Payment provider did not load. Refresh to try again.")}/><p role="status">{status}</p><button className="button" disabled={!ready||busy} onClick={pay}>{busy?"Please wait…":"Pay with Razorpay"}</button></>}</Localized>;
}
