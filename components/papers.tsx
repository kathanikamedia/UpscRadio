"use client";
import { useEffect, useState } from "react";
import type { PaperListing } from "@/lib/upsc-parser";
export function Papers({ initial }: { initial: PaperListing | null }) {
  const [listing, setListing] = useState(initial);
  useEffect(() => {
    const controller = new AbortController();
    async function update() {
      try {
        const response = await fetch("/api/papers/", { cache: "no-store", signal: controller.signal });
        if (response.ok) {
          const result = await response.json() as PaperListing | null;
          if (result) setListing(result);
        }
      } catch { /* Retain the last successful listing during a network interruption. */ }
    }
    const interval = setInterval(update, 10 * 60 * 1000);
    const visible = () => { if (document.visibilityState === "visible") void update(); };
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearInterval(interval);
      controller.abort();
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  if (!listing) return <p>View the latest papers in UPSC’s official archive.</p>;
  return <div className="pyq-list">
    <p className="pyq-exam">{listing.examination}</p>
    <ul>{listing.papers.map(paper => <li key={paper.url}><a href={paper.url} target="_blank" rel="noopener noreferrer">{paper.title} <span aria-hidden="true">↗</span></a>{paper.size && <small>PDF · {paper.size}</small>}</li>)}</ul>
    {listing.stale && <small>Showing the last available update while UPSC reconnects.</small>}
  </div>;
}
