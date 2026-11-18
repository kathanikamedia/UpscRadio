import { latestPapers } from "@/lib/upsc";
export async function GET() {
  return Response.json(await latestPapers(), { headers: { "Cache-Control": "no-store" } });
}
