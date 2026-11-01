"use client";

import { useActionState, type ReactNode } from "react";
import type { ActionState } from "@/lib/actions/coach";
import { SubmitButton } from "./submit-button";
import { FormMessage } from "./form-message";
import { CopyLink } from "./email-result";
import { cn } from "@/lib/utils";
import type { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

/** A small form wired to a server action, with inline success/error feedback. */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingText,
  className,
  variant,
  size,
  footer,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  children?: ReactNode;
  submitLabel: string;
  pendingText?: string;
  className?: string;
  footer?: ReactNode;
} & VariantProps<typeof buttonVariants>) {
  const [state, formAction] = useActionState(action, undefined);
  const warn = state?.email && state.email.status !== "sent" && state.email.status !== "duplicate";
  return (
    <form action={formAction} className={cn("space-y-4", className)}>
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton variant={variant} size={size ?? "sm"} pendingText={pendingText}>
          {submitLabel}
        </SubmitButton>
        {footer}
      </div>
      <FormMessage state={state} className={warn ? "bg-gold-50 text-navy" : undefined} />
      {state?.link && <CopyLink link={state.link} />}
    </form>
  );
}
