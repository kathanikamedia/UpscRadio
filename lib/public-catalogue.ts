import { unstable_cache } from "next/cache";
import { catalogueListing, homePreviews, content, execute } from "./db";
export const PUBLIC_CATALOGUE_TAG="public-catalogue-v1";
// Public listings only: account, wishlist, enrolment and checkout data remain uncached.
export const publishedCatalogue=unstable_cache(catalogueListing,["published-catalogue-v1"],{revalidate:60,tags:[PUBLIC_CATALOGUE_TAG]});
export const publishedHomePreviews=unstable_cache(homePreviews,["home-previews-v1"],{revalidate:60,tags:[PUBLIC_CATALOGUE_TAG]});
export const publishedContent=unstable_cache(content,["published-content-v1"],{revalidate:60,tags:[PUBLIC_CATALOGUE_TAG]});
export const publishedCourseMaterials=unstable_cache(async(slug:string)=>
 (await execute({sql:"SELECT id,slug,title,summary,extra FROM content WHERE kind='resource' AND published=1 AND json_extract(extra,'$.course_slug')=? ORDER BY id",args:[slug]})).rows.map(row=>{const extra=JSON.parse(String(row.extra));return {id:Number(row.id),slug:String(row.slug),title:String(row.title),summary:String(row.summary),extra,language:String(extra.language||"English"),price:Number(extra.price_paise)||0};}),
 ["published-course-materials-v2"],{revalidate:60,tags:[PUBLIC_CATALOGUE_TAG]});
