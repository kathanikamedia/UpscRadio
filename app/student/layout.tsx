import Link from "next/link";
import { requireUser } from "@/lib/auth";
export default async function StudentLayout({children}:{children:React.ReactNode}) {
 await requireUser();
 return <div className="wrap section dashboard-shell"><aside><p className="eyebrow">MY WORKSPACE</p><nav className="dashboard-nav" aria-label="Student navigation"><Link href="/student/">Overview</Link><Link href="/student/free-test/">Free mock test</Link><Link href="/test-series/">All mock tests</Link><Link href="/student/saved/">Wishlist</Link><Link href="/student/profile/">Profile and account</Link><Link href="/courses/">Find a course</Link></nav></aside><div>{children}</div></div>;
}
