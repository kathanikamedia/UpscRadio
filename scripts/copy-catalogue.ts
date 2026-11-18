import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { databaseConfig } from "../lib/database-config.mjs";
import { initialize,getDatabase,closeDatabase } from "../lib/db";
import { publicCatalogueExtra } from "../lib/catalogue-export";

// Copies public catalogue/CMS data only. Student records, secrets, payments,
// enquiries and local Clerk identities are never copied by this command.
const sourcePath=resolve(process.env.CATALOGUE_SOURCE_PATH||"data/radio.db");
let source:ReturnType<typeof createClient>|undefined;
try {
  const config=databaseConfig();
  if(config.url.startsWith("file:"))throw Error("Set a hosted DATABASE_URL before copying the catalogue.");
  if(!existsSync(sourcePath))throw Error("The local catalogue source file was not found.");
  source=createClient({url:pathToFileURL(sourcePath).href});
  const result=await source.execute("SELECT id,kind,slug,title,summary,body,category,published,extra FROM content WHERE published=1 OR kind='settings' ORDER BY id");
  await initialize();
  const statements=result.rows.map(row=>({sql:"INSERT OR IGNORE INTO content(kind,slug,title,summary,body,category,published,extra) VALUES (?,?,?,?,?,?,?,?)",args:[String(row.kind),String(row.slug),String(row.title),String(row.summary),String(row.body),String(row.category),Number(row.published),JSON.stringify(publicCatalogueExtra(String(row.kind),String(row.extra)))]}));
  if(statements.length)await getDatabase().batch(statements,"write");
  console.log(`Copied ${statements.length} catalogue/settings candidates. Existing remote entries were preserved. No student records or payments were copied.`);
} catch(error) {
  console.error(error instanceof Error&&/^(Set a hosted|The local catalogue)/.test(error.message)?error.message:"Catalogue copy failed. Check the source file and hosted database configuration. No credentials were displayed.");
  process.exitCode=1;
} finally {source?.close();closeDatabase();}
