"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/lib/actions/auth";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(requestPasswordReset, undefined);
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <Link href="/login" className="text-sm text-emerald underline underline-offset-2">← Back to sign in</Link>
      <h1 className="mt-4 text-3xl font-bold">Reset your password</h1>
      <p className="mt-2 text-slate-600">Enter the email you use for Money Coach and we&rsquo;ll send you a reset link.</p>
      <form action={action} className="mt-8 space-y-5 rounded-[var(--radius-card)] border border-navy/8 bg-white p-6 shadow-soft sm:p-8">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <FormMessage state={state} />
        <SubmitButton className="w-full" pendingText="Sending…">Send reset link</SubmitButton>
      </form>
    </div>
  );
}
