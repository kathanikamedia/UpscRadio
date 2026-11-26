import Link from "next/link";
import {Check,Download,ArrowRight,ShieldCheck} from "lucide-react";
import {Localized} from "./localized";
import {canDownloadMock} from "@/lib/practice-bank";
import {purchaseHref} from "@/lib/purchase-navigation";
import {checkoutHref} from "@/lib/course-pricing";
import {ActionForm} from "./action-form";
import {WishlistButton} from "./wishlist-button";
import {beginCheckout} from "@/app/checkout/[slug]/actions";
import {rupees} from "@/lib/course-pricing";
import type {Content} from "@/lib/db";
export async function MockAccessCard({item,viewer,wished=false}:{item:Content;viewer:string|null;wished?:boolean}){
 const book=String(item.extra.question_bank),access=Boolean(viewer&&await canDownloadMock(viewer,book));
 return <Localized><section className="mock-access-card"><div><h2>Test access</h2><p className="mock-access-meta">{Number(item.extra.question_count)} questions · Online mock + PDF</p><ul>{["Timed practice with saved answers","Review correct answers and explanations","Download the PDF whenever you need it"].map(label=><li key={label}><Check size={17}/>{label}</li>)}</ul></div><div className="mock-access-actions"><strong>{Number(item.extra.price_paise)>0?rupees(Number(item.extra.price_paise)):"Free"}</strong>{access?<><span className="purchase-owned"><Check size={15}/> Access available</span><a className="button secondary" href={`/api/mock-tests/${book}/pdf/`}><Download size={16}/> Download test PDF</a><Link className="button" href={`/student/exam/${book}/`}>Open exam room <ArrowRight size={16}/></Link></>:<>{Number(item.extra.price_paise)>0?(viewer?<ActionForm action={beginCheckout} label="Buy now"><input type="hidden" name="slug" value={item.slug}/><input type="hidden" name="kind" value="course"/></ActionForm>:<Link className="button" href={"/account/login/?returnTo="+encodeURIComponent(checkoutHref("course",item.slug))}>Sign in to buy <ArrowRight size={17}/></Link>):<Link className="button" href={purchaseHref(item.slug)}>Start free mock <ArrowRight size={17}/></Link>}<WishlistButton id={item.id} added={wished}/><span className="purchase-small"><ShieldCheck size={14}/> {Number(item.extra.price_paise)>0?"Purchase this test to download its PDF.":"Online test and PDF included"}</span></>}</div></section></Localized>;
}
