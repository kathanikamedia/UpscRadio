import { latestNews } from "@/lib/news";
export async function GET() {
  return Response.json(await latestNews(), { headers: { "Cache-Control": "no-store" } });
}
