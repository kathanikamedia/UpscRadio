"use client";
import {useState} from "react";
import {LockKeyhole} from "lucide-react";
import {Localized} from "./localized";
// Non-buyers see where the PDF lives, but clicking explains it is locked instead of downloading.
export function LockedDownload({message}:{message:string}){
 const [open,setOpen]=useState(false);
 return <Localized>{<div className="locked-download"><button type="button" className="button secondary" aria-expanded={open} onClick={()=>setOpen(true)}><LockKeyhole size={16} aria-hidden="true"/> Download PDF</button>{open?<p className="purchase-alert" role="alert">{message}</p>:null}</div>}</Localized>;
}
