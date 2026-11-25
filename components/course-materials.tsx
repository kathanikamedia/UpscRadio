import Link from "next/link";
import {publishedCourseMaterials} from "@/lib/public-catalogue";
export async function CourseMaterials({slug}:{slug:string}){const rows=await publishedCourseMaterials(slug);return <section className="course-outcomes"><h2>Study materials included</h2>{rows.length?<ul>{rows.map(row=><li key={String(row.slug)}><Link href={`/resources/${row.slug}/`}>{String(row.title)}</Link><small> · {row.language} · PDF</small></li>)}</ul>:<p>Course materials will appear here when added by the team.</p>}</section>;}
