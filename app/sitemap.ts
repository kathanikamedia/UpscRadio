import type {MetadataRoute} from "next";
import {contents} from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const base=process.env.SITE_URL;if(!base)return [];
 const paths=["/","/courses/","/courses/upsc-preparation-starter/","/test-series/","/resources/","/books/","/admissions/","/explore/about/","/explore/videos/"];
 for(const [kind,route] of [["course","courses"],["resource","resources"],["profile","people"]]){
  for(const c of await contents(kind))paths.push("/"+route+"/"+c.slug+"/");
 }
 return paths.map(path=>({url:base.replace(/\/$/,"")+path}));
}
