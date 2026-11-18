import { cachedSource } from "./source-cache";
import { parsePapers, UPSC_PAPERS_URL, type PaperListing } from "./upsc-parser";
export const PAPERS_REFRESH_MS = 10 * 60 * 1000;
export function latestPapers() {
  return cachedSource<PaperListing>("upsc-papers", UPSC_PAPERS_URL, parsePapers);
}
