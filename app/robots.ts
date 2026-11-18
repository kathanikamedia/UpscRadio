import type {MetadataRoute} from "next";
export default function robots():MetadataRoute.Robots{
 return {rules:{userAgent:"*",allow:"/",disallow:["/student/","/staff/","/account/","/api/","/checkout/","/cart/"]},...(process.env.SITE_URL?{sitemap:process.env.SITE_URL+"/sitemap.xml"}:{})};
}
