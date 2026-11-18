import { cachedSource } from "./source-cache";
export const UPSC_NEWS_URL = "https://www.upsc.gov.in/whats-new";
export type NewsItem = { title: string; url: string };
export type NewsListing = { items: NewsItem[]; checkedAt: string; stale?: boolean };

export function parseNews(html: string): Omit<NewsListing, "checkedAt"> {
  const items: NewsItem[] = [];
  const rows = html.split(/<div\b[^>]*class=["'][^"']*\bviews-row\b[^"']*["'][^>]*>/i).slice(1);
  for (const row of rows) {
    const link = row.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    if (!link) continue;
    const url = new URL(link[1].replace(/&amp;/g, "&"), "https://www.upsc.gov.in/");
    if (url.protocol !== "https:" || !["www.upsc.gov.in", "upsc.gov.in"].includes(url.hostname)) continue;
    const title = link[2].replace(/<[^>]*>/g, " ").replace(/&#0*39;/g, "'").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    if (!title || items.some(item => item.url === url.href)) continue;
    items.push({ title, url: url.href });
    if (items.length === 3) break;
  }
  if (!items.length) throw new Error("No official UPSC notices found.");
  return { items };
}
export function latestNews() {
  return cachedSource<NewsListing>("upsc-news", UPSC_NEWS_URL, parseNews);
}
