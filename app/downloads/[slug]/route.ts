import { content } from "@/lib/db";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params,item=await content("resource",slug);
 if(!item||typeof item.extra.document!=="string"||!item.extra.document)return new Response("File unavailable",{status:404});
 try {
  const root=await realpath(path.resolve("private"));
  const target=await realpath(path.resolve(root,item.extra.document));
  if(!target.startsWith(root+path.sep)||!target.endsWith(".pdf"))return new Response("File unavailable",{status:404});
  const data=await readFile(target);
  return new Response(data,{headers:{"Content-Type":"application/pdf","Content-Disposition":'attachment; filename="study-material.pdf"',"X-Content-Type-Options":"nosniff"}});
 }catch{return new Response("File unavailable",{status:404});}
}
