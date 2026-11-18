import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
export const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
export async function identity() {
  if (!clerkConfigured) return null;
  const session = await auth();
  return session.userId;
}
export async function requireUser(returnTo = "/student/") {
  const userId = await identity();
  if (!userId) redirect("/account/login/?returnTo="+encodeURIComponent(returnTo));
  return userId;
}
export async function requireStaff() {
  const id = await requireUser();
  const user = await currentUser();
  const role = user?.publicMetadata.role;
  if (!["admin", "counsellor", "faculty"].includes(String(role))) redirect("/student/");
  return { id, role: String(role) };
}
export async function requireAdmin() {
  const staff = await requireStaff();
  if (staff.role !== "admin") throw new Error("Administrator access required.");
  return staff;
}
