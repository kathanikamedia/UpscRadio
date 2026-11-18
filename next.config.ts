import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  trailingSlash: true,
  poweredByHeader: false,
  images: { remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }] },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
    ] }, ...["/student/:path*","/staff/:path*","/checkout/:path*","/cart/:path*","/account/:path*","/api/payments/:path*","/api/learning/:path*"].map(source=>({source,headers:[
      {key:"Cache-Control",value:"private, no-store"},
      {key:"X-Robots-Tag",value:"noindex, nofollow"},
    ]}))];
  },
};
export default config;
