import { communityCounts } from "@/lib/community-counts";
import { CommunityStats } from "./community-stats";
export async function HomeCommunity(){return <CommunityStats initial={await communityCounts()}/>;}
