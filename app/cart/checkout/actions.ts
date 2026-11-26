"use server";
import {redirect} from "next/navigation";
import {requireUser} from "@/lib/auth";
import {createCartOrder} from "@/lib/cart-orders";
export async function beginCartCheckout(_state:string,data:FormData){
 const user=await requireUser("/cart/");
 const slugs=String(data.get("items")||"").split(",").slice(0,20);
 let id:string;
 try{const result=await createCartOrder(user,slugs,data.get("coupon"));if("error" in result)return result.error!;id=result.id;}
 catch{return "Checkout could not be started. Please try again in a minute.";}
 redirect(`/cart/order/${id}/?pay=1`);
}
