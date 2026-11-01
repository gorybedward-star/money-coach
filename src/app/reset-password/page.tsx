"use client";

import { useActionState } from "react";
import { updatePassword } from "@/lib/actions/auth";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";

export default function ResetPasswordPage() {
  const [state, action] = useActionState(updatePassword, undefined);
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <h1 className="text-3xl font-bold">Choose a new password</h1>
      <form action={action} className="mt-8 space-y-5 rounded-[var(--radius-card)] border border-navy/8 bg-white p-6 shadow-soft sm:p-8">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required />
          <p className="mt-1 text-xs text-slate-600">At least 10 characters.</p>
        </div>
        <div>
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required />
        </div>
        <FormMessage state={state} />
        <SubmitButton className="w-full">Save password</SubmitButton>
      </form>
    </div>
  );
}
