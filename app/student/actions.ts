"use server";
import {requireUser} from "@/lib/auth";
import {execute} from "@/lib/db";
import {revalidatePath} from "next/cache";
export async function toggleSaved(data:FormData) {
 const user=await requireUser(),id=Number(data.get("id"));
 if(!Number.isSafeInteger(id))throw new Error("Invalid course");
 const exists=await execute({sql:"SELECT id FROM content WHERE id=? AND published=1 AND kind IN ('course','resource')",args:[id]});
 if(!exists.rows.length)throw new Error("Course unavailable");
 const saved=await execute({sql:"SELECT 1 FROM saved WHERE clerk_id=? AND content_id=?",args:[user,id]});
 if(saved.rows.length)await execute({sql:"DELETE FROM saved WHERE clerk_id=? AND content_id=?",args:[user,id]});
 else await execute({sql:"INSERT OR IGNORE INTO saved(clerk_id,content_id) VALUES (?,?)",args:[user,id]});
 revalidatePath("/student/saved");revalidatePath("/student");revalidatePath("/courses");revalidatePath("/resources");revalidatePath("/[...path]","page");
}
