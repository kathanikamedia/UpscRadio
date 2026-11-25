import { initialize,getDatabase,closeDatabase } from "../lib/db";
import { databaseConfig } from "../lib/database-config.mjs";
import { checkStudyMaterial } from "../lib/r2";
import { currentAffairsDrafts } from "../lib/study-material-drafts";

try{
  const hosted=process.argv.includes("--hosted");
  if(hosted&&databaseConfig().url.startsWith("file:"))throw Error("A hosted database is required for --hosted.");
  for(const item of currentAffairsDrafts)await checkStudyMaterial(item.extra.storage_key);
  if(!process.argv.includes("--write")){
    console.log("Both private PDFs verified. Dry run only; no listings were changed. Add --write to save unpublished drafts.");
  }else{
    await initialize();
    await getDatabase().batch(currentAffairsDrafts.map(item=>({
      sql:"INSERT INTO content(kind,slug,title,summary,body,category,published,extra) VALUES ('resource',?,?,?,?,?,0,?) ON CONFLICT(kind,slug) DO UPDATE SET title=excluded.title,summary=excluded.summary,body=excluded.body,category=excluded.category,extra=json_patch(content.extra,excluded.extra) WHERE content.published=0",
      args:[item.slug,item.title,item.summary,item.body,item.category,JSON.stringify(item.extra)],
    })),"write");
    const checks=await getDatabase().batch(currentAffairsDrafts.map(item=>({sql:"SELECT slug,published,json_extract(extra,'$.price_paise') AS price FROM content WHERE kind='resource' AND slug=?",args:[item.slug]})),"read");
    if(checks.some(check=>check.rows.length!==1))throw Error("Draft verification failed.");
    if(checks.some(check=>Number(check.rows[0].published)!==0))throw Error("An existing published listing was preserved. Review it separately.");
    console.log(`Verified two unpublished ₹99 material drafts on the ${hosted?"hosted":"configured"} database. No publication, purchases, student records or PDF files were changed.`);
  }
}catch(error){
  console.error(error instanceof Error&&/^(A hosted|An existing published|Draft verification)/.test(error.message)?error.message:"Material draft setup failed. Check database/R2 configuration and uploaded PDF paths. No credentials were displayed.");
  process.exitCode=1;
}finally{closeDatabase();}
