"use client";
import {Localized} from "@/components/localized";

import { useActionState } from "react";
export function ActionForm({ action, children, label }: { action: (state: string, data: FormData) => Promise<string>; children: React.ReactNode; label: string }) {
  const [state, submit, pending] = useActionState(action, "");
  return <Localized>{<form action={submit}>{children}{state && <p role="status" className="messages">{state}</p>}<button className="button" disabled={pending}>{pending ? "Please wait…" : label}</button></form>}</Localized>;
}
