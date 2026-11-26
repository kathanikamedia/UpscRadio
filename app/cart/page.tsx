
import {Localized} from "@/components/localized";
import { CartContents } from "@/components/cart-view";
import { contents } from "@/lib/db";
import { FREE_MOCK_SLUG } from "@/lib/mock-tests";
import { requireUser } from "@/lib/auth";
import { moodleConfigured } from "@/lib/moodle";
import { paymentsConfigured } from "@/lib/payments";
import {checkoutReady,paymentMode} from "@/lib/payment-policy";
import {currentUser} from "@clerk/nextjs/server";
export const dynamic="force-dynamic";
export const metadata={title:"Your cart",robots:{index:false,follow:false}};
export default async function CartPage(){await requireUser("/cart/");const test=paymentMode()==="test",admin=(await currentUser())?.publicMetadata.role==="admin";const products=(await contents("course")).map(c=>({slug:c.slug,title:c.title,price:Math.max(0,Number(c.extra.price_paise)||0),demo:Boolean(c.extra.demo),free:c.slug===FREE_MOCK_SLUG,available:(!test||admin)&&checkoutReady(c,{configured:paymentsConfigured,testAdmin:test&&admin,moodle:moodleConfigured})}));return <Localized>{<section className="shopping-page"><div className="wrap"><h1 className="sr-only">Your cart</h1><CartContents products={products}/></div></section>}</Localized>;}
