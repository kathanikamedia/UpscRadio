import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
const configured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
export default configured ? clerkMiddleware() : () => NextResponse.next();
export const config = { matcher: ["/((?!_next|.*\\.(?:png|jpg|css|js|ico|svg)).*)", "/(api|trpc)(.*)"] };
