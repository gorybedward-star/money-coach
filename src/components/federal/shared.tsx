import Link from "next/link";
import { ArrowLeft, BookOpen, ExternalLink, Landmark, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { independenceStatement, lastReviewed, type Source } from "@/config/federal-rules";
import { cn } from "@/lib/utils";

export const FED_HOME = "/federal-employees";

/** Required on every Wealth Center page: no government affiliation. */
export function IndependenceNotice({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <aside
      aria-label="Independence statement"
      className={cn(
        "flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed",
        dark ? "border-ivory/20 bg-white/5 text-ivory/80" : "border-navy/10 bg-white/70 text-slate-600",
        className,
      )}
    >
      <ShieldCheck className={cn("mt-0.5 size-4 shrink-0", dark ? "text-gold" : "text-emerald")} aria-hidden />
      <p>
        <strong className={dark ? "text-ivory" : "text-navy"}>Independent education. </strong>
        {independenceStatement} Nothing here is investment, tax, or legal advice, and MONEY COACH is not a registered
        investment adviser.{" "}
        <Link href="/disclaimer" className={cn("font-medium underline underline-offset-2", dark ? "text-gold" : "text-emerald")}>
          Disclaimer
        </Link>
      </p>
    </aside>
  );
}

export function FedPageHeader({
  title,
  intro,
  back = { href: FED_HOME, label: "Federal Employee Wealth Center" },
  related,
  eyebrow = "Federal Employee Wealth Center",
}: {
  title: string;
  intro: string;
  back?: { href: string; label: string };
  related?: { href: string; label: string };
  eyebrow?: string;
}) {
  return (
    <section className="border-b border-navy/8 bg-ivory-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Link href={back.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> {back.label}
        </Link>
        <p className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
          <Landmark className="size-4" aria-hidden /> {eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">{intro}</p>
        {related && (
          <Link href={related.href} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-navy hover:text-emerald">
            <BookOpen className="size-4" aria-hidden /> {related.label}
          </Link>
        )}
      </div>
    </section>
  );
}

export function SourceList({ sources, title = "Official sources", className }: { sources: Source[]; title?: string; className?: string }) {
  if (!sources.length) return null;
  return (
    <div className={cn("rounded-2xl border border-navy/10 bg-white p-5", className)}>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {sources.map((s) => (
          <li key={s.href + s.label}>
            <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-emerald underline-offset-2 hover:underline">
              {s.label} <ExternalLink className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-600">Rules last reviewed {formatReviewed(lastReviewed)}. Always confirm current rules with the official source.</p>
    </div>
  );
}

function formatReviewed(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function NoSensitiveInfo({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-slate-600", className)}>
      We never ask for TSP account numbers or passwords, Social Security numbers, account statements, or federal
      personnel records. Calculator entries stay in your browser.
    </p>
  );
}

export function Callout({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "caution" }) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 text-[0.95rem] leading-relaxed",
        tone === "caution" ? "border border-gold/50 bg-gold-50" : "bg-emerald-50",
      )}
    >
      {children}
    </div>
  );
}

export function DataTable({ caption, head, rows }: { caption: string; head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-navy/10 bg-white">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <caption className="px-5 pt-4 text-left font-semibold text-navy">{caption}</caption>
        <thead>
          <tr className="border-b border-navy/10">
            {head.map((h, i) => (
              <th key={i} scope="col" className="px-5 py-3 font-semibold text-navy">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b border-navy/6 last:border-0 even:bg-ivory/60">
              {r.map((c, ci) =>
                ci === 0 ? (
                  <th key={ci} scope="row" className="px-5 py-3 align-top font-semibold text-navy">{c}</th>
                ) : (
                  <td key={ci} className="px-5 py-3 align-top leading-relaxed text-slate-600">{c}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
