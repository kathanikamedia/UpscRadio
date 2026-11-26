import { createClient, type Client, type InStatement } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { databaseConfig } from "./database-config.mjs";
let client: Client | undefined;
// Importing a page must not create directories or open a database connection.
export function getDatabase(): Client {
  if (client) return client;
  const config = databaseConfig();
  if (config.url.startsWith("file:")) {
    const file = config.url.slice(5).split("?")[0];
    if (file && file !== ":memory:") {
      const target = file.startsWith("//") ? fileURLToPath(config.url) : resolve(decodeURIComponent(file));
      mkdirSync(dirname(target), { recursive: true });
    }
  }
  client = createClient(config);
  return client;
}
let ready: Promise<void> | undefined;
export function closeDatabase() { client?.close(); client = undefined; ready = undefined; }
export function initialize() {
  ready ??= ensureSchema();
  return ready;
}
async function ensureSchema(){
 try{
  const required=["content","enquiries","identities","payments","rate_limits","legacy","saved","audit","source_cache","course_enrolments","lesson_completions","practice_attempts","question_drafts","question_explanations","one_active_payment","content_listing","practice_attempt_owner","exam_attempts","one_running_exam"];
  const existing=await getDatabase().execute("SELECT name FROM sqlite_master WHERE type IN ('table','index')");
  const names=new Set(existing.rows.map(row=>String(row.name)));
  required.push("mock_papers","coupons","coupon_redemptions","cart_orders");
  if(required.every(name=>names.has(name)))return;
  await getDatabase().batch([
    // Additive tables only: coupons and whole-cart orders. Existing tables are untouched.
    "CREATE TABLE IF NOT EXISTS coupons (code TEXT PRIMARY KEY, percent_off INTEGER NOT NULL DEFAULT 0, amount_off INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, expires TEXT, max_uses INTEGER, used INTEGER NOT NULL DEFAULT 0, created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS coupon_redemptions (order_id TEXT PRIMARY KEY, code TEXT NOT NULL, clerk_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Pending', created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS cart_orders (id TEXT PRIMARY KEY, clerk_id TEXT NOT NULL, order_id TEXT UNIQUE, payment_id TEXT UNIQUE, amount INTEGER NOT NULL, subtotal INTEGER NOT NULL, coupon TEXT, items TEXT NOT NULL, status TEXT NOT NULL, created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS mock_papers (book TEXT PRIMARY KEY,content_id INTEGER NOT NULL,title TEXT NOT NULL,storage_key TEXT NOT NULL,questions TEXT NOT NULL,seconds INTEGER NOT NULL,metadata TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'draft',created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS exam_attempts (id TEXT PRIMARY KEY,clerk_id TEXT NOT NULL,book TEXT NOT NULL,title TEXT NOT NULL,questions TEXT NOT NULL,answers TEXT NOT NULL DEFAULT '{}',marked TEXT NOT NULL DEFAULT '[]',started INTEGER NOT NULL,deadline INTEGER NOT NULL,revision INTEGER NOT NULL DEFAULT 0,submitted INTEGER,result TEXT)",
    "CREATE UNIQUE INDEX IF NOT EXISTS one_running_exam ON exam_attempts(clerk_id,book) WHERE submitted IS NULL",
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
    "CREATE TABLE IF NOT EXISTS course_enrolments (clerk_id TEXT NOT NULL, course_slug TEXT NOT NULL, created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(clerk_id,course_slug))",
    "CREATE TABLE IF NOT EXISTS lesson_completions (clerk_id TEXT NOT NULL, course_slug TEXT NOT NULL, lesson_slug TEXT NOT NULL, completed TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(clerk_id,course_slug,lesson_slug), FOREIGN KEY(clerk_id,course_slug) REFERENCES course_enrolments(clerk_id,course_slug))",
    "CREATE TABLE IF NOT EXISTS practice_attempts (id INTEGER PRIMARY KEY, clerk_id TEXT NOT NULL, practice_slug TEXT NOT NULL, score INTEGER NOT NULL, total INTEGER NOT NULL, created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    "CREATE INDEX IF NOT EXISTS practice_attempt_owner ON practice_attempts(clerk_id,practice_slug,id DESC)",
    "CREATE TABLE IF NOT EXISTS question_drafts (book_slug TEXT NOT NULL, question_number INTEGER NOT NULL, question TEXT NOT NULL, options TEXT NOT NULL, answer TEXT NOT NULL, reviewed INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(book_slug,question_number))",
    "CREATE TABLE IF NOT EXISTS question_explanations (book_slug TEXT NOT NULL, question_number INTEGER NOT NULL, explanation TEXT NOT NULL, PRIMARY KEY(book_slug,question_number))",
  ], "write");
 }catch(error){
    ready = undefined;
    throw error;
 }
}
export async function execute(statement: InStatement) {
  await initialize();
  return getDatabase().execute(statement);
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
export async function catalogueListing(kind:string):Promise<Content[]>{
  const result=await execute({sql:"SELECT id,kind,slug,title,summary,category,published,extra FROM content WHERE kind=? AND published=1 AND NOT (kind='course' AND category!='Test Series' AND COALESCE(json_extract(extra,'$.demo'),0) IN (1,'true')) ORDER BY id DESC",args:[kind]});
  return result.rows.map(row=>({...row,body:"",extra:JSON.parse(String(row.extra))}) as unknown as Content);
}
// Homepage previews need neither full article bodies nor the entire catalogue.
export async function homePreviews(kind: "course" | "profile", limit: number): Promise<Content[]> {
  const category = kind === "course" ? "category != 'Test Series'" : "category IN ('Testimonial','Result')";
  const result = await execute({
    sql: `SELECT id,kind,slug,title,summary,category,published,extra FROM content WHERE kind=? AND published=1 AND ${category} AND NOT (kind='course' AND category!='Test Series' AND COALESCE(json_extract(extra,'$.demo'),0) IN (1,'true')) ORDER BY id DESC LIMIT ?`,
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
