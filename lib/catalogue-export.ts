const fields:Record<string,readonly string[]>={
 course:["url","mode","duration","language","syllabus","inclusions","price_paise","moodle_course_id","demo","free_mock","question_count","minutes","exam"],
 resource:["url","exam","type","storage_key","price_paise","temporary_price","purchase_enabled","access","language","native_title","groups","stage","question_count","pages","file_bytes","coverage","coverage_end","publisher","cover"],
 profile:["url","role","subject","position","result","year","rank","video_url"],
 notice:["url"],
 branch:["url","address","phone","email","map_url"],
 settings:["contact_email","contact_phone","about","privacy","whatsapp_number"],
};
export function publicCatalogueExtra(kind:string,raw:string):Record<string,string|number|boolean>{
 let extra:Record<string,unknown>;
 try{const parsed:unknown=JSON.parse(raw);if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))return {};extra=parsed as Record<string,unknown>;}catch{return {};}
 return Object.fromEntries((fields[kind]||[]).flatMap(key=>{
  const value=extra[key];return typeof value==="string"||typeof value==="boolean"||typeof value==="number"&&Number.isFinite(value)?[[key,value]]:[];
 }));
}
