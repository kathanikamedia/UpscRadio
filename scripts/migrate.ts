import { readFileSync } from "node:fs";
import { db, initialize } from "../lib/db";
await initialize();
const records = JSON.parse(readFileSync("data/legacy.json","utf8")) as { model:string; id:number; fields:Record<string,unknown> }[];
const types:Record<string,string> = {academy_course:"course",academy_resource:"resource",academy_profile:"profile",academy_branch:"branch",academy_notice:"notice",academy_sitesettings:"settings"};
const tx = await db.transaction("write");
try {
  for(const row of records) {
    // The original database remains the authority for unmigrated learning history.
    // Password hashes are excluded from the new application's identity system.
    const { password: _password, ...fields } = row.fields;
    await tx.execute({sql:"INSERT OR IGNORE INTO legacy(model,id,payload) VALUES (?,?,?)",args:[row.model,row.id,JSON.stringify(fields)]});
    if(types[row.model]) {
      await tx.execute({sql:"INSERT OR IGNORE INTO content(kind,slug,title,summary,body,category,published,extra) VALUES (?,?,?,?,?,?,?,?)",
        args:[types[row.model],String(fields.slug || "site"),String(fields.title || "Site settings"),String(fields.summary || ""),String(fields.body || ""),String(fields.category || fields.kind || ""),Number(fields.published || 0),JSON.stringify(fields)]});
    }
    if(row.model==="academy_enquiry") {
      await tx.execute({sql:"INSERT OR IGNORE INTO enquiries(id,name,email,phone,purpose,course,mode,status,notes,follow_up,created) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        args:[row.id,String(fields.name),String(fields.email),String(fields.phone),String(fields.purpose),String(fields.course_id || ""),String(fields.mode || ""),String(fields.status),String(fields.notes || ""),String(fields.follow_up || ""),String(fields.created)]});
    }
  }
  await tx.commit();
  console.log("Imported content, enquiries and archival history. Legacy passwords stay in the original database.");
} catch(error) { await tx.rollback(); throw error; }
db.close();
