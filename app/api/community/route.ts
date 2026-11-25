import { communityCounts } from "@/lib/community-counts";
export async function GET(){return Response.json(await communityCounts(),{headers:{"Cache-Control":"no-store"}});}
