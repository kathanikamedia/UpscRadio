
import {Localized} from "@/components/localized";
import { communityCounts } from "@/lib/community-counts";
import { CommunityStats } from "./community-stats";
export async function HomeCommunity(){return <Localized>{<CommunityStats initial={await communityCounts()}/>}</Localized>;}
