
import {Localized} from "@/components/localized";
import { SignUp } from "@clerk/nextjs";
import { clerkConfigured } from "@/lib/auth";
export const metadata={title:"Student registration",robots:{index:false,follow:false}};
export default function Register() { return <Localized>{<section className="wrap section narrow">{clerkConfigured ? <SignUp routing="path" path="/account/register" signInUrl="/account/login" fallbackRedirectUrl="/student"/>:<><h1>Student registration</h1><p>Registration is awaiting activation.</p><a href="/admissions/">Contact admissions</a></>}</section>}</Localized>; }
