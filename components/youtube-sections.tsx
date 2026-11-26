
import {Localized} from "@/components/localized";
import { Suspense } from "react";
import { latestYouTubeVideos,latestYouTubePlaylists } from "@/lib/youtube";
import { YouTubeGallery } from "./youtube-gallery";
async function Videos(){return <Localized>{<YouTubeGallery kind="videos" initial={await latestYouTubeVideos()}/>}</Localized>;}
async function Playlists(){return <Localized>{<YouTubeGallery kind="playlists" initial={await latestYouTubePlaylists()}/>}</Localized>;}
function LoadingGallery(){return <Localized>{<div className="youtube-loading" role="status">Loading the latest from UPSC Radio…</div>}</Localized>;}
export function YouTubeSections(){return <Localized>{<><section className="youtube-section" aria-labelledby="latest-video-title"><div className="section-head"><div><p className="eyebrow">FRESH FROM OUR CHANNEL</p><h2 id="latest-video-title">Latest videos</h2></div><a href="https://www.youtube.com/@UPSCRadio/videos" target="_blank" rel="noopener noreferrer">All uploads ↗</a></div><Suspense fallback={<LoadingGallery/>}><Videos/></Suspense></section><section className="youtube-section" aria-labelledby="latest-playlist-title"><div className="section-head"><div><p className="eyebrow">FOLLOW A TOPIC. BUILD YOUR UNDERSTANDING.</p><h2 id="latest-playlist-title">Latest playlists</h2></div><a href="https://www.youtube.com/@UPSCRadio/playlists" target="_blank" rel="noopener noreferrer">All playlists ↗</a></div><Suspense fallback={<LoadingGallery/>}><Playlists/></Suspense></section></>}</Localized>;}
