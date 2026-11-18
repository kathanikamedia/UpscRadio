import { execute } from "./db";
import { parsePapers, UPSC_PAPERS_URL, type PaperListing } from "./upsc-parser";

export const PAPERS_REFRESH_MS = 10 * 60 * 1000;
let pending: Promise<PaperListing | null> | undefined;

async function refresh(): Promise<PaperListing | null> {
  await execute("CREATE TABLE IF NOT EXISTS source_cache (key TEXT PRIMARY KEY, payload TEXT NOT NULL, checked INTEGER NOT NULL, retry_after INTEGER NOT NULL DEFAULT 0)");
  const saved = (await execute({ sql: "SELECT * FROM source_cache WHERE key=?", args: ["upsc-papers"] })).rows[0];
  const now = Date.now();
  const previous: PaperListing | null = saved ? JSON.parse(String(saved.payload)) : null;
  if (saved && now < Number(saved.retry_after)) return previous ? { ...previous, stale: true } : null;
  if (saved && now - Number(saved.checked) < PAPERS_REFRESH_MS) return previous;
  try {
    const response = await fetch(UPSC_PAPERS_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: { Accept: "text/html" },
    });
    if (!response.ok) throw new Error("UPSC is unavailable.");
    const result: PaperListing = { ...parsePapers(await response.text()), checkedAt: new Date().toISOString() };
    await execute({
      sql: "INSERT INTO source_cache(key,payload,checked,retry_after) VALUES (?,?,?,0) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload,checked=excluded.checked,retry_after=0",
      args: ["upsc-papers", JSON.stringify(result), now],
    });
    return result;
  } catch {
    if (saved) await execute({ sql: "UPDATE source_cache SET retry_after=? WHERE key=?", args: [now + 60000, "upsc-papers"] });
    return previous ? { ...previous, stale: true } : null;
  }
}

export function latestPapers() {
  pending ??= refresh().finally(() => { pending = undefined; });
  return pending;
}
