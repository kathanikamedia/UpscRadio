import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/header";
import { clerkConfigured } from "@/lib/auth";
import { Footer } from "@/components/footer";
import { AccountState } from "@/components/account-state";
import { SiteLanguage } from "@/components/site-language";
import "./globals.css";
import localFont from "next/font/local";
const manrope=localFont({src:"./fonts/manrope-latin-variable.woff2",weight:"200 800",display:"swap",variable:"--font-manrope"});
const editorial=localFont({src:"./fonts/instrument-serif-italic.woff2",weight:"400",style:"italic",display:"swap",variable:"--font-editorial",preload:false});

export const metadata: Metadata = {
  title: { default: "UPSC RADIO", template: "%s | UPSC RADIO" },
  description: "UPSC courses, mock tests, study materials and the UPSC RADIO Telugu podcast.",
  ...(process.env.SITE_URL ? { metadataBase: new URL(process.env.SITE_URL) } : {}),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const content = <SiteLanguage>
    <a className="skip" href="#main">Skip to content</a>
    <Header configured={clerkConfigured} />
    <main id="main">{children}</main>
    <Footer />
  </SiteLanguage>;

  return <html lang="en-IN" className={`${manrope.variable} ${editorial.variable}`}><body>
    {clerkConfigured
      ? <ClerkProvider appearance={{ variables: { colorPrimary: "#3d1053", borderRadius: "0.75rem" } }}><AccountState configured>{content}</AccountState></ClerkProvider>
      : <AccountState configured={false}>{content}</AccountState>}
  </body></html>;
}
