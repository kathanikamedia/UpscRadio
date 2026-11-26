import { content } from "@/lib/db";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { studyMaterialDownload } from "@/lib/r2";
import { requiresPurchase } from "@/lib/study-material-drafts";
import {materialAccess} from "@/lib/material-access";
import {purchaseHref,downloadAccessResponse} from "@/lib/purchase-navigation";
export const runtime = "nodejs";
async function downloadUser(){if(!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY||!process.env.CLERK_SECRET_KEY)return null;return (await import("@/lib/auth")).identity();}
export async function GET(request:Request,{params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params,item=await content("resource",slug);
 if(!item)return downloadAccessResponse(request,"/resources/","File unavailable",404);
 let purchased=false;
 if(requiresPurchase(item.extra)){
  const user=await downloadUser();
  purchased=(await materialAccess(user,item)).allowed;
 }
 let mockAccess=false;
 if(!purchased&&(item.extra.mock_slug||item.extra.download_after_attempt)){
  const mock=typeof item.extra.mock_slug==="string"?await content("course",item.extra.mock_slug):null;
  const user=await downloadUser();
  if(!user)return downloadAccessResponse(request,purchaseHref(slug,"resource"),"Sign in to download this PDF.",401);
  const {canPractise}=await import("@/lib/practice-bank");
  if(!mock?.extra.question_bank||!await canPractise(user,String(mock.extra.question_bank)))return downloadAccessResponse(request,purchaseHref(slug,"resource"),"Test access required.",403);
  mockAccess=true;
 }
 if(!purchased&&!mockAccess&&requiresPurchase(item.extra))return downloadAccessResponse(request,purchaseHref(slug,"resource"),"Purchase access required.",403);
 if(item && typeof item.extra.storage_key === "string" && item.extra.storage_key) {
  try {
   return new Response(null,{status:307,headers:{Location:await studyMaterialDownload(item.extra.storage_key),"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer"}});
  } catch {return downloadAccessResponse(request,purchaseHref(slug,"resource")+"&download_error=1","Download temporarily unavailable. Please try again later.",503);}
 }
 if(process.env.VERCEL === "1" || process.env.VERCEL_ENV)return downloadAccessResponse(request,purchaseHref(slug,"resource")+"&download_error=1","File unavailable",404);
 if(typeof item.extra.document!=="string"||!item.extra.document)return downloadAccessResponse(request,purchaseHref(slug,"resource")+"&download_error=1","File unavailable",404);
 try {
  const root=await realpath(path.resolve("private"));
  const target=await realpath(path.resolve(root,item.extra.document));
  if(!target.startsWith(root+path.sep)||!target.endsWith(".pdf"))return downloadAccessResponse(request,purchaseHref(slug,"resource")+"&download_error=1","File unavailable",404);
  const data=await readFile(target);
  return new Response(data,{headers:{"Content-Type":"application/pdf","Content-Disposition":'attachment; filename="study-material.pdf"',"X-Content-Type-Options":"nosniff"}});
 }catch{return downloadAccessResponse(request,purchaseHref(slug,"resource")+"&download_error=1","File unavailable",404);}
}
