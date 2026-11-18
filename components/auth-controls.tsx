"use client";

import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function AuthControls({ configured }: { configured: boolean }) {
  if (!configured) {
    return <><Link href="/account/login/">Login</Link><Link href="/account/register/">Sign up</Link></>;
  }

  return <>
    <Show when="signed-out">
      <Link href="/account/login/">Login</Link>
      <Link href="/account/register/">Sign up</Link>
    </Show>
    <Show when="signed-in">
      <Link href="/student/">My learning</Link>
      <UserButton />
    </Show>
  </>;
}
