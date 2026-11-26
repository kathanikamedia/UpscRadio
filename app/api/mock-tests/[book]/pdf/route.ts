import {identity} from "@/lib/auth";
import {mockPdf} from "@/lib/mock-papers";
import {canDownloadMock} from "@/lib/practice-bank";
import {studyMaterialDownload} from "@/lib/r2";
import {mockPurchaseHref,downloadAccessResponse} from "@/lib/purchase-navigation";
export const runtime="nodejs";
export async function GET(request:Request,{params}:{params:Promise<{book:string}>}){
 const headers={"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow"};
 const {book}=await params;
 const user=await identity();
 if(!user)return downloadAccessResponse(request,await mockPurchaseHref(book),"Sign in to download this PDF.",401);
 if(!await canDownloadMock(user,book))return downloadAccessResponse(request,await mockPurchaseHref(book),"Test access required.",403);
 const asset=await mockPdf(book);if(!asset)return downloadAccessResponse(request,(await mockPurchaseHref(book))+"?download_error=1","PDF unavailable.",404);
 try{return new Response(null,{status:307,headers:{...headers,Location:await studyMaterialDownload(asset.key,asset.filename)}});}catch{return downloadAccessResponse(request,(await mockPurchaseHref(book))+"?download_error=1","Download temporarily unavailable. Please retry.",503);}
}
