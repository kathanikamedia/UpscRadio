import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { BookOpen, FileText, LayoutDashboard, MessageSquare, Settings, Tag } from "lucide-react";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  const isAdmin = staff.role === "admin";
  return <div className="staff-shell">
    <aside className="staff-navigation" aria-label="Staff workspace">
      <Link className="staff-brand" href="/staff/"><span>UPSC</span> Radio <small>STAFF</small></Link>
      <p className="staff-role">{staff.role} workspace</p>
      <nav>
        <Link href="/staff/"><LayoutDashboard size={16}/>Overview</Link>
        {isAdmin ? <><Link href="/staff/courses/"><BookOpen size={16}/>Courses</Link><Link href="/staff/mock-tests/"><BookOpen size={16}/>Mock tests</Link><Link href="/staff/materials/"><FileText size={16}/>Study materials</Link><Link href="/staff/coupons/"><Tag size={16}/>Coupons</Link></> : null}
        {staff.role !== "faculty" ? <Link href="/staff/#enquiries"><MessageSquare size={16}/>Enquiries</Link> : null}
      </nav>
      <Link className="staff-view-site" href="/">View live website ↗</Link>
    </aside>
    <main className="staff-workspace">{children}</main>
  </div>;
}
