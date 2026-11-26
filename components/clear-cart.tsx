"use client";
import {useEffect} from "react";
import {useCart,saveCart} from "./cart";
import {useAccount} from "./account-state";
/** Removes items from the browser cart once their order is paid. */
export function ClearCart({slugs}:{slugs:string[]}){
 const items=useCart(),{userId,ready}=useAccount();
 useEffect(()=>{if(!ready||!userId)return;const left=items.filter(slug=>!slugs.includes(slug));if(left.length!==items.length){try{saveCart(userId,left);}catch{}}},[ready,userId,items,slugs]);
 return null;
}
