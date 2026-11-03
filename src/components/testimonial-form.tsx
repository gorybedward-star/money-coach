"use client";

import { useId, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { site } from "@/config/site";
import type { LeadPayload } from "@/lib/leads";
import { sendLead } from "@/lib/send-lead";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

type Status = { state: "idle" | "sending" } | { state: "done"; delivered: boolean } | { state: "error"; message: string };

const programs = [
  "7-Week Money Reset",
  "Money Clarity Session",
  "Employee Benefits Checkup",
  "Ongoing Money Coaching",
  "Free call or free tools",
];

/** Collects a client's story and their permission to publish it. Arrives in the founder's inbox. */
export function TestimonialForm() {
  const id = useId();
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const displayName = String(fd.get("displayName") ?? "").trim();
    const story = String(fd.get("story") ?? "").trim();
    const permission = fd.get("permission") === "on";
    const next: Record<string, string> = {};
    if (!displayName) next.displayName = "Please tell us how you'd like your name shown.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = "Please enter a valid email address.";
    if (!story) next.story = "Please share a few words about your experience.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload: LeadPayload = {
      type: "testimonial",
      email,
      name: displayName,
      message: story,
      service: String(fd.get("program") ?? "") || undefined,
      marketingConsent: false,
      context: {
        "Show name as": displayName.slice(0, 100),
        "Permission to publish": permission ? "YES, may be published on the website" : "NO, private feedback only",
      },
      company: String(fd.get("company") ?? ""),
    };

    setStatus({ state: "sending" });
    try {
      const data = await sendLead(payload);
      if (!data.ok) setStatus({ state: "error", message: data.error });
      else setStatus({ state: "done", delivered: data.delivered });
    } catch {
      setStatus({ state: "error", message: `Something went wrong. Please try again or email ${site.contactEmail}.` });
    }
  }

  if (status.state === "done") {
    return (
      <div role="status" className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-6 sm:p-8">
        <CheckCircle2 className="size-8 text-emerald" aria-hidden />
        <p className="mt-4 font-display text-2xl font-bold">Thank you for sharing your story.</p>
        <p className="mt-2 leading-relaxed text-slate-600">
          {status.delivered ? (
            <>It means a lot, and it helps other families take their first step.</>
          ) : (
            <>
              Online delivery isn&rsquo;t connected in this preview, so nothing was sent. Please email your story to{" "}
              <a className="font-semibold text-emerald underline" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-[var(--radius-card)] border border-navy/10 bg-white p-6 shadow-soft sm:p-8">
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-name`}>How should we show your name?</Label>
          <Input
            id={`${id}-name`}
            name="displayName"
            placeholder="e.g. Tanya R."
            maxLength={100}
            aria-invalid={!!errors.displayName || undefined}
            aria-describedby={`${id}-name-hint`}
          />
          <p id={`${id}-name-hint`} className="mt-1.5 text-xs text-slate-600">First name and last initial is common.</p>
          {errors.displayName && <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>}
        </div>
        <div>
          <Label htmlFor={`${id}-email`}>Email <span className="font-normal opacity-70">(never shown)</span></Label>
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email || undefined}
          />
          {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor={`${id}-program`}>What did you work on with Gory?</Label>
        <Select id={`${id}-program`} name="program" defaultValue="">
          <option value="">Choose one (optional)</option>
          {programs.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor={`${id}-story`}>Your story</Label>
        <Textarea
          id={`${id}-story`}
          name="story"
          maxLength={3000}
          rows={6}
          aria-invalid={!!errors.story || undefined}
          aria-describedby={`${id}-story-hint`}
        />
        <p id={`${id}-story-hint`} className="mt-1.5 text-xs leading-relaxed text-slate-600">
          A few sentences is perfect. What was going on before? What changed? How do you feel about money now? Please don&rsquo;t
          include account numbers or other private details.
        </p>
        {errors.story && <p className="mt-1 text-sm text-red-600">{errors.story}</p>}
      </div>

      <label className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
        <input type="checkbox" name="permission" className="mt-1 size-4 shrink-0 accent-emerald" />
        <span>
          Yes, {site.name} may publish my words on its website and materials, with my name shown as I wrote it above. I can ask
          for it to be removed at any time. Leave this unchecked if your feedback is just for Gory.
        </span>
      </label>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status.state === "sending"}>
        {status.state === "sending" ? <Loader2 className="animate-spin" /> : <Send />}
        Share my story
      </Button>

      {status.state === "error" && <p role="alert" className="text-sm text-red-600">{status.message}</p>}
    </form>
  );
}
