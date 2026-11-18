import { createHmac, timingSafeEqual } from "node:crypto";
export function validSignature(secret:string,body:string,signature:string) {
 if(!/^[a-f0-9]{64}$/i.test(signature))return false;
 const expected=createHmac("sha256",secret).update(body).digest();
 return timingSafeEqual(expected,Buffer.from(signature,"hex"));
}
