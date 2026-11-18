"use client";
import { useLiveListing } from "./use-live-listing";
import type { NewsListing } from "@/lib/news";
export function News({ initial }: { initial: NewsListing | null }) {
  const listing = useLiveListing<NewsListing>("/api/news/", initial);
  return <>{listing?.items.map(item => <article className="news-entry" key={item.url}><h3>{item.title}</h3><a className="read-more" href={item.url} target="_blank" rel="noopener noreferrer" aria-label={"Read more about "+item.title}>Read more ↗</a></article>)}{listing?.stale ? <small>Showing the last available official update.</small> : null}<a className="read-more news-all" href="https://www.upsc.gov.in/whats-new" target="_blank" rel="noopener noreferrer">{listing?.items.length ? "All official updates ↗" : "Read the latest official notices ↗"}</a></>;
}
