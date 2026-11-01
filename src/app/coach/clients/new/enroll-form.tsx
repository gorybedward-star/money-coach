"use client";

import Link from "next/link";
import { useActionState } from "react";
import { enrollClient } from "@/lib/actions/coach";
import { Input, Label } from "@/components/ui/input";
import { ButtonLink, buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";
import { CopyLink } from "@/components/app/email-result";

export function EnrollForm({ timeZone }: { timeZone: string }) {
  const [state, action] = useActionState(enrollClient, undefined);

  if (state?.ok && state.clientId) {
    return (
      <div className="rounded-[var(--radius-card)] border border-navy/8 bg-white p-6 shadow-soft sm:p-8">
        <FormMessage state={{ message: state.message }} className={state.email?.status === "sent" ? "" : "bg-gold-50 text-navy"} />
        {state.link && <CopyLink link={state.link} />}
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href={`/coach/clients/${state.clientId}`}>Open client profile</ButtonLink>
          <button type="button" onClick={() => window.location.assign("/coach/clients/new")} className={buttonVariants({ variant: "outline" })}>Enroll another</button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5 rounded-[var(--radius-card)] border border-navy/8 bg-white p-6 shadow-soft sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="first_name">First name</Label>
          <Input id="first_name" name="first_name" required maxLength={80} autoComplete="off" />
        </div>
        <div>
          <Label htmlFor="last_name">Last name</Label>
          <Input id="last_name" name="last_name" maxLength={80} autoComplete="off" />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="off" />
      </div>
      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" name="phone" type="tel" autoComplete="off" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="first_session">First session (optional)</Label>
          <Input id="first_session" name="first_session" type="datetime-local" />
          <p className="mt-1 text-xs text-slate-600">Your time zone: {timeZone.replace("_", " ")}</p>
        </div>
        <div>
          <Label htmlFor="meeting_details">Where we&rsquo;ll meet (optional)</Label>
          <Input id="meeting_details" name="meeting_details" maxLength={500} placeholder="Zoom link or phone" />
        </div>
      </div>
      <FormMessage state={state} />
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pendingText="Enrolling…">Enroll and send welcome email</SubmitButton>
        <Link href="/coach" className="text-sm text-slate-600 underline underline-offset-2">Cancel</Link>
      </div>
    </form>
  );
}
