import {content,execute,type Content} from "./db";
import type {ProductKind} from "./course-pricing";
export async function checkoutProduct(kind:ProductKind,slug:string){
 const item=await content(kind,slug);if(!item)return undefined;
 if(kind==="course"&&item.extra.pricing_model==="bundle")return (await bundleAvailability([item]))[0];
 return item;
}
export async function bundleAvailability(items:Content[]){
 const bundles=items.filter(item=>item.kind==="course"&&item.extra.pricing_model==="bundle");
 if(!bundles.length)return items;
 const counts=(await execute({sql:`SELECT json_extract(extra,'$.course_slug') AS course,COUNT(*) AS count FROM content WHERE kind='resource' AND published=1 AND COALESCE(json_extract(extra,'$.storage_key'),'')!='' AND json_extract(extra,'$.course_slug') IN (${bundles.map(()=>"?").join(",")}) GROUP BY json_extract(extra,'$.course_slug')`,args:bundles.map(item=>item.slug)})).rows;
 const bySlug=new Map(counts.map(row=>[String(row.course),Number(row.count)]));
 return items.map(item=>item.extra.pricing_model==="bundle"?{...item,extra:{...item.extra,bundle_material_count:bySlug.get(item.slug)||0}}:item);
}
