export const DEFAULT_BUNDLE_PAISE=19900;
export const DEFAULT_MATERIAL_PAISE=9900;
export type ProductKind="course"|"resource";
export const checkoutHref=(kind:ProductKind,slug:string)=>`/checkout/${encodeURIComponent(slug)}/${kind==="resource"?"?kind=resource":""}`;
export const rupees=(paise:number)=>`₹${(paise/100).toLocaleString("en-IN",{maximumFractionDigits:2})}`;
export function bundleComparison(bundle:number,materials:{price:number;owned?:boolean}[]){
 const remaining=materials.filter(item=>!item.owned),individualTotal=remaining.reduce((sum,item)=>sum+item.price,0);
 return {individualTotal,savings:remaining.length>1?Math.max(0,individualTotal-bundle):0,count:remaining.length};
}
