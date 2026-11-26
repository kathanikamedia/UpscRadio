
import {Localized} from "@/components/localized";
import { CartContents } from "@/components/cart-view";
import { contents } from "@/lib/db";
import { FREE_MOCK_SLUG } from "@/lib/mock-tests";
import { requireUser } from "@/lib/auth";
import { moodleConfigured } from "@/lib/moodle";
import { paymentsConfigured } from "@/lib/payments";
export const dynamic="force-dynamic";
export const metadata={title:"Your cart",robots:{index:false,follow:false}};
export default async function CartPage(){await requireUser("/cart/");const products=(await contents("course")).map(c=>({slug:c.slug,title:c.title,price:Math.max(0,Number(c.extra.price_paise)||0),demo:Boolean(c.extra.demo),free:c.slug===FREE_MOCK_SLUG,available:!c.extra.demo&&Number(c.extra.price_paise)>0&&paymentsConfigured&&moodleConfigured&&Number(c.extra.moodle_course_id)>0}));return <Localized>{<section className="shopping-page"><div className="wrap"><h1 className="sr-only">Your cart</h1><CartContents products={products}/></div></section>}</Localized>;}
