import test from "node:test";
import assert from "node:assert/strict";
import {resourceTopic,resourceTopics} from "../lib/resource-topics";
test("homepage topics resolve stable categories and support the previous keyword links",()=>{
 assert.equal(resourceTopic("current-affairs")?.title,"Current Affairs");
 assert.equal(resourceTopic(undefined,"current affairs")?.slug,"current-affairs");
 assert.equal(resourceTopic(undefined,"  General   Studies ")?.slug,"general-studies");
 assert.equal(resourceTopic(undefined,"polity")?.slug,"polity");
 assert.equal(resourceTopic("not-a-topic"),undefined);
 assert.equal(resourceTopic(undefined,"random search"),undefined);
});
test("each topic has official starting points without requiring unpublished study material",()=>{
 const hosts=new Set(["www.legislative.gov.in","sansad.in","www.pib.gov.in","www.upsc.gov.in","ncert.nic.in"]);
 for(const topic of resourceTopics){assert.ok(topic.terms.length);assert.ok(topic.sources.length>=2);for(const source of topic.sources){const url=new URL(source.url);assert.equal(url.protocol,"https:");assert.ok(hosts.has(url.hostname));}}
});
