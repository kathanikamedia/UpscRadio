import Link from "next/link";
import {notFound} from "next/navigation";
import {identity} from "@/lib/auth";
import {checkoutProduct} from "@/lib/checkout-product";
import {checkoutReady,paymentMode} from "@/lib/payment-policy";
import {checkoutHref,type ProductKind} from "@/lib/course-pricing";
import {materialAccess,ownsProduct} from "@/lib/material-access";
import {canPractise} from "@/lib/practice-bank";
import {paymentsConfigured} from "@/lib/payments";
import {moodleConfigured} from "@/lib/moodle";
import {PurchaseLayout} from "@/components/purchase-layout";
import {Localized} from "@/components/localized";
import {ActionForm} from "@/components/action-form";
import {beginCheckout} from "@/app/checkout/[slug]/actions";
import {Download,ArrowRight,CheckCircle2} from "lucide-react";
export const dynamic="force-dynamic";
export const metadata={title:"Purchase access",robots:{index:false,follow:false}};
export default async function Purchase({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{kind?:string;download_error?:string}>}){
 const {slug}=await params,query=await searchParams,kind:ProductKind=query.kind==="resource"?"resource":"course";
 const [item,user]=await Promise.all([checkoutProduct(kind,slug),identity()]);if(!item)notFound();
 const book=typeof item.extra.question_bank==="string"?item.extra.question_bank:null;
 const owned=kind==="resource"?(await materialAccess(user,item)).allowed:book&&user?await canPractise(user,book):await ownsProduct(user,item.id);
 const test=paymentMode()==="test",available=checkoutReady(item,{configured:paymentsConfigured,testMode:test,moodle:moodleConfigured});
 const checkout=checkoutHref(kind,slug),signIn="/account/login/?returnTo="+encodeURIComponent(checkout);
 const freeMock=Boolean(book&&Number(item.extra.price_paise)===0&&item.extra.pdf_uploaded);
 return <PurchaseLayout item={item} test={test} heading={kind==="resource"?"Get this study material":book?"Get access to this mock test":"Get the full course bundle"}><Localized>{query.download_error?<p className="purchase-alert" role="alert">The PDF could not be downloaded just now. Please retry or contact us for help.</p>:null}{owned?<><p className="purchase-owned"><CheckCircle2 size={18}/> Access available</p><p>You have access. Choose what you’d like to do next.</p>{kind==="resource"?<a className="button" href={`/downloads/${slug}/`}><Download size={17}/> Download PDF</a>:book?<><a className="button" href={`/api/mock-tests/${book}/pdf/`}><Download size={17}/> Download test PDF</a><Link className="button secondary" href={`/student/exam/${book}/`}>Start or resume test <ArrowRight size={16}/></Link></>:<Link className="button" href={`/courses/${slug}/`}>Open your bundle <ArrowRight size={16}/></Link>}</>:freeMock?<><p>This mock is free. Sign in to start practising and download the PDF.</p><Link className="button" href={"/account/login/?returnTo="+encodeURIComponent(`/student/exam/${book}/`)}>Sign in to start free</Link></>:available?<><p>Get access to this purchase in your account.</p>{user?<ActionForm action={beginCheckout} label="Continue to payment"><input type="hidden" name="slug" value={slug}/><input type="hidden" name="kind" value={kind}/></ActionForm>:<Link className="button" href={signIn}>Sign in to purchase <ArrowRight size={17}/></Link>}<p className="purchase-small">Your access is activated after payment is confirmed.</p></>:<><p>Purchases for this item are not available yet.</p><Link className="button secondary" href="/admissions/">Ask about availability</Link></>}</Localized></PurchaseLayout>;
}
