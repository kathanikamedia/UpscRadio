import { requireUser } from "@/lib/auth";
import { EconomyPractice } from "@/components/economy-practice";
import { execute } from "@/lib/db";
export const metadata={title:"Free economy practice",robots:{index:false,follow:false}};
export default async function Page(){const user=await requireUser("/student/economy-practice/");const attempts=await execute({sql:"SELECT score,total,created FROM practice_attempts WHERE clerk_id=? AND practice_slug=? ORDER BY id DESC LIMIT 1",args:[user,"economy-basics"]});const last=attempts.rows[0];return <><EconomyPractice/>{last?<p>Previous saved attempt: {Number(last.score)} / {Number(last.total)} correct.</p>:null}</>;}
