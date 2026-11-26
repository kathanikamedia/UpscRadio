import Link from "next/link";
import {Check,Download,ArrowRight,ShieldCheck} from "lucide-react";
import {Localized} from "./localized";
import {canDownloadMock} from "@/lib/practice-bank";
import {purchaseHref} from "@/lib/purchase-navigation";
import {checkoutHref} from "@/lib/course-pricing";
import {ActionForm} from "./action-form";
import {WishlistButton} from "./wishlist-button";
import {LockedDownload} from "./locked-download";
import {CouponField} from "./coupon-field";
import {beginCheckout} from "@/app/checkout/[slug]/actions";
import {rupees} from "@/lib/course-pricing";
import type {Content} from "@/lib/db";
export async function MockAccessCard({item,viewer,wished=false}:{item:Content;viewer:string|null;wished?:boolean}){
 const book=String(item.extra.question_bank),access=Boolean(viewer&&await canDownloadMock(viewer,book));
 const price=Number(item.extra.price_paise)||0;
 const buy=price>0?(viewer?<ActionForm action={beginCheckout} label="Buy now"><input type="hidden" name="slug" value={item.slug}/><input type="hidden" name="kind" value="course"/><CouponField/></ActionForm>:<Link className="button" href={"/account/login/?returnTo="+encodeURIComponent(checkoutHref("course",item.slug))}>Sign in to buy <ArrowRight size={17}/></Link>):<Link className="button" href={purchaseHref(item.slug)}>Start free mock <ArrowRight size={17}/></Link>;
 return <Localized><section className="mock-access-card" aria-label="Test access"><div className="mock-access-price"><strong>{price>0?rupees(price):"Free"}</strong><span>{Number(item.extra.question_count)} questions · Online mock + PDF</span></div>{access?<><span className="purchase-owned"><Check size={15}/> You have access</span><Link className="button" href={`/student/exam/${book}/`}>Open exam room <ArrowRight size={16}/></Link><a className="button secondary" href={`/api/mock-tests/${book}/pdf/`}><Download size={16}/> Download PDF</a></>:<>{buy}<WishlistButton id={item.id} added={wished}/>{price>0?<LockedDownload message="This PDF is locked. Purchase this test to download it."/>:null}</>}<ul>{["Timed practice with saved answers","Review correct answers and explanations","Download the PDF whenever you need it"].map(label=><li key={label}><Check size={16}/>{label}</li>)}</ul>{access?null:<p className="purchase-small"><ShieldCheck size={14}/> Secure payment by Razorpay</p>}</section>
 <div className="mock-buybar" aria-label="Quick buy"><div><strong>{access?"You have access":price>0?rupees(price):"Free"}</strong><span>{Number(item.extra.question_count)} questions</span></div>{access?<Link className="button" href={`/student/exam/${book}/`}>Open exam room</Link>:price>0&&viewer?<ActionForm action={beginCheckout} label="Buy now"><input type="hidden" name="slug" value={item.slug}/><input type="hidden" name="kind" value="course"/></ActionForm>:price>0?<Link className="button" href={"/account/login/?returnTo="+encodeURIComponent(checkoutHref("course",item.slug))}>Sign in to buy</Link>:<Link className="button" href={purchaseHref(item.slug)}>Start free mock</Link>}</div></Localized>;
}
