import { content } from "@/lib/db";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { studyMaterialDownload } from "@/lib/r2";
import { requiresPurchase } from "@/lib/study-material-drafts";
import {materialAccess} from "@/lib/material-access";
export const runtime = "nodejs";
async function downloadUser(){if(!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY||!process.env.CLERK_SECRET_KEY)return null;return (await import("@/lib/auth")).identity();}
export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params,item=await content("resource",slug);
 if(!item)return new Response("File unavailable",{status:404});
 let purchased=false;
 if(requiresPurchase(item.extra)){
  const user=await downloadUser();
  purchased=(await materialAccess(user,item)).allowed;
 }
 let mockAccess=false;
 if(!purchased&&(item.extra.mock_slug||item.extra.download_after_attempt)){
  const mock=typeof item.extra.mock_slug==="string"?await content("course",item.extra.mock_slug):null;
  const user=await downloadUser();
  if(!user)return new Response("Sign in to download this PDF.",{status:401,headers:{"Cache-Control":"private, no-store"}});
  const {canPractise}=await import("@/lib/practice-bank");
  if(!mock?.extra.question_bank||!await canPractise(user,String(mock.extra.question_bank)))return new Response("Test access required.",{status:403,headers:{"Cache-Control":"private, no-store"}});
  mockAccess=true;
 }
 if(!purchased&&!mockAccess&&requiresPurchase(item.extra))return new Response("Purchase access required.",{status:403,headers:{"Cache-Control":"private, no-store"}});
 if(item && typeof item.extra.storage_key === "string" && item.extra.storage_key) {
  try {
   return new Response(null,{status:307,headers:{Location:await studyMaterialDownload(item.extra.storage_key),"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer"}});
  } catch {return new Response("Download temporarily unavailable. Please try again later.",{status:503,headers:{"Cache-Control":"no-store"}});}
 }
 if(process.env.VERCEL === "1" || process.env.VERCEL_ENV)return new Response("File unavailable",{status:404});
 if(!item||typeof item.extra.document!=="string"||!item.extra.document)return new Response("File unavailable",{status:404});
 try {
  const root=await realpath(path.resolve("private"));
  const target=await realpath(path.resolve(root,item.extra.document));
  if(!target.startsWith(root+path.sep)||!target.endsWith(".pdf"))return new Response("File unavailable",{status:404});
  const data=await readFile(target);
  return new Response(data,{headers:{"Content-Type":"application/pdf","Content-Disposition":'attachment; filename="study-material.pdf"',"X-Content-Type-Options":"nosniff"}});
 }catch{return new Response("File unavailable",{status:404});}
}
