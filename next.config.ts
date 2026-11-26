import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  trailingSlash: true,
  poweredByHeader: false,
  serverExternalPackages:["unpdf"],
  images: { remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }] },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      // Report-only first: browsers log what a strict policy would block without breaking sign-in or payments.
      { key: "Content-Security-Policy-Report-Only", value: ["default-src 'self'","script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://*.razorpay.com https://clerk.upscradio.com https://challenges.cloudflare.com https://vercel.live","connect-src 'self' https://clerk.upscradio.com https://clerk-telemetry.com https://*.razorpay.com https://vitals.vercel-insights.com","frame-src 'self' https://*.razorpay.com https://open.spotify.com https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com","img-src 'self' data: blob: https:","style-src 'self' 'unsafe-inline'","font-src 'self' data:","worker-src 'self' blob:","media-src 'self' https:","object-src 'none'","base-uri 'self'","frame-ancestors 'none'"].join("; ") },
    ] }, ...["/student/:path*","/staff/:path*","/checkout/:path*","/cart/:path*","/account/:path*","/api/payments/:path*","/api/learning/:path*","/api/exams/:path*","/api/staff/:path*"].map(source=>({source,headers:[
      {key:"Cache-Control",value:"private, no-store"},
      {key:"X-Robots-Tag",value:"noindex, nofollow"},
    ]}))];
  },
};
export default config;
