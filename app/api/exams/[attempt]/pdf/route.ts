import {identity} from "@/lib/auth";
import {attemptMockPdf} from "@/lib/mock-papers";
import {canPractise} from "@/lib/practice-bank";
import {studyMaterialDownload} from "@/lib/r2";
import {mockPurchaseHref,downloadAccessResponse} from "@/lib/purchase-navigation";
export const runtime="nodejs";
export async function GET(request:Request,{params}:{params:Promise<{attempt:string}>}){
 const headers={"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow"};
 const user=await identity();if(!user)return downloadAccessResponse(request,"/account/login/?returnTo="+encodeURIComponent(new URL(request.url).pathname),"Sign in to download your test PDF.",401);
 const {attempt}=await params;const asset=await attemptMockPdf(user,attempt);
 if(!asset)return downloadAccessResponse(request,"/test-series/","Test PDF unavailable.",403);
 if(!await canPractise(user,asset.book))return downloadAccessResponse(request,await mockPurchaseHref(asset.book),"Test access required.",403);
 try{return new Response(null,{status:307,headers:{...headers,Location:await studyMaterialDownload(asset.key,asset.filename)}});}catch{return downloadAccessResponse(request,(await mockPurchaseHref(asset.book))+"?download_error=1","Download temporarily unavailable. Please retry.",503);}
}
