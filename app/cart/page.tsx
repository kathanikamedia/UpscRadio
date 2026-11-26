
import {Localized} from "@/components/localized";
import { CartContents } from "@/components/cart-view";
import { contents } from "@/lib/db";
import { FREE_MOCK_SLUG } from "@/lib/mock-tests";
import { requireUser } from "@/lib/auth";
import { moodleConfigured } from "@/lib/moodle";
import { paymentsConfigured } from "@/lib/payments";
import {bundleAvailability} from "@/lib/checkout-product";
import {checkoutReady,paymentMode} from "@/lib/payment-policy";

export const dynamic="force-dynamic";
export const metadata={title:"Your cart",robots:{index:false,follow:false}};
export default async function CartPage(){await requireUser("/cart/");const test=paymentMode()==="test";const products=(await bundleAvailability(await contents("course"))).map(c=>({slug:c.slug,title:c.title,price:Math.max(0,Number(c.extra.price_paise)||0),demo:Boolean(c.extra.demo)&&c.category!=="Test Series",free:c.slug===FREE_MOCK_SLUG,available:checkoutReady(c,{configured:paymentsConfigured,testMode:test,moodle:moodleConfigured})}));return <Localized>{<section className="shopping-page"><div className="wrap"><h1 className="sr-only">Your cart</h1><CartContents products={products}/></div></section>}</Localized>;}
