"use server";
import { revalidatePath, updateTag } from "next/cache";
import { PUBLIC_CATALOGUE_TAG } from "@/lib/public-catalogue";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { execute } from "@/lib/db";
import { z } from "zod";
import { FREE_MOCK_SLUG } from "@/lib/mock-tests";
import { checkStudyMaterial, validStudyMaterialKey } from "@/lib/r2";
const contentSchema=z.object({kind:z.enum(["course","resource","profile","notice","branch","settings"]),slug:z.string().regex(/^[a-z0-9-]+$/).max(160),title:z.string().trim().min(2).max(180),summary:z.string().max(250),body:z.string().max(50000),category:z.string().max(80),url:z.union([z.literal(""),z.url()]).refine(v=>!v||/^https?:\/\//.test(v)),price:z.coerce.number().int().min(0),moodle:z.coerce.number().int().min(0),published:z.string().optional(),contact_email:z.union([z.literal(""),z.email()]).optional(),contact_phone:z.string().max(30).optional(),about:z.string().max(20000).optional(),privacy:z.string().max(20000).optional()});
export async function saveContent(_state:string,data:FormData) {
 await requireAdmin();
 const result=contentSchema.safeParse(Object.fromEntries(data));
 if(!result.success)return "Check the title, slug, URL and numeric fields.";
 const v=result.data;
 const storageKey = v.kind === "resource" ? String(data.get("storage_key") || "").trim() : "";
 if (storageKey) {
   if (!validStudyMaterialKey(storageKey)) return "Use a PDF object key such as study-materials/polity-notes.pdf.";
   try { await checkStudyMaterial(storageKey); }
   catch { return "PDF could not be verified. Check R2 configuration, the object key and its PDF content type before saving."; }
 }
 if(v.kind==="course" && v.category==="Test Series" && v.published) {
   if(v.slug===FREE_MOCK_SLUG && v.price!==0)return "The introductory mock must remain free.";
   if(v.slug!==FREE_MOCK_SLUG && v.price<100)return "Set a paid mock-test price before publishing.";
 }
 if(v.kind==="resource" && v.published && v.price>0)return "Paid materials stay private until the payment and purchase-access flow is activated.";
 await execute({sql:"INSERT INTO content(kind,slug,title,summary,body,category,published,extra) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(kind,slug) DO UPDATE SET title=excluded.title,summary=excluded.summary,body=excluded.body,category=excluded.category,published=excluded.published,extra=json_patch(content.extra,excluded.extra)",
 args:[v.kind,v.slug,v.title,v.summary,v.body,v.category,v.published?1:0,JSON.stringify({url:v.url,price_paise:v.price,moodle_course_id:v.moodle,...(v.kind==="resource"?{storage_key:storageKey}:{}),...(v.kind==="course"&&v.slug===FREE_MOCK_SLUG?{free_mock:true}:{}),...(v.kind==="settings"?{contact_email:v.contact_email||"",contact_phone:v.contact_phone||"",about:v.about||"",privacy:v.privacy||""}:{})})]});
 const staff=await requireAdmin();
 await execute({sql:"INSERT INTO audit(actor,action) VALUES (?,?)",args:[staff.id,"Published content edit: "+v.kind+"/"+v.slug]});
 updateTag(PUBLIC_CATALOGUE_TAG);revalidatePath("/");revalidatePath("/staff");return "Content saved.";
}
export async function updateLead(_state:string,data:FormData) {
 const staff=await requireStaff();if(!["admin","counsellor"].includes(staff.role))throw new Error("Access denied.");
 const status=z.enum(["New","Contacted","Interested","Counselling Scheduled","Converted","Not Interested"]).safeParse(data.get("status"));
 const id=Number(data.get("id"));if(!status.success||!Number.isSafeInteger(id))return "Invalid lead update.";
 const notes=String(data.get("notes")||"").slice(0,10000), follow=String(data.get("follow_up")||"");
 if(follow&&!/^\d{4}-\d{2}-\d{2}$/.test(follow))return "Invalid follow-up date.";
 await execute({sql:"UPDATE enquiries SET status=?,notes=?,follow_up=? WHERE id=?",args:[status.data,notes,follow,id]});
 await execute({sql:"INSERT INTO audit(actor,action) VALUES (?,?)",args:[staff.id,"Updated enquiry "+id]});
 revalidatePath("/staff");return "Enquiry updated.";
}
