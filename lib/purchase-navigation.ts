import {execute} from "./db";
import type {ProductKind} from "./course-pricing";
export const purchaseHref=(slug:string,kind:ProductKind="course")=>`/purchase/${encodeURIComponent(slug)}/${kind==="resource"?"?kind=resource":""}`;
export async function mockPurchaseHref(book:string){
 const row=(await execute({sql:"SELECT slug FROM content WHERE kind='course' AND category='Test Series' AND published=1 AND (json_extract(extra,'$.question_bank')=? OR id IN (SELECT content_id FROM mock_papers WHERE book=? AND status='published')) LIMIT 1",args:[book,book]})).rows[0];
 return row?purchaseHref(String(row.slug)):"/test-series/";
}
export function downloadAccessResponse(request:Request,destination:string,message:string,status:number){
 const headers={"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow"};
 if(request.headers.get("accept")?.includes("text/html")||request.headers.get("sec-fetch-mode")==="navigate")return new Response(null,{status:307,headers:{...headers,Location:new URL(destination,request.url).href}});
 return new Response(message,{status,headers});
}
