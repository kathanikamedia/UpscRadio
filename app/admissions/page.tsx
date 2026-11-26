
import {Localized} from "@/components/localized";
import { ActionForm } from "@/components/action-form";
import { submitEnquiry } from "@/app/actions";
import { contents } from "@/lib/db";
export const metadata={title:"Admissions and counselling"};
export const dynamic="force-dynamic";
export default async function Admissions() {
  const courses=await contents("course");
  const settings=(await contents("settings",false))[0]?.extra;
  return <Localized>{<><div className="page-head"><div className="wrap"><h1>Admissions and counselling</h1><p>Ask about courses, mock tests or a demo class.</p></div></div><div className="wrap section columns"><section className="card form-card"><h2>Send a request</h2>
    <ActionForm action={submitEnquiry} label="Send request">
      <p><label>Name<input name="name" required minLength={2} maxLength={100}/></label></p>
      <p><label>Email<input name="email" type="email" required maxLength={200}/></label></p>
      <p><label>Phone<input name="phone" type="tel" required pattern="[+0-9 ()-]{8,18}"/></label></p>
      <p><label>Request<select name="purpose"><option>Counselling</option><option>Demo class</option><option>Admission</option></select></label></p>
      <p><label>Course<select name="course"><option value="">Help me choose</option>{courses.map(c=><option key={c.id}>{c.title}</option>)}</select></label></p>
      <p><label>Mode<select name="mode"><option value="">No preference</option><option>Online</option><option>Classroom</option><option>Hybrid</option></select></label></p>
      <p><label><input type="checkbox" name="consent" required/> I agree to be contacted about this request.</label></p>
    </ActionForm></section><aside><h2>Contact</h2>{settings?.contact_email ? <p><a href={"mailto:"+settings.contact_email}>{String(settings.contact_email)}</a></p>:null}{settings?.contact_phone ? <p>{String(settings.contact_phone)}</p>:null}<p><a target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/@UPSCRadio">UPSC RADIO on YouTube ↗</a></p></aside></div></>}</Localized>;
}
