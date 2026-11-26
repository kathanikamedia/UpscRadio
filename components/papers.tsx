"use client";
import {Localized} from "@/components/localized";

import { useLiveListing } from "./use-live-listing";
import type { PaperListing } from "@/lib/upsc-parser";
export function Papers({ initial }: { initial: PaperListing | null }) {
  const listing = useLiveListing<PaperListing>("/api/papers/", initial);
  if (!listing) return <Localized>{<p>View the latest papers in UPSC’s official archive.</p>}</Localized>;
  return <Localized>{<div className="pyq-list">
    <p className="pyq-exam">{listing.examination}</p>
    <ul>{listing.papers.map(paper => <li key={paper.url}><a target="_blank" rel="noopener noreferrer" href={paper.url}>{paper.title} <span aria-hidden="true">↗</span></a>{paper.size && <small>PDF · {paper.size}</small>}</li>)}</ul>
    {listing.stale && <small>Showing the last available update while UPSC reconnects.</small>}
  </div>}</Localized>;
}
