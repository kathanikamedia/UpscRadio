"use client";
import {Localized} from "@/components/localized";


import { Show, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { SiteText } from "./site-language";
function AdminLink(){const {user}=useUser();return <Localized>{user?.publicMetadata.role==="admin"?<Link href="/staff/">Admin</Link>:null}</Localized>;}

export function AuthControls({ configured }: { configured: boolean }) {
  if (!configured) {
    return <Localized>{<><Link href="/account/login/"><SiteText>Login</SiteText></Link></>}</Localized>;
  }

  return <Localized>{<>
    <Show when="signed-out">
      <Link href="/account/login/"><SiteText>Login</SiteText></Link>

    </Show>
    <Show when="signed-in">
      <AdminLink/>
      <Link href="/student/"><SiteText>My learning</SiteText></Link>
      <UserButton />
    </Show>
  </>}</Localized>;
}
