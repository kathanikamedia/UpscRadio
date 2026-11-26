import {identity} from "@/lib/auth";
import {attemptMockPdf} from "@/lib/mock-papers";
import {canPractise} from "@/lib/practice-bank";
import {studyMaterialDownload} from "@/lib/r2";
export const runtime="nodejs";
export async function GET(_request:Request,{params}:{params:Promise<{attempt:string}>}){
 const headers={"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow"};
 const user=await identity();if(!user)return new Response("Sign in to download your test PDF.",{status:401,headers});
 const {attempt}=await params;const asset=await attemptMockPdf(user,attempt);
 if(!asset)return new Response("Test PDF unavailable.",{status:403,headers});
 if(!await canPractise(user,asset.book))return new Response("Test access required.",{status:403,headers});
 try{return new Response(null,{status:307,headers:{...headers,Location:await studyMaterialDownload(asset.key,asset.filename)}});}catch{return new Response("Download temporarily unavailable. Please retry.",{status:503,headers});}
}
