import { unstable_cache } from "next/cache";
import { catalogueListing, homePreviews, content, execute } from "./db";
export const PUBLIC_CATALOGUE_TAG="public-catalogue-v1";
// Public listings only: account, wishlist, enrolment and checkout data remain uncached.
export const publishedCatalogue=unstable_cache(catalogueListing,["published-catalogue-v1"],{revalidate:60,tags:[PUBLIC_CATALOGUE_TAG]});
export const publishedHomePreviews=unstable_cache(homePreviews,["home-previews-v1"],{revalidate:60,tags:[PUBLIC_CATALOGUE_TAG]});
export const publishedContent=unstable_cache(content,["published-content-v1"],{revalidate:60,tags:[PUBLIC_CATALOGUE_TAG]});
export const publishedCourseMaterials=unstable_cache(async(slug:string)=>
 (await execute({sql:"SELECT slug,title,extra FROM content WHERE kind='resource' AND published=1 AND json_extract(extra,'$.course_slug')=? ORDER BY id",args:[slug]})).rows.map(row=>({slug:String(row.slug),title:String(row.title),language:String(JSON.parse(String(row.extra)).language||"English")})),
 ["published-course-materials-v1"],{revalidate:60,tags:[PUBLIC_CATALOGUE_TAG]});
