import { databaseConfig } from "./database-config.mjs";
/** @param {Record<string,string|undefined>} [env] */
export function validateDeploymentEnvironment(env=process.env){
 const database=databaseConfig(env);
 if(env.VERCEL_ENV!=="production")return database;
 let site;
 try{site=new URL(env.SITE_URL||"");}catch{throw Error("SITE_URL is required for production. Set it to https://upscradio.com.");}
 if(site.protocol!=="https:"||["localhost","127.0.0.1","[::1]"].includes(site.hostname)||site.username||site.password||site.pathname!=="/"||site.search||site.hash)throw Error("SITE_URL must be the live HTTPS website origin, such as https://upscradio.com.");
 if(!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_live_")||!env.CLERK_SECRET_KEY?.startsWith("sk_live_"))throw Error("Production requires the existing Clerk application's production keys: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY. Use development keys only for local/Preview environments.");
 return database;
}
