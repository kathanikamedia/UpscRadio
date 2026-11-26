import {requireAdmin} from "@/lib/auth";
import {mockPaper} from "@/lib/mock-papers";
import {studyMaterialDownload} from "@/lib/r2";
export async function GET(request:Request){await requireAdmin();const paper=await mockPaper(new URL(request.url).searchParams.get("book")||"");const headers={"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer"};if(!paper)return new Response("Upload not found.",{status:404,headers});try{return new Response(null,{status:307,headers:{...headers,Location:await studyMaterialDownload(paper.storageKey)}});}catch{return new Response("PDF temporarily unavailable.",{status:503,headers});}}
