"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/actions/coach";
import { commitmentStatusLabel, type Commitment } from "@/lib/coaching/types";
import { formatDate } from "@/lib/coaching/time";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/app/form-message";

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

function Buttons({ saveAction, completeAction }: { saveAction: (fd: FormData) => void; completeAction: (fd: FormData) => void }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button type="submit" variant="outline" size="sm" formAction={saveAction} disabled={pending}>
        Save draft
      </Button>
      <Button
        type="submit"
        size="sm"
        formAction={completeAction}
        disabled={pending}
        onClick={(e) => {
          if (!confirm("Approve this One Money Move, mark the session completed, and email the client?")) e.preventDefault();
        }}
      >
        {pending ? "Working…" : "Approve and complete session"}
      </Button>
    </div>
  );
}

export function CommitmentForm({
  clientId,
  week,
  firstName,
  defaultObjective,
  commitment,
  completed,
  save,
  complete,
}: {
  clientId: string;
  week: number;
  firstName: string;
  defaultObjective: string;
  commitment: Commitment | null;
  completed: boolean;
  save: Action;
  complete: Action;
}) {
  const [saveState, saveAction] = useActionState(save, undefined);
  const [completeState, completeAction] = useActionState(complete, undefined);
  const state = completeState ?? saveState;
  const emailWarn = completeState?.email && !["sent", "duplicate"].includes(completeState.email.status);

  if (completed && commitment?.approved_at) {
    return (
      <div className="space-y-4">
        {completeState && <FormMessage state={completeState} className={emailWarn ? "bg-gold-50 text-navy" : undefined} />}
        <dl className="space-y-3 text-sm">
          <Row label="This week's priority" value={commitment.objective} />
          <Row label="My commitment" value={commitment.action} strong />
          <Row label="Deadline" value={formatDate(commitment.deadline)} />
          <Row label="How we'll measure success" value={commitment.success_criteria} />
          {commitment.session_summary && <Row label="Session summary (emailed)" value={commitment.session_summary} />}
          <Row label="Status" value={commitmentStatusLabel[commitment.status]} />
        </dl>
      </div>
    );
  }

  return (
    <form className="space-y-4">
      <input type="hidden" name="client_id" value={clientId} />
      <input type="hidden" name="week" value={week} />
      <p className="text-sm text-slate-600">
        One action. One deadline. One measurable result. {firstName} sees this card in the portal once you approve it.
      </p>
      <div>
        <Label htmlFor="objective">This week&rsquo;s priority</Label>
        <Input id="objective" name="objective" maxLength={500} defaultValue={commitment?.objective || defaultObjective} placeholder="e.g. Start building my $1,000 emergency fund." />
      </div>
      <div>
        <Label htmlFor="action">My commitment</Label>
        <Textarea id="action" name="action" maxLength={500} className="min-h-20" defaultValue={commitment?.action ?? ""} placeholder="e.g. I will transfer $25 into a dedicated savings account by Friday." />
      </div>
      <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Label htmlFor="deadline">Deadline</Label>
          <Input id="deadline" name="deadline" type="date" defaultValue={commitment?.deadline ?? ""} />
        </div>
        <div>
          <Label htmlFor="success_criteria">How we&rsquo;ll measure success</Label>
          <Input id="success_criteria" name="success_criteria" maxLength={500} defaultValue={commitment?.success_criteria ?? ""} placeholder="e.g. The transfer is completed and my savings balance is updated." />
        </div>
      </div>
      <div>
        <Label htmlFor="session_summary">Session summary for the email (optional)</Label>
        <Textarea
          id="session_summary"
          name="session_summary"
          maxLength={1000}
          className="min-h-20"
          defaultValue={commitment?.session_summary ?? ""}
          placeholder="One or two encouraging sentences. No dollar amounts or account details."
        />
        <p className="mt-1 text-xs text-slate-600">This goes in the post-session email. Keep confidential details out of it.</p>
      </div>
      <FormMessage state={state} className={emailWarn ? "bg-gold-50 text-navy" : undefined} />
      <Buttons saveAction={saveAction} completeAction={completeAction} />
    </form>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-600">{label}</dt>
      <dd className={strong ? "mt-0.5 text-base font-semibold" : "mt-0.5"}>{value}</dd>
    </div>
  );
}
