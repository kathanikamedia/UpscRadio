import {requireUser} from "@/lib/auth";
import {moodleIdentity} from "@/lib/identity";
import {moodle,moodleLink} from "@/lib/moodle";
export async function POST(request:Request) {
 if(request.headers.get("origin")!==new URL(request.url).origin)return new Response("Invalid origin",{status:403});
 const id=await requireUser(),mid=await moodleIdentity(id);
 if(!mid)return new Response("No learning account linked",{status:403});
 const data=await request.formData(),course=Number(data.get("course"));
 const courses=await moodle<{id:number}[]>("core_enrol_get_users_courses",{userid:mid});
 if(!courses.some(c=>c.id===course))return new Response("Course access denied",{status:403});
 try{
  const result=await moodle<{loginurl:string}>("auth_userkey_request_login_url",{"user[id]":mid});
  const url=new URL(result.loginurl),origin=new URL(process.env.MOODLE_URL!).origin;
  if(url.origin!==origin||url.pathname!=="/auth/userkey/login.php")throw Error();
  url.searchParams.set("wantsurl",moodleLink("/course/view.php?id="+course));
  return new Response(null,{status:303,headers:{Location:url.href,"Cache-Control":"no-store","Referrer-Policy":"no-referrer"}});
 }catch{return new Response("Learning sign-in is temporarily unavailable. Please contact admissions.",{status:503});}
}
