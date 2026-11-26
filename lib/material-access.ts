import {execute,type Content} from "./db";
import {requiresPurchase} from "./study-material-drafts";
import {cache} from "react";
const purchases=cache(async(user:string)=>(await execute({sql:"SELECT c.id,c.kind,c.slug FROM payments p JOIN content c ON c.id=p.course_id WHERE p.clerk_id=? AND p.status='Paid'",args:[user]})).rows);
export async function ownsProduct(user:string|null,id:number){return Boolean(user&&(await purchases(user)).some(row=>Number(row.id)===id));}
// A single PDF purchase does not grant a bundle; a bundle includes its linked PDFs.
// All access is derived from confirmed payments so refunds revoke only that grant.
export async function materialAccess(user:string|null,item:Pick<Content,"id"|"extra">){
 const free=!requiresPurchase(item.extra);
 if(!user)return {free,individual:false,bundle:false,mock:false,allowed:free};
 const parent=String(item.extra.course_slug||""),mock=String(item.extra.mock_slug||"");
 const rows=await purchases(user);
 const individual=rows.some(row=>Number(row.id)===item.id),bundle=Boolean(parent&&rows.some(row=>row.kind==="course"&&row.slug===parent)),mockOwned=Boolean(mock&&rows.some(row=>row.kind==="course"&&row.slug===mock));
 return {free,individual,bundle,mock:mockOwned,allowed:free||individual||bundle||mockOwned};
}
