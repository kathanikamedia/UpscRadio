import { SignIn } from "@clerk/nextjs";
import { clerkConfigured } from "@/lib/auth";
import Link from "next/link";
import { safeReturnTo } from "@/lib/navigation";
export const metadata={title:"Student login",robots:{index:false,follow:false}};
export default async function Login({searchParams}:{searchParams:Promise<{returnTo?:string}>}) {
 const {returnTo}=await searchParams;
 const destination=safeReturnTo(returnTo);
 return <section className="wrap section auth-layout"><aside className="auth-brand"><p className="wordmark">UPSC <span>Radio</span></p><h1>Your learning workspace.</h1><p>Sign in to access enrolled courses, your wishlist and your account.</p><Link href="/courses/">Explore courses ↗</Link></aside><div>{clerkConfigured ? <SignIn routing="path" path="/account/login" signUpUrl="/account/register" fallbackRedirectUrl="/student" forceRedirectUrl={destination}/>:<><h2>Student login</h2><p>Student sign-in is awaiting activation. Please contact admissions for access.</p><Link className="button" href="/admissions/">Contact admissions</Link></>}</div></section>;
}
