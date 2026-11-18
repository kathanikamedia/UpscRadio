import { StudentSidebar } from "@/components/student-sidebar";
import { requireUser } from "@/lib/auth";
export default async function StudentLayout({children}:{children:React.ReactNode}) {
 await requireUser();
 return <div className="wrap section dashboard-shell"><StudentSidebar/><div className="workspace-content">{children}</div></div>;
}
