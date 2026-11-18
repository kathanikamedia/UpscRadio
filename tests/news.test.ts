import test from "node:test";
import assert from "node:assert/strict";
import { parseNews } from "../lib/news";
test("official news preserves listing order and excludes external links", () => {
 const html='<div class="views-row"><a href="/whats-new/first"><ul><li>First &amp; latest</li></ul></a></div><div class="views-row"><a href="https://bad.example/">Bad</a></div><div class="views-row"><a href="/whats-new/second">Second</a></div>';
 assert.deepEqual(parseNews(html).items.map(item=>item.title),["First & latest","Second"]);
 assert.equal(parseNews(html).items[0].url,"https://www.upsc.gov.in/whats-new/first");
});
test("news parser does not turn an error page into a notice", () => {
 assert.throws(()=>parseNews("<h1>Service unavailable</h1>"));
});
