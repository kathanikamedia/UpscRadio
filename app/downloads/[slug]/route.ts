import { content,execute } from "@/lib/db";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { studyMaterialDownload } from "@/lib/r2";
import { requiresPurchase } from "@/lib/study-material-drafts";
export const runtime = "nodejs";
export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params,item=await content("resource",slug);
 let mockAccess=false;
 if(item&&(item.extra.mock_slug||item.extra.download_after_attempt)){
  const mock=typeof item.extra.mock_slug==="string"?await content("course",item.extra.mock_slug):null;
  const {identity}=await import("@/lib/auth");const user=await identity();
  if(!user)return new Response("Sign in to download this PDF.",{status:401,headers:{"Cache-Control":"private, no-store"}});
  const {canPractise}=await import("@/lib/practice-bank");
  if(!mock?.extra.question_bank||!await canPractise(user,String(mock.extra.question_bank)))return new Response("Test access required.",{status:403,headers:{"Cache-Control":"private, no-store"}});
  mockAccess=true;
 }
 const parent=typeof item?.extra.course_slug==="string"?await content("course",item.extra.course_slug):null;
 if(item&&!mockAccess&&(requiresPurchase(item.extra)||(parent&&Number(parent.extra.price_paise)>0))){
  if(!parent)return new Response("Purchase access required.",{status:403,headers:{"Cache-Control":"private, no-store"}});
  const {identity}=await import("@/lib/auth");const user=await identity();
  const owned=user&&parent&&(await execute({sql:"SELECT 1 FROM payments WHERE clerk_id=? AND course_id=? AND status='Paid' LIMIT 1",args:[user,parent.id]})).rows.length>0;
  if(!owned)return new Response("Purchase access required.",{status:user?403:401,headers:{"Cache-Control":"private, no-store"}});
 }
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
