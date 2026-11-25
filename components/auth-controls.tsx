"use client";

import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { SiteText } from "./site-language";

export function AuthControls({ configured }: { configured: boolean }) {
  if (!configured) {
    return <><Link href="/account/login/"><SiteText>Login</SiteText></Link></>;
  }

  return <>
    <Show when="signed-out">
      <Link href="/account/login/"><SiteText>Login</SiteText></Link>

    </Show>
    <Show when="signed-in">
      <Link href="/student/"><SiteText>My learning</SiteText></Link>
      <UserButton />
    </Show>
  </>;
}
