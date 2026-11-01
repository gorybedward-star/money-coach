"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { submitIntake } from "@/lib/actions/client";
import type { Intake } from "@/lib/coaching/types";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-[var(--radius-card)] border border-navy/8 bg-white p-6 shadow-soft sm:p-8">
      <legend className="sr-only">{title}</legend>
      <h2 className="text-xl font-bold">{title}</h2>
      {hint && <p className="mt-1 text-sm text-slate-600">{hint}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </fieldset>
  );
}

function Money({ name, label, value, hint }: { name: string; label: string; value?: number | null; hint?: string }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" aria-hidden>$</span>
        <Input id={name} name={name} inputMode="decimal" className="pl-8" defaultValue={value ?? ""} placeholder="Approximate" />
      </div>
      {hint && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
    </div>
  );
}

export function IntakeForm({ intake, client }: { intake: Intake | null; client: { phone: string | null; preferred_contact: string } }) {
  const [state, action] = useActionState(submitIntake, undefined);
  const v = intake;
  return (
    <form action={action} className="mt-8 space-y-6">
      <aside className="flex gap-3 rounded-2xl border border-emerald/30 bg-emerald-50 p-4 text-sm leading-relaxed">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald" aria-hidden />
        <p>
          <strong>Never share sensitive details here.</strong> We will never ask for your Social Security number, bank or
          retirement account numbers, or any passwords. Round numbers are all we need.
        </p>
      </aside>

      <Section title="Contact">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={v?.phone ?? client.phone ?? ""} />
          </div>
          <div>
            <Label htmlFor="preferred_contact">Best way to reach you</Label>
            <Select id="preferred_contact" name="preferred_contact" defaultValue={v?.preferred_contact ?? client.preferred_contact}>
              <option value="email">Email</option>
              <option value="phone">Phone call</option>
              <option value="text">Text message</option>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="best_time">Best days or times to reach you (optional)</Label>
          <Input id="best_time" name="best_time" defaultValue={v?.best_time ?? ""} placeholder="e.g. weekday evenings" />
        </div>
      </Section>

      <Section title="Your goals" hint="What would make the next seven weeks worth it?">
        <div>
          <Label htmlFor="primary_goals">Your top financial goals</Label>
          <Textarea id="primary_goals" name="primary_goals" required maxLength={2000} defaultValue={v?.primary_goals ?? ""} placeholder="e.g. Stop living paycheck to paycheck, pay off my credit card, start saving for retirement" />
        </div>
        <div>
          <Label htmlFor="concerns">What worries you most about money right now? (optional)</Label>
          <Textarea id="concerns" name="concerns" maxLength={2000} defaultValue={v?.concerns ?? ""} />
        </div>
      </Section>

      <Section title="Your money story" hint="How you grew up with money shapes how you handle it today. Share as much or as little as you like.">
        <div>
          <Label htmlFor="money_story">How was money handled in your home growing up? (optional)</Label>
          <Textarea id="money_story" name="money_story" maxLength={2000} defaultValue={v?.money_story ?? ""} />
        </div>
        <div>
          <Label htmlFor="habit_to_change">One money habit you&rsquo;d like to change (optional)</Label>
          <Input id="habit_to_change" name="habit_to_change" maxLength={1000} defaultValue={v?.habit_to_change ?? ""} placeholder="e.g. Takeout when I'm tired, impulse online shopping" />
        </div>
      </Section>

      <Section title="Your numbers, roughly" hint="Estimates are fine. Leave anything blank you're not sure about; we'll work it out together.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Money name="monthly_income" label="Monthly take-home income" value={v?.monthly_income} hint="After taxes, all earners in the household" />
          <Money name="monthly_expenses" label="Monthly spending" value={v?.monthly_expenses} hint="Your best guess is fine" />
          <Money name="emergency_savings" label="Emergency savings today" value={v?.emergency_savings} />
          <Money name="consumer_debt" label="Total consumer debt" value={v?.consumer_debt} hint="Credit cards, car loans, personal loans, student loans. Not your mortgage" />
        </div>
        <div>
          <Label htmlFor="debt_notes">Anything to know about your debts? (optional)</Label>
          <Textarea id="debt_notes" name="debt_notes" maxLength={2000} className="min-h-20" defaultValue={v?.debt_notes ?? ""} placeholder="e.g. Two credit cards around 24% interest, car loan ends next year" />
        </div>
      </Section>

      <Section title="Retirement and work benefits">
        <div>
          <Label htmlFor="retirement_overview">What retirement savings do you have? (optional)</Label>
          <Textarea id="retirement_overview" name="retirement_overview" maxLength={2000} className="min-h-20" defaultValue={v?.retirement_overview ?? ""} placeholder="e.g. 401(k) at work, TSP, old IRA, nothing yet" />
        </div>
        <div className="max-w-xs">
          <Label htmlFor="retirement_contribution_pct">Percent of pay you contribute (if you know)</Label>
          <div className="relative">
            <Input id="retirement_contribution_pct" name="retirement_contribution_pct" inputMode="decimal" className="pr-9" defaultValue={v?.retirement_contribution_pct ?? ""} />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" aria-hidden>%</span>
          </div>
        </div>
        <div>
          <Label htmlFor="employee_benefits">Benefits available through work (optional)</Label>
          <Textarea id="employee_benefits" name="employee_benefits" maxLength={2000} className="min-h-20" defaultValue={v?.employee_benefits ?? ""} placeholder="e.g. employer match, HSA, life insurance, FERS, pension, tuition help" />
        </div>
        <div>
          <Label htmlFor="insurance_coverage">Insurance protection you have today (optional)</Label>
          <Textarea id="insurance_coverage" name="insurance_coverage" maxLength={2000} className="min-h-20" defaultValue={v?.insurance_coverage ?? ""} placeholder="e.g. life insurance through work (1x salary), no disability coverage, health plan through spouse, not sure who my beneficiaries are" />
          <p className="mt-1 text-xs text-slate-600">Rough answers are fine. Please don&rsquo;t include policy numbers.</p>
        </div>
      </Section>

      <Section title="Privacy and consent">
        <div className="space-y-3 text-sm leading-relaxed text-slate-600">
          <p>
            Your answers are stored securely and seen only by your coach. They are used only to provide your coaching and are
            never sold or shared. We don&rsquo;t put detailed financial information in emails. You can ask us to correct or delete
            your information at any time. See our <Link href="/privacy" className="text-emerald underline">Privacy Policy</Link>.
          </p>
          <p>
            Money Coach provides financial education and coaching. It is not investment, tax, or legal advice, and we&rsquo;ll tell
            you when a licensed professional would be the right person to ask.
          </p>
        </div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="consent_privacy" required defaultChecked={!!v} className="mt-1 size-4 accent-[var(--color-emerald)]" />
          <span>I&rsquo;ve read the privacy notice and agree that Money Coach may store this information to coach me.</span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="consent_coaching_comms" required defaultChecked={!!v} className="mt-1 size-4 accent-[var(--color-emerald)]" />
          <span>I agree to receive coaching emails about my sessions, commitments, and reminders. I can opt out anytime by telling my coach.</span>
        </label>
      </Section>

      <FormMessage state={state} />
      <SubmitButton size="lg" className="w-full sm:w-auto" pendingText="Saving…">
        {v ? "Save changes" : "Submit my intake"}
      </SubmitButton>
    </form>
  );
}
