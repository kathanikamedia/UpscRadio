import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/header";
import { clerkConfigured } from "@/lib/auth";
import { socials } from "@/lib/socials";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "UPSC RADIO", template: "%s | UPSC RADIO" },
  description: "UPSC courses, mock tests, study materials and the UPSC RADIO Telugu podcast.",
  ...(process.env.SITE_URL ? { metadataBase: new URL(process.env.SITE_URL) } : {}),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const content = <>
    <a className="skip" href="#main">Skip to content</a>
    <Header configured={clerkConfigured} />
    <main id="main">{children}</main>
    <footer><div className="wrap home-footer">
      <small>© {new Date().getFullYear()} UPSC RADIO</small>
      <nav aria-label="Footer">
        <Link href="/admissions/">Contact</Link>
        <Link href="/staff/">Staff</Link>
        <a target="_blank" rel="noopener noreferrer" href={socials.youtube.url}>YouTube</a>
        <a target="_blank" rel="noopener noreferrer" href={socials.instagram.url}>Instagram</a>
        <Link href="/explore/privacy/">Privacy</Link>
      </nav>
    </div></footer>
  </>;

  return <html lang="en-IN"><body>
    {clerkConfigured
      ? <ClerkProvider appearance={{ variables: { colorPrimary: "#3d1053", borderRadius: "0.75rem" } }}>{content}</ClerkProvider>
      : content}
  </body></html>;
}
