
import {Localized} from "@/components/localized";
import {UserProfile} from "@clerk/nextjs";
import {requireUser} from "@/lib/auth";
export const metadata={title:"Profile and account",robots:{index:false,follow:false}};
export default async function Profile(){await requireUser();return <Localized>{<section className="wrap section"><h1>Profile and account</h1><UserProfile routing="hash"/></section>}</Localized>;}
