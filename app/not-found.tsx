
import {Localized} from "@/components/localized";
import Link from "next/link";
export default function NotFound() { return <Localized>{<section className="wrap section"><h1>Page unavailable</h1><Link href="/">Return home</Link></section>}</Localized>; }
