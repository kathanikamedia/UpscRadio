"use client";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
export function AdminMaterialsLink(){const {user}=useUser();if(user?.publicMetadata.role!=="admin")return null;return <aside className="material-draft-banner"><strong>Admin view:</strong> Manage your material previews and private files here. <Link href="/staff/materials/">Review uploaded PDFs ↗</Link> · <Link href="/staff/questions/">Review question banks ↗</Link></aside>;}
