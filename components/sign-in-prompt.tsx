"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useId, type ReactNode } from "react";
import { X, LockKeyhole } from "lucide-react";
import { useAccount } from "./account-state";
export function SignInPrompt({children,className="button"}:{children:ReactNode;className?:string}){
 const dialog=useRef<HTMLDialogElement>(null),title=useId(),path=usePathname(),{ready}=useAccount();
 return <><button type="button" className={className} disabled={!ready} onClick={()=>dialog.current?.showModal()}>{children}</button><dialog ref={dialog} className="signin-dialog" aria-labelledby={title} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}><button className="dialog-close" aria-label="Close sign-in prompt" onClick={()=>dialog.current?.close()}><X size={20}/></button><span className="signin-symbol"><LockKeyhole size={26} aria-hidden="true"/></span><h2 id={title}>Make it your space.</h2><p>Sign in to add courses to your cart and keep your wishlist together.</p><Link className="button" onClick={()=>dialog.current?.close()} href={`/account/login/?returnTo=${encodeURIComponent(path)}`}>Sign in to continue ↗</Link><p className="signin-create">New to UPSC Radio? <Link onClick={()=>dialog.current?.close()} href={`/account/register/?redirect_url=${encodeURIComponent(path)}`}>Create an account</Link></p></dialog></>;
}
