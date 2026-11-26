import {identity} from "@/lib/auth";
import {mockPdf} from "@/lib/mock-papers";
import {canPractise} from "@/lib/practice-bank";
import {studyMaterialDownload} from "@/lib/r2";
export const runtime="nodejs";
export async function GET(_request:Request,{params}:{params:Promise<{book:string}>}){
 const headers={"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow"};
 const user=await identity();if(!user)return new Response("Sign in to download this PDF.",{status:401,headers});
 const {book}=await params;
 if(!await canPractise(user,book))return new Response("Test access required.",{status:403,headers});
 const asset=await mockPdf(book);if(!asset)return new Response("PDF unavailable.",{status:404,headers});
 try{return new Response(null,{status:307,headers:{...headers,Location:await studyMaterialDownload(asset.key,asset.filename)}});}catch{return new Response("Download temporarily unavailable. Please retry.",{status:503,headers});}
}
