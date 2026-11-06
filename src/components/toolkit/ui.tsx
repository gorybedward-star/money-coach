"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

/* Toolkit palette (kept in one place so charts and UI match). */
export const C = {
  navy: "#0b1f3a",
  navy2: "#1d3a63",
  steel: "#5b7aa6",
  mist: "#c9d5e4",
  green: "#167d68",
  greenSoft: "#8cc7b5",
  gold: "#b8954a",
  red: "#b4483c",
  grid: "#e6ebf2",
  ink: "#0b1f3a",
  muted: "#5f6f86",
};

export const usd = (n: number, cents = false) =>
  (Number.isFinite(n) ? n : 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: cents ? 2 : 0, minimumFractionDigits: cents ? 2 : 0 });
export const usdCompact = (n: number) => {
  const a = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (a >= 1_000_000) return `${sign}$${(a / 1_000_000).toFixed(a >= 10_000_000 ? 0 : 1)}M`;
  if (a >= 1_000) return `${sign}$${(a / 1_000).toFixed(a >= 100_000 ? 0 : 1)}K`;
  return `${sign}$${Math.round(a)}`;
};
export const pct = (n: number, digits = 0) => `${(n * 100).toFixed(digits)}%`;
export const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${usd(Math.abs(n))}`;

export function Card({ title, eyebrow, action, children, className, pad = true }: { title?: ReactNode; eyebrow?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={cn("rounded-2xl border border-[#e3e8ef] bg-white shadow-[0_1px_2px_rgba(11,31,58,0.04),0_8px_24px_-16px_rgba(11,31,58,0.18)]", pad && "p-5 sm:p-6", className)}>
      {(title || eyebrow || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {title && <h2 className="mt-1 font-display text-lg font-semibold leading-snug text-[#0b1f3a]">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f6f86]", className)}>{children}</p>;
}

export function Stat({ label, value, sub, tone, big }: { label: ReactNode; value: ReactNode; sub?: ReactNode; tone?: "good" | "bad" | "muted"; big?: boolean }) {
  return (
    <div className="min-w-0">
      <Eyebrow>{label}</Eyebrow>
      <p
        className={cn(
          "mt-1.5 font-semibold tabular-nums tracking-tight text-[#0b1f3a]",
          big ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl",
          tone === "good" && "text-[#167d68]",
          tone === "bad" && "text-[#b4483c]",
          tone === "muted" && "text-[#5f6f86]",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs leading-relaxed text-[#5f6f86]">{sub}</p>}
    </div>
  );
}

export function PageHeader({ n, title, intro, children }: { n?: number; title: string; intro: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {n !== undefined && <Eyebrow className="text-[#167d68]">Module {n}</Eyebrow>}
        <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-[#0b1f3a] sm:text-[2.5rem]">{title}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[#5f6f86]">{intro}</p>
      </div>
      {children}
    </header>
  );
}

const fieldBase =
  "h-11 w-full rounded-xl border border-[#d5dde8] bg-white px-3.5 text-[15px] text-[#0b1f3a] tabular-nums outline-none transition placeholder:text-[#9aa7b8] focus:border-[#167d68] focus:ring-4 focus:ring-[#167d68]/12 aria-[invalid=true]:border-[#b4483c]";

export function FieldLabel({ htmlFor, children, hint }: { htmlFor: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-[#0b1f3a]">
      {children}
      {hint && <span className="mt-0.5 block text-xs font-normal leading-snug text-[#5f6f86]">{hint}</span>}
    </label>
  );
}

/**
 * Numeric input that keeps its own text while typing (so "1," or "" never fights the user) and reports a clean number.
 * Negative values are rejected unless `allowNegative`.
 */
export function NumField({
  label,
  value,
  onChange,
  hint,
  prefix = "$",
  suffix,
  min = 0,
  max,
  step,
  error,
  compact,
  ariaLabel,
}: {
  label?: ReactNode;
  value: number;
  onChange: (n: number) => void;
  hint?: ReactNode;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  error?: string | null;
  compact?: boolean;
  ariaLabel?: string;
}) {
  const id = useId();
  const [text, setText] = useState(value ? String(value) : "");
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setText(value ? String(value) : "");
  }, [value]);
  const parsed = Number(text.replace(/[$,\s%]/g, ""));
  const localError = text.trim() !== "" && (!Number.isFinite(parsed) ? "Enter a number." : parsed < min ? `Must be ${min} or more.` : max !== undefined && parsed > max ? `Must be ${max} or less.` : null);
  const err = localError || error;
  return (
    <div className="min-w-0">
      {label && <FieldLabel htmlFor={id} hint={hint}>{label}</FieldLabel>}
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-[#5f6f86]">{prefix}</span>}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          aria-label={ariaLabel}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `${id}-err` : undefined}
          className={cn(fieldBase, prefix && "pl-7", suffix && "pr-12", compact && "h-10 text-sm")}
          value={text}
          placeholder="0"
          step={step}
          onFocus={() => (focused.current = true)}
          onBlur={() => {
            focused.current = false;
            setText(value ? String(value) : "");
          }}
          onChange={(e) => {
            const t = e.target.value;
            setText(t);
            const n = Number(t.replace(/[$,\s%]/g, ""));
            if (t.trim() === "") onChange(0);
            else if (Number.isFinite(n) && n >= min && (max === undefined || n <= max)) onChange(n);
          }}
        />
        {suffix && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#5f6f86]">{suffix}</span>}
      </div>
      {err && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-[#b4483c]">
          {err}
        </p>
      )}
    </div>
  );
}

export function TextField({ label, value, onChange, placeholder, hint, ariaLabel, compact, type = "text" }: { label?: ReactNode; value: string; onChange: (v: string) => void; placeholder?: string; hint?: ReactNode; ariaLabel?: string; compact?: boolean; type?: string }) {
  const id = useId();
  return (
    <div className="min-w-0">
      {label && <FieldLabel htmlFor={id} hint={hint}>{label}</FieldLabel>}
      <input id={id} type={type} aria-label={ariaLabel} className={cn(fieldBase, compact && "h-10 text-sm")} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} maxLength={140} />
    </div>
  );
}

export function SelectField<T extends string>({ label, value, onChange, options, ariaLabel, compact }: { label?: ReactNode; value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; ariaLabel?: string; compact?: boolean }) {
  const id = useId();
  return (
    <div className="min-w-0">
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <select id={id} aria-label={ariaLabel} className={cn(fieldBase, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%235f6f86%22 stroke-width=%222.5%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[right_0.9rem_center] bg-no-repeat pr-9", compact && "h-10 text-sm")} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-full rounded-xl border border-[#d5dde8] bg-[#f4f6f9] p-1 sm:w-auto">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("flex-1 rounded-lg px-3.5 py-2 text-sm font-medium text-[#5f6f86] transition sm:flex-none", value === o.value && "bg-white text-[#0b1f3a] shadow-[0_1px_3px_rgba(11,31,58,0.12)]")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Progress({ value, tone = "green", label, className }: { value: number; tone?: "green" | "navy" | "gold"; label: string; className?: string }) {
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)} className={cn("h-2 w-full overflow-hidden rounded-full bg-[#e6ebf2]", className)}>
      <div className={cn("h-full rounded-full transition-[width] duration-500", tone === "green" && "bg-[#167d68]", tone === "navy" && "bg-[#0b1f3a]", tone === "gold" && "bg-[#b8954a]")} style={{ width: `${v * 100}%` }} />
    </div>
  );
}

export function Ring({ value, size = 96, stroke = 9, children, label }: { value: number; size?: number; stroke?: number; children?: ReactNode; label: string }) {
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${Math.round(v * 100)}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-white/15" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.greenSoft} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: "stroke-dashoffset .6s" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Tip({ title = "Money Coach tip", children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="flex gap-3 rounded-2xl border border-[#167d68]/20 bg-[#eef6f3] p-4 text-sm leading-relaxed text-[#0b1f3a]">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-[#167d68]" aria-hidden />
      <div>
        <p className="font-semibold">{title}</p>
        <div className="mt-1 text-[#33475f]">{children}</div>
      </div>
    </aside>
  );
}

export function Learn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group rounded-xl border border-[#e3e8ef] bg-white px-4 py-3 text-sm leading-relaxed open:pb-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-[#0b1f3a] marker:hidden">
        {title}
        <span aria-hidden className="text-lg leading-none text-[#5f6f86] transition group-open:rotate-45">+</span>
      </summary>
      <div className="mt-2 space-y-2 text-[#33475f]">{children}</div>
    </details>
  );
}

export function Btn({ children, onClick, variant = "primary", className, type = "button", disabled, ariaLabel }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" | "danger"; className?: string; type?: "button" | "submit"; disabled?: boolean; ariaLabel?: string }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-[#0b1f3a] text-white hover:bg-[#1d3a63]",
        variant === "secondary" && "border border-[#d5dde8] bg-white text-[#0b1f3a] hover:border-[#0b1f3a]/40",
        variant === "ghost" && "text-[#167d68] hover:bg-[#eef6f3]",
        variant === "danger" && "border border-[#b4483c]/30 bg-white text-[#b4483c] hover:bg-[#b4483c]/5",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Legend({ items }: { items: { color: string; label: ReactNode; value?: ReactNode }[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((i, k) => (
        <li key={k} className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2 text-[#33475f]">
            <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ background: i.color }} />
            <span className="truncate">{i.label}</span>
          </span>
          {i.value !== undefined && <span className="shrink-0 font-medium tabular-nums text-[#0b1f3a]">{i.value}</span>}
        </li>
      ))}
    </ul>
  );
}

/** Recharts tooltip styled to match. */
export function ChartTooltip({ active, payload, label, labelFormat, valueFormat = usd }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string | number; labelFormat?: (l: string | number) => string; valueFormat?: (n: number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#e3e8ef] bg-white px-3 py-2 text-xs shadow-lg">
      {label !== undefined && <p className="mb-1 font-semibold text-[#0b1f3a]">{labelFormat ? labelFormat(label) : label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 tabular-nums text-[#33475f]">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-medium text-[#0b1f3a]">{valueFormat(Number(p.value ?? 0))}</span>
        </p>
      ))}
    </div>
  );
}

/** Marks a number that flows in from (or out to) another module. */
export function SyncBadge({ from, href, children }: { from?: string; href?: string; children?: ReactNode }) {
  const body = (
    <>
      <svg aria-hidden viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" /><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" /><path d="M21 3v5h-5" /><path d="M3 21v-5h5" /></svg>
      {children ?? <>Synced{from ? <> from {from}</> : null}</>}
    </>
  );
  const cls = "inline-flex items-center gap-1 rounded-full bg-[#eef6f3] px-2 py-0.5 text-[11px] font-medium text-[#167d68]";
  return href ? <a href={href} className={cn(cls, "hover:bg-[#dcefe8]")}>{body}</a> : <span className={cls}>{body}</span>;
}

/** A checkbox that turns a sync link on or off. */
export function SyncToggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="mt-2 flex items-center gap-2 text-xs text-[#33475f]">
      <input type="checkbox" className="size-4 accent-[#167d68]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {children}
    </label>
  );
}
