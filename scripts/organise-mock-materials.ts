import {execute,getDatabase,closeDatabase} from "../lib/db";
import {additionalMaterialDrafts,currentAffairsDrafts} from "../lib/study-material-drafts";
try{
 const sources=[...additionalMaterialDrafts,currentAffairsDrafts[0]];
 for(const source of sources){
  const mockSlug=source.slug+"-mock",book=source.slug.match(/^(economy|environment)-part-(\d)$/)?.slice(1).join("-")||"current-affairs-english";
  const extra={...source.extra,source_material_slug:source.slug,question_bank:book,demo:true,preparation:true,download_after_attempt:true};
  await execute({sql:"INSERT INTO content(kind,slug,title,summary,body,category,published,extra) VALUES ('course',?,?,?,?, 'Test Series',1,?) ON CONFLICT(kind,slug) DO NOTHING",args:[mockSlug,source.title.replace(/ — English PDF$/," — English")+" Mock Test",source.summary,source.body,JSON.stringify(extra)]});
  await execute({sql:"UPDATE content SET published=0,extra=json_set(extra,'$.mock_slug',?) WHERE kind='resource' AND slug=?",args:[mockSlug,source.slug]});
 }
 const ca=currentAffairsDrafts[0].slug+"-mock";
 await execute({sql:"UPDATE content SET published=0,extra=json_set(extra,'$.mock_slug',?,'$.pdf_only',1) WHERE kind='resource' AND slug=?",args:[ca,currentAffairsDrafts[1].slug]});
 console.log("Created eight separate mock previews and linked nine original PDFs. Telugu remains PDF-only. Original files and questions preserved.");
}catch{console.error("Mock organisation failed. No files were deleted.");process.exitCode=1;}finally{closeDatabase();}
