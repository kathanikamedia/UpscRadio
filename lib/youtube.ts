import { after } from "next/server";
import { cachedSource } from "./source-cache";
import { parseVideoFeed,parsePlaylistPage,YOUTUBE_CHANNEL_ID,type YouTubeListing } from "./youtube-parser";
export function latestYouTubeVideos(){return cachedSource<YouTubeListing>("youtube-uploads",`https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`,parseVideoFeed,after);}
export function latestYouTubePlaylists(){return cachedSource<YouTubeListing>("youtube-playlists","https://www.youtube.com/@UPSCRadio/playlists?view=1&sort=dd&hl=en",parsePlaylistPage,after);}
