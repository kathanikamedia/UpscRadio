import { execute } from "./db";

const requests = new Map<string, Promise<unknown>>();
const memory = new Map<string, { value: unknown; expires: number }>();
const refreshInterval = 10 * 60 * 1000;

export function cachedSource<T extends { checkedAt: string; stale?: boolean }>(
  key: string,
  url: string,
  parse: (html: string) => Omit<T, "checkedAt">,
): Promise<T | null> {
  const cached = memory.get(key);
  if (cached && cached.expires > Date.now()) return Promise.resolve(cached.value as T | null);
  const pending = requests.get(key);
  if (pending) return pending as Promise<T | null>;
  const task = refreshSource(key, url, parse).then(value => {
    memory.set(key, {
      value,
      expires: value && !value.stale ? Date.parse(value.checkedAt) + refreshInterval : Date.now() + 60000,
    });
    return value;
  }).finally(() => requests.delete(key));
  requests.set(key, task);
  return task;
}

async function refreshSource<T extends { checkedAt: string; stale?: boolean }>(
  key: string,
  url: string,
  parse: (html: string) => Omit<T, "checkedAt">,
): Promise<T | null> {
  const saved = (await execute({ sql: "SELECT * FROM source_cache WHERE key=?", args: [key] })).rows[0];
  const previous = saved ? JSON.parse(String(saved.payload)) as T : null;
  const now = Date.now();
  if (saved && now < Number(saved.retry_after)) return previous ? { ...previous, stale: true } : null;
  if (saved && now - Number(saved.checked) < refreshInterval) return previous;
  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10000), headers: { Accept: "text/html" } });
    if (!response.ok) throw new Error("Official source unavailable.");
    const result = { ...parse(await response.text()), checkedAt: new Date(now).toISOString() } as T;
    await execute({
      sql: "INSERT INTO source_cache(key,payload,checked,retry_after) VALUES (?,?,?,0) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload,checked=excluded.checked,retry_after=0",
      args: [key, JSON.stringify(result), now],
    });
    return result;
  } catch {
    if (saved) await execute({ sql: "UPDATE source_cache SET retry_after=? WHERE key=?", args: [now + 60000, key] });
    return previous ? { ...previous, stale: true } : null;
  }
}
