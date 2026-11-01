"use client";

import { useActionState } from "react";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";

export function OnboardForm({ token, email }: { token: string; email: string }) {
  const [state, action] = useActionState(completeOnboarding, undefined);
  return (
    <form action={action} className="mt-8 space-y-5 rounded-[var(--radius-card)] border border-navy/8 bg-white p-6 shadow-soft sm:p-8">
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="email">Your email</Label>
        <Input id="email" type="email" value={email} readOnly autoComplete="username" className="bg-ivory" />
      </div>
      <div>
        <Label htmlFor="password">Create a password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required />
        <p className="mt-1 text-xs text-slate-600">At least 10 characters. A short phrase works well.</p>
      </div>
      <div>
        <Label htmlFor="confirm">Confirm password</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="w-full" pendingText="Setting up…">Create my account</SubmitButton>
    </form>
  );
}
