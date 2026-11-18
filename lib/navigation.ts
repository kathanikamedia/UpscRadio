// Only return to local app routes after authentication.
export function safeReturnTo(value:unknown):string|undefined{
 if(typeof value!=="string"||value.length>2000)return;
 try{const decoded=decodeURIComponent(value);if(!decoded.startsWith("/")||decoded.startsWith("//")||/[\\\u0000-\u0020]/.test(decoded)||decoded.startsWith("/account/"))return;const url=new URL(value,"https://local.invalid");if(url.origin!=="https://local.invalid")return;return url.pathname+url.search+url.hash;}catch{return;}
}
