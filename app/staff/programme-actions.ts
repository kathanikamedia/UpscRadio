"use server";
import {requireAdmin} from "@/lib/auth";
import {saveContent} from "./actions";
import {revalidatePath,updateTag} from "next/cache";
import {execute} from "@/lib/db";
import {PUBLIC_CATALOGUE_TAG} from "@/lib/public-catalogue";
export async function saveProgramme(state:string,data:FormData){await requireAdmin();const type=data.get("programme_type");if(type!=="course"&&type!=="mock")return "Invalid programme type.";const price=String(data.get("fee_rupees")||"");if(!/^\d{1,6}(\.\d{1,2})?$/.test(price))return "Enter a valid price in rupees.";data.set("kind","course");data.set("price",String(Math.round(Number(price)*100)));if(type==="mock")data.set("category","Test Series");else if(data.get("category")==="Test Series")return "Use Mock Tests to manage tests.";const result=await saveContent(state,data);if(result==="Content saved."&&type==="course"){const bundle=data.get("delivery")!=="moodle";await execute({sql:"UPDATE content SET extra=json_patch(extra,?) WHERE kind=\'course\' AND slug=?",args:[JSON.stringify({pricing_model:bundle?"bundle":"programme",delivery:bundle?"native":"moodle",purchase_enabled:data.get("purchase_enabled")==="on",sale_enabled:data.get("purchase_enabled")==="on",...(bundle?{demo:false}:{})}),String(data.get("slug"))]});updateTag(PUBLIC_CATALOGUE_TAG);}revalidatePath("/staff/courses/");revalidatePath("/staff/mock-tests/");return result;}
