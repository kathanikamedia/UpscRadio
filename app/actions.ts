"use server";
import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { execute, rateLimit } from "@/lib/db";
const enquiry = z.object({
  name:z.string().trim().min(2).max(100), email:z.email().max(200),
  phone:z.string().regex(/^\+?[0-9][0-9 ()-]{7,16}$/), purpose:z.enum(["Counselling","Demo class","Admission"]),
  course:z.string().max(180), mode:z.enum(["","Online","Classroom","Hybrid"]), consent:z.literal("on"),
});
export async function submitEnquiry(_state:string, data:FormData) {
  const result = enquiry.safeParse(Object.fromEntries(data));
  if(!result.success) return "Check the form fields and agree to be contacted.";
  const h = await headers();
  // Configure the reverse proxy to replace X-Forwarded-For.
  const client = h.get("x-forwarded-for")?.split(",")[0] || "local";
  try {
    await rateLimit("enquiry:"+client, 8);
    const v=result.data;
    await execute({sql:"INSERT INTO enquiries(name,email,phone,purpose,course,mode) VALUES (?,?,?,?,?,?)",args:[v.name,v.email,v.phone,v.purpose,v.course,v.mode]});
    revalidatePath("/staff");
    return "Your request has been received.";
  } catch { return "Your request could not be saved. Please try again later."; }
}
