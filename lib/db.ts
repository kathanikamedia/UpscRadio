import { createClient, type InStatement } from "@libsql/client";
import { mkdirSync } from "node:fs";
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:")) {
  mkdirSync("data", { recursive: true });
}
export const db = createClient({
  url: process.env.DATABASE_URL || "file:data/radio.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
let ready: Promise<void> | undefined;
export function initialize() {
  ready ??= db.batch([
    "CREATE TABLE IF NOT EXISTS content (id INTEGER PRIMARY KEY, kind TEXT NOT NULL, slug TEXT NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '', body TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT '', published INTEGER NOT NULL DEFAULT 0, extra TEXT NOT NULL DEFAULT '{}', UNIQUE(kind,slug))",
    "CREATE TABLE IF NOT EXISTS enquiries (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, purpose TEXT NOT NULL, course TEXT NOT NULL DEFAULT '', mode TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'New', notes TEXT NOT NULL DEFAULT '', follow_up TEXT NOT NULL DEFAULT '', created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS identities (clerk_id TEXT PRIMARY KEY, moodle_id INTEGER UNIQUE NOT NULL)",
    "CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, clerk_id TEXT NOT NULL, course_id INTEGER NOT NULL, amount INTEGER NOT NULL, order_id TEXT UNIQUE, payment_id TEXT UNIQUE, status TEXT NOT NULL, captured TEXT, fulfilled INTEGER NOT NULL DEFAULT 0)",
    "CREATE UNIQUE INDEX IF NOT EXISTS one_active_payment ON payments(clerk_id,course_id) WHERE status IN ('Creating','Pending','Paid')",
    "CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL)",
    "CREATE TABLE IF NOT EXISTS legacy (model TEXT NOT NULL, id INTEGER NOT NULL, payload TEXT NOT NULL, PRIMARY KEY(model,id))",
    "CREATE TABLE IF NOT EXISTS saved (clerk_id TEXT NOT NULL, content_id INTEGER NOT NULL, created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(clerk_id,content_id))",
    "CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS source_cache (key TEXT PRIMARY KEY, payload TEXT NOT NULL, checked INTEGER NOT NULL, retry_after INTEGER NOT NULL DEFAULT 0)",
    "CREATE INDEX IF NOT EXISTS content_listing ON content(kind,published,id DESC)",
  ], "write").then(() => undefined).catch(error => {
    ready = undefined;
    throw error;
  });
  return ready;
}
export async function execute(statement: InStatement) {
  await initialize();
  return db.execute(statement);
}
export type Content = { id: number; kind: string; slug: string; title: string; summary: string; body: string; category: string; published: number; extra: Record<string, unknown> };
export async function contents(kind: string, published = true): Promise<Content[]> {
  const result = await execute({ sql: "SELECT * FROM content WHERE kind=? " + (published ? "AND published=1 " : "") + "ORDER BY id DESC", args: [kind] });
  return result.rows.map(row => ({ ...row, extra: JSON.parse(String(row.extra)) }) as unknown as Content);
}
export async function content(kind: string, slug: string) {
  const result = await execute({
    sql: "SELECT * FROM content WHERE kind=? AND slug=? AND published=1 LIMIT 1",
    args: [kind, slug],
  });
  const row = result.rows[0];
  return row ? { ...row, extra: JSON.parse(String(row.extra)) } as unknown as Content : undefined;
}
// Homepage previews need neither full article bodies nor the entire catalogue.
export async function homePreviews(kind: "course" | "profile", limit: number): Promise<Content[]> {
  const category = kind === "course" ? "category != 'Test Series'" : "category IN ('Testimonial','Result')";
  const result = await execute({
    sql: `SELECT id,kind,slug,title,summary,category,published,extra FROM content WHERE kind=? AND published=1 AND ${category} ORDER BY id DESC LIMIT ?`,
    args: [kind, limit],
  });
  return result.rows.map(row => ({ ...row, body: "", extra: JSON.parse(String(row.extra)) }) as unknown as Content);
}
export async function rateLimit(key: string, maximum = 8) {
  const now = Date.now();
  const result = await execute({
    sql: "INSERT INTO rate_limits(key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<? THEN 1 ELSE count+1 END, expires=CASE WHEN expires<? THEN ? ELSE expires END RETURNING count",
    args: [key, now + 900000, now, now, now + 900000],
  });
  if (Number(result.rows[0].count) > maximum) throw new Error("Too many requests. Try again in 15 minutes.");
}
