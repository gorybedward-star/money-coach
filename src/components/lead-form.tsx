"use client";

import { useId, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { site } from "@/config/site";
import type { LeadPayload, LeadType } from "@/lib/leads";
import { sendLead } from "@/lib/send-lead";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Status = { state: "idle" | "sending" } | { state: "done"; delivered: boolean } | { state: "error"; message: string };

export function LeadForm({
  type,
  context,
  title,
  description,
  submitLabel = "Send it to me",
  showName = true,
  showMessage = false,
  services,
  defaultService,
  className,
  tone = "light",
  onSuccess,
}: {
  type: LeadType;
  context?: LeadPayload["context"];
  title?: string;
  description?: string;
  submitLabel?: string;
  showName?: boolean;
  showMessage?: boolean;
  services?: { value: string; label: string }[];
  defaultService?: string;
  className?: string;
  tone?: "light" | "dark";
  /** Called after a successful submit, for example to unlock gated content. */
  onSuccess?: (delivered: boolean) => void;
}) {
  const id = useId();
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dark = tone === "dark";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = "Please enter a valid email address.";
    if (showMessage && !message) next.message = "Please include a short message.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload: LeadPayload = {
      type,
      email,
      name: String(fd.get("name") ?? "").trim() || undefined,
      message: message || undefined,
      service: String(fd.get("service") ?? "") || undefined,
      marketingConsent: fd.get("consent") === "on",
      context,
      company: String(fd.get("company") ?? ""),
    };

    setStatus({ state: "sending" });
    try {
      const data = await sendLead(payload);
      if (!data.ok) setStatus({ state: "error", message: data.error });
      else {
        setStatus({ state: "done", delivered: data.delivered });
        onSuccess?.(data.delivered);
      }
    } catch {
      setStatus({ state: "error", message: `Something went wrong. Please try again or email ${site.contactEmail}.` });
    }
  }

  if (status.state === "done") {
    return (
      <div role="status" className={cn("rounded-[var(--radius-card)] p-6 sm:p-8", dark ? "bg-white/5 text-ivory" : "border border-navy/10 bg-white", className)}>
        <CheckCircle2 className="size-8 text-emerald" aria-hidden />
        {status.delivered ? (
          <>
            <p className="mt-4 font-display text-2xl font-bold">Thank you. We&rsquo;ve got it.</p>
            <p className={cn("mt-2 leading-relaxed", dark ? "text-ivory/80" : "text-slate-600")}>
              We received your request and will follow up by email. If you don&rsquo;t hear back within two business days,
              please check your spam folder or write to {site.contactEmail}.
            </p>
          </>
        ) : (
          <>
            <p className="mt-4 font-display text-2xl font-bold">Thanks for your interest.</p>
            <p className={cn("mt-2 leading-relaxed", dark ? "text-ivory/80" : "text-slate-600")}>
              Online delivery isn&rsquo;t connected yet while we prepare for launch, so this form didn&rsquo;t send anything.
              Please email{" "}
              <a className="font-semibold text-emerald underline" href={`mailto:${site.contactEmail}`}>
                {site.contactEmail}
              </a>{" "}
              and we&rsquo;ll get back to you personally.
            </p>
          </>
        )}
      </div>
    );
  }

  const labelCls = dark ? "text-ivory" : undefined;
  return (
    <form onSubmit={onSubmit} noValidate className={cn("space-y-4", className)}>
      {title && <p className={cn("font-display text-2xl font-bold", dark ? "text-ivory" : "text-navy")}>{title}</p>}
      {description && <p className={cn("text-sm leading-relaxed", dark ? "text-ivory/75" : "text-slate-600")}>{description}</p>}

      {/* Honeypot (hidden from people and assistive tech) */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className={cn("grid gap-4", showName && "sm:grid-cols-2")}>
        {showName && (
          <div>
            <Label htmlFor={`${id}-name`} className={labelCls}>First name <span className="font-normal opacity-70">(optional)</span></Label>
            <Input id={`${id}-name`} name="name" autoComplete="given-name" maxLength={100} />
          </div>
        )}
        <div>
          <Label htmlFor={`${id}-email`} className={labelCls}>Email</Label>
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={!!errors.email || undefined}
            aria-describedby={errors.email ? `${id}-email-err` : undefined}
          />
          {errors.email && <p id={`${id}-email-err`} className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
        </div>
      </div>

      {services && (
        <div>
          <Label htmlFor={`${id}-service`} className={labelCls}>I&rsquo;m interested in</Label>
          <Select id={`${id}-service`} name="service" defaultValue={defaultService ?? ""}>
            <option value="">Just have a question</option>
            {services.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </div>
      )}

      {showMessage && (
        <div>
          <Label htmlFor={`${id}-message`} className={labelCls}>Message</Label>
          <Textarea
            id={`${id}-message`}
            name="message"
            maxLength={3000}
            aria-invalid={!!errors.message || undefined}
            aria-describedby={`${id}-message-hint`}
          />
          <p id={`${id}-message-hint`} className={cn("mt-1.5 text-xs", dark ? "text-ivory/60" : "text-slate-600")}>
            Please don&rsquo;t include account numbers, Social Security numbers, passwords, or medical details.
          </p>
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
        </div>
      )}

      <label className={cn("flex items-start gap-3 text-sm leading-relaxed", dark ? "text-ivory/80" : "text-slate-600")}>
        <input type="checkbox" name="consent" className="mt-1 size-4 shrink-0 accent-emerald" />
        <span>
          Yes, also send me occasional MONEY COACH emails with tips and offers. Optional. Unsubscribe anytime.
        </span>
      </label>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status.state === "sending"}>
        {status.state === "sending" ? <Loader2 className="animate-spin" /> : <Mail />}
        {submitLabel}
      </Button>

      {status.state === "error" && (
        <p role="alert" className="text-sm text-red-600">{status.message}</p>
      )}

      <p className={cn("text-xs leading-relaxed", dark ? "text-ivory/60" : "text-slate-600")}>
        We use your email only to respond to this request
        {" "}unless you check the box above. See our{" "}
        <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>.
      </p>
    </form>
  );
}
