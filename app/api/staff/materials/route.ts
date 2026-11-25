import {requireAdmin} from "@/lib/auth";
import {execute} from "@/lib/db";
import {uploadStudyPdf} from "@/lib/r2";
import {randomUUID} from "node:crypto";
import {z} from "zod";
import {revalidatePath,revalidateTag} from "next/cache";
import {PUBLIC_CATALOGUE_TAG} from "@/lib/public-catalogue";
export const runtime="nodejs";
const schema=z.object({course_slug:z.string().regex(/^[a-z0-9-]+$/).max(160),id:z.coerce.number().int().min(0),title:z.string().trim().min(2).max(180),summary:z.string().trim().min(10).max(250),body:z.string().max(50000),exam:z.enum(["UPSC","APPSC","TSPSC"]),category:z.string().trim().min(2).max(80),language:z.enum(["English","Telugu","Bilingual"]),price:z.string().regex(/^\d{1,6}(\.\d{1,2})?$/),published:z.enum(["draft","published"]),cover:z.enum(["","/materials/ap-current-affairs-2026-english.webp","/materials/ap-current-affairs-2026-telugu.webp","/materials/economy-part-1.jpg","/materials/environment-part-1.jpg"])});
export async function POST(request:Request){
 if(request.headers.get("origin")!==new URL(request.url).origin)return Response.json({error:"Invalid request origin."},{status:403});
 const admin=await requireAdmin();
 try{
  const reader=request.body?.getReader();if(!reader)return Response.json({error:"No upload received."},{status:400});
  const chunks:Uint8Array[]=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4_200_000){await reader.cancel();return Response.json({error:"Total upload must be under 4 MB."},{status:413});}chunks.push(value);}
  const form=await new Request(request.url,{method:"POST",headers:{"Content-Type":request.headers.get("content-type")||""},body:Buffer.concat(chunks)}).formData();
  const parsed=schema.safeParse(Object.fromEntries(form));if(!parsed.success)return Response.json({error:"Check the required fields. Summary must be 10–250 characters and price must be in rupees."},{status:400});const v=parsed.data;
  const parent=await execute({sql:"SELECT 1 FROM content WHERE kind=\'course\' AND category!=\'Test Series\' AND slug=?",args:[v.course_slug]});if(!parent.rows.length)return Response.json({error:"Choose an existing course."},{status:400});
  const old=v.id?(await execute({sql:"SELECT slug,extra FROM content WHERE id=? AND kind='resource'",args:[v.id]})).rows[0]:undefined;
  if(v.id&&!old)return Response.json({error:"Material no longer exists."},{status:404});
  const extra=old?JSON.parse(String(old.extra)):{};let key=String(extra.storage_key||"");const file=form.get("pdf");
  if(file instanceof File&&file.size){key=`study-materials/${v.exam.toLowerCase()}/uploads/${randomUUID()}.pdf`;await uploadStudyPdf(key,new Uint8Array(await file.arrayBuffer()));}
  if(!key)return Response.json({error:"Choose a PDF for this new material."},{status:400});
  const slug=old?String(old.slug):`${v.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,90)||"material"}-${randomUUID().slice(0,8)}`;
  const price=Math.round(Number(v.price)*100);const metadata={...extra,course_slug:v.course_slug,exam:v.exam,language:v.language,price_paise:price,access:price>0?"paid":"free",purchase_enabled:false,storage_key:key,cover:v.cover,type:"Practice question bank"};
  await execute({sql:"INSERT INTO content(kind,slug,title,summary,body,category,published,extra) VALUES ('resource',?,?,?,?,?,?,?) ON CONFLICT(kind,slug) DO UPDATE SET title=excluded.title,summary=excluded.summary,body=excluded.body,category=excluded.category,published=excluded.published,extra=excluded.extra",args:[slug,v.title,v.summary,v.body,v.category,v.published==="published"?1:0,JSON.stringify(metadata)]});
  await execute({sql:"INSERT INTO audit(actor,action) VALUES (?,?)",args:[admin.id,`Saved material ${slug}`]});
  revalidateTag(PUBLIC_CATALOGUE_TAG,"max");revalidatePath("/resources/");revalidatePath(`/resources/${slug}/`);revalidatePath("/staff/materials/");
  return Response.json({ok:true,slug});
 }catch{return Response.json({error:"Could not save the material. Check storage permissions and try again. The previous file has been preserved."},{status:500});}
}
