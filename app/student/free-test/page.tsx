import { requireUser } from "@/lib/auth";
import { content } from "@/lib/db";
import { FREE_MOCK_SLUG } from "@/lib/mock-tests";
import { moodleConfigured } from "@/lib/moodle";
import { ActionForm } from "@/components/action-form";
import { enrolFree } from "./actions";
export const metadata={title:"Free introductory mock",robots:{index:false,follow:false}};
export default async function FreeTest(){
 await requireUser();
 const test=await content("course",FREE_MOCK_SLUG);
 const ready=moodleConfigured&&Boolean(Number(test?.extra.moodle_course_id));
 return <section><p className="eyebrow">YOUR FIRST STEP</p><h1>Free Polity Starter Mock</h1><p>A focused practice session to help you identify topics to revisit.</p><article className="card"><h2>Before you begin</h2><ul className="test-instructions"><li>10 original introductory polity questions.</li><li>15 minutes, with one correct answer per question.</li><li>One mark per correct answer, with no negative marking.</li><li>Your test and review run in your learning account.</li></ul>{ready?<ActionForm action={enrolFree} label="Start free mock"><input type="hidden" name="test" value={FREE_MOCK_SLUG}/></ActionForm>:<p role="status" className="setup-notice">This free mock is being prepared. Test access will appear here once the learning platform is connected.</p>}</article></section>;
}
