import { currentUser } from "@clerk/nextjs/server";
import { execute } from "./db";
import { moodle } from "./moodle";
export async function moodleIdentity(clerkId:string, create=false) {
  const known=await execute({sql:"SELECT moodle_id FROM identities WHERE clerk_id=?",args:[clerkId]});
  if(known.rows.length)return Number(known.rows[0].moodle_id);
  if(!create)return null;
  // Match only the stable Clerk subject, never an unverified email address.
  const username="clerk_"+clerkId.toLowerCase();
  const existing=await moodle<{id:number}[]>("core_user_get_users_by_field",{field:"username","values[0]":username});
  let id=existing[0]?.id;
  if(!id) {
    const user=await currentUser();
    const email=user?.emailAddresses.find(e=>e.id===user.primaryEmailAddressId && e.verification?.status==="verified");
    if(!user||!email)throw new Error("Verify your primary email before enrolling.");
    const result=await moodle<{id:number}[]>("core_user_create_users",{
      "users[0][username]":username,"users[0][auth]":"manual","users[0][createpassword]":1,
      "users[0][firstname]":user.firstName||user.username||"Student","users[0][lastname]":user.lastName||"UPSC RADIO",
      "users[0][email]":email.emailAddress,
    });
    id=result[0]?.id;
  }
  if(!id)throw new Error("Learning account could not be created.");
  await execute({sql:"INSERT INTO identities(clerk_id,moodle_id) VALUES (?,?) ON CONFLICT(clerk_id) DO NOTHING",args:[clerkId,id]});
  const linked=await execute({sql:"SELECT moodle_id FROM identities WHERE clerk_id=?",args:[clerkId]});
  return Number(linked.rows[0].moodle_id);
}
