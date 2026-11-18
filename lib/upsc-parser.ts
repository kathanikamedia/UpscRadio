export const UPSC_PAPERS_URL = "https://www.upsc.gov.in/examinations/previous-question-papers";
export type Paper = { title: string; url: string; size: string };
export type PaperListing = { examination: string; papers: Paper[]; checkedAt: string; stale?: boolean };

function text(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

export function parsePapers(html: string): Omit<PaperListing, "checkedAt"> {
  // Select the first Mains table in source order, preserving UPSC's listing order.
  const tables = html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi);
  for (const [, table] of tables) {
    const caption = table.match(/<caption\b[^>]*>([\s\S]*?)<\/caption>/i);
    if (!caption || !/^Civil Services\s*\(Main\)\s*Examination,?\s*\d{4}$/i.test(text(caption[1]))) continue;
    const papers: Paper[] = [];
    for (const [, item] of table.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
      const link = item.match(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
      if (!link) continue;
      const url = new URL(link[1].replace(/&amp;/g, "&"), UPSC_PAPERS_URL);
      if (url.protocol !== "https:" || !["upsc.gov.in", "www.upsc.gov.in"].includes(url.hostname) || !url.pathname.toLowerCase().endsWith(".pdf")) continue;
      const title = text(item.slice(0, link.index));
      if (!title || papers.some(p => p.url === url.href)) continue;
      papers.push({ title, url: url.href, size: text(link[2]).replace(/[()]/g, "") });
      if (papers.length === 2) return { examination: text(caption[1]), papers };
    }
    throw new Error("The latest Mains listing does not contain two valid papers.");
  }
  throw new Error("UPSC Mains listing could not be found.");
}
