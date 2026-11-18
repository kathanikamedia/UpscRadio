export class BodyTooLarge extends Error {}
// Enforce the limit on actual streamed bytes, not just the client-supplied header.
export async function readLimitedBody(request:Request,limit:number):Promise<string>{
 if(Number(request.headers.get("content-length"))>limit)throw new BodyTooLarge("Request too large");
 if(!request.body)return "";
 const reader=request.body.getReader(),chunks:Uint8Array[]=[];let length=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>limit){await reader.cancel();throw new BodyTooLarge("Request too large");}chunks.push(value);}}
 finally{reader.releaseLock();}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 return new TextDecoder().decode(bytes);
}
