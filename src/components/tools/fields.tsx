"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { inputClass, Label } from "@/components/ui/input";

/**
 * Numeric input with optional prefix/suffix. Keeps the raw string so users can
 * clear and retype freely; parent parses with Number().
 */
export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  min,
  max,
  step = "any",
  invalid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: ReactNode;
  min?: number;
  max?: number;
  step?: number | "any";
  invalid?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-invalid={invalid || undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClass, prefix && "pl-8", suffix && "pr-14", "tabular-nums")}
        />
        {suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-600">{suffix}</span>}
      </div>
      {hint && <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-600">{hint}</p>}
    </div>
  );
}

export function ErrorList({ errors }: { errors: string[] }) {
  if (!errors.length) return null;
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="font-semibold">Please check your entries:</p>
      <ul className="mt-1 list-disc pl-5">
        {errors.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}

export function Stat({ label, value, emphasis = false, sub }: { label: string; value: string; emphasis?: boolean; sub?: string }) {
  return (
    <div className={cn("rounded-2xl p-5", emphasis ? "bg-navy text-ivory" : "bg-ivory-200")}>
      <p className={cn("text-sm", emphasis ? "text-ivory/75" : "text-slate-600")}>{label}</p>
      <p className={cn("mt-1 font-display text-3xl font-bold tabular-nums sm:text-4xl", emphasis ? "text-gold" : "text-navy")}>{value}</p>
      {sub && <p className={cn("mt-1 text-xs", emphasis ? "text-ivory/60" : "text-slate-600")}>{sub}</p>}
    </div>
  );
}

export function ToolLayout({ form, results }: { form: ReactNode; results: ReactNode }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="h-fit rounded-[var(--radius-card)] border border-navy/10 bg-white p-6 shadow-soft sm:p-8 lg:sticky lg:top-24">
        {form}
      </div>
      <div aria-live="polite" className="min-w-0">{results}</div>
    </div>
  );
}

export function Assumptions({ items }: { items: ReactNode[] }) {
  return (
    <details className="group rounded-2xl border border-navy/10 bg-white p-5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
        Assumptions and limitations
        <span aria-hidden className="text-xl text-emerald transition-transform group-open:rotate-45">+</span>
      </summary>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </details>
  );
}
