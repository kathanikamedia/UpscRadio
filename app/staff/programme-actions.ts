"use server";
import {requireAdmin} from "@/lib/auth";
import {saveContent} from "./actions";
import {revalidatePath} from "next/cache";
export async function saveProgramme(state:string,data:FormData){await requireAdmin();const type=data.get("programme_type");if(type!=="course"&&type!=="mock")return "Invalid programme type.";const price=String(data.get("fee_rupees")||"");if(!/^\d{1,6}(\.\d{1,2})?$/.test(price))return "Enter a valid price in rupees.";data.set("kind","course");data.set("price",String(Math.round(Number(price)*100)));if(type==="mock")data.set("category","Test Series");else if(data.get("category")==="Test Series")return "Use Mock Tests to manage tests.";const result=await saveContent(state,data);revalidatePath("/staff/courses/");revalidatePath("/staff/mock-tests/");return result;}
