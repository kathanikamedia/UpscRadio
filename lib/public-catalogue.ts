import { unstable_cache } from "next/cache";
import { catalogueListing, homePreviews } from "./db";
export const PUBLIC_CATALOGUE_TAG="public-catalogue-v1";
// Public listings only: account, wishlist, enrolment and checkout data remain uncached.
export const publishedCatalogue=unstable_cache(catalogueListing,["published-catalogue-v1"],{revalidate:60,tags:[PUBLIC_CATALOGUE_TAG]});
export const publishedHomePreviews=unstable_cache(homePreviews,["home-previews-v1"],{revalidate:60,tags:[PUBLIC_CATALOGUE_TAG]});
