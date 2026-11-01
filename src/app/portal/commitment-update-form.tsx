"use client";

import { useActionState } from "react";
import { updateMyCommitment } from "@/lib/actions/client";
import type { Commitment } from "@/lib/coaching/types";
import { Label, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/app/submit-button";
import { FormMessage } from "@/components/app/form-message";

export function CommitmentUpdateForm({ commitment }: { commitment: Commitment }) {
  const [state, action] = useActionState(updateMyCommitment, undefined);
  return (
    <form action={action} className="mt-6 space-y-4 border-t border-navy/10 pt-6">
      <input type="hidden" name="commitment_id" value={commitment.id} />
      <h3 className="font-semibold">Update my progress</h3>
      <div>
        <Label htmlFor="status">Where are you with it?</Label>
        <Select id="status" name="status" defaultValue="in_progress">
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="note">A quick note for your coach (optional)</Label>
        <Textarea id="note" name="note" maxLength={1000} className="min-h-20" defaultValue={commitment.client_update ?? ""} placeholder="What did you do? Anything get in the way?" />
        <p className="mt-1 text-xs text-slate-600">Please don&rsquo;t include account numbers or passwords.</p>
      </div>
      <FormMessage state={state} />
      <SubmitButton>Save my update</SubmitButton>
    </form>
  );
}
