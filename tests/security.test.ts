import test from "node:test";
import assert from "node:assert/strict";
import {readLimitedBody,BodyTooLarge} from "../lib/request-body";
import {safeReturnTo} from "../lib/navigation";
test("payment body limit rejects large streams even with a forged length header",async()=>{
 const small=new Request("https://site.invalid/",{method:"POST",body:"exact"});assert.equal(await readLimitedBody(small,5),"exact");
 const large=new Request("https://site.invalid/",{method:"POST",headers:{"Content-Length":"1"},body:"too-large"});await assert.rejects(()=>readLimitedBody(large,5),BodyTooLarge);
 const declared=new Request("https://site.invalid/",{method:"POST",headers:{"Content-Length":"1000"},body:"x"});await assert.rejects(()=>readLimitedBody(declared,5),BodyTooLarge);
});
test("post-login destinations accept local routes and reject external and encoded redirects",()=>{
 assert.equal(safeReturnTo("/courses/demo/?from=cart"),"/courses/demo/?from=cart");
 for(const value of ["https://evil.invalid/","//evil.invalid/","/%2f%2fevil.invalid/","/\\evil.invalid/","/%5cevil.invalid/","/account/login/","/%0aevil","%malformed",null])assert.equal(safeReturnTo(value),undefined,String(value));
});
