"use client";
import { SignedIn,SignedOut,UserButton } from "@clerk/nextjs";
import Link from "next/link";
export function AuthControls({configured}:{configured:boolean}) {
 if(!configured)return <><Link href="/account/login/">Login</Link><Link href="/account/register/">Sign up</Link></>;
 return <><SignedOut><Link href="/account/login/">Login</Link><Link href="/account/register/">Sign up</Link></SignedOut><SignedIn><Link href="/student/">My learning</Link><UserButton afterSignOutUrl="/"/></SignedIn></>;
}
