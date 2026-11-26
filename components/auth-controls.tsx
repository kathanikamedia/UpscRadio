"use client";
import {Localized} from "@/components/localized";


import { Show, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { SiteText } from "./site-language";
function AdminLink(){const {user}=useUser();return <Localized>{user?.publicMetadata.role==="admin"?<Link className="account-pill" href="/staff/">Admin</Link>:null}</Localized>;}

export function AuthControls({ configured }: { configured: boolean }) {
  if (!configured) {
    return <Localized>{<><Link className="account-pill" href="/account/login/"><SiteText>Login</SiteText></Link></>}</Localized>;
  }

  return <Localized>{<>
    <Show when="signed-out">
      <Link className="account-pill" href="/account/login/"><SiteText>Login</SiteText></Link>

    </Show>
    <Show when="signed-in">
      <AdminLink/>
      <Link className="account-pill is-primary" href="/student/" prefetch={true}><SiteText>My learning</SiteText></Link>
      <UserButton appearance={{elements:{avatarBox:{width:"36px",height:"36px"}}}}/>
    </Show>
  </>}</Localized>;
}
