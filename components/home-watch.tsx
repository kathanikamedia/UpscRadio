
import {Localized} from "@/components/localized";
import { Suspense } from "react";
import { latestYouTubePlaylists, latestYouTubeVideos } from "@/lib/youtube";
import { HomeWatchRails } from "./home-watch-rails";

async function ChannelRows() {
  const [videos, playlists] = await Promise.all([latestYouTubeVideos(), latestYouTubePlaylists()]);
  return <Localized>{<HomeWatchRails videos={videos} playlists={playlists}/>}</Localized>;
}

export function HomeWatch() {
  return <Localized>{<Suspense fallback={<div className="wrap home-watch-pending" role="status">Loading conversations from UPSC Radio…</div>}><ChannelRows/></Suspense>}</Localized>;
}
