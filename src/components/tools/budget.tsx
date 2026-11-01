"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Info, Plus, RotateCcw, Sparkles, Trash2, type LucideIcon, Wallet, PiggyBank, Home, CreditCard, Smile } from "lucide-react";
import { blankBudget, exampleBudget, FREQ_LABEL, newLine, summarize, toMonthly, type Budget, type Freq, type GroupId, type Line } from "@/lib/budget";
import { formatUSD } from "@/lib/calculators";
import { inputClass } from "@/components/ui/input";
import { PrintButton } from "./fields";
import { cn } from "@/lib/utils";

const KEY = "mc-budget-v1";

const GROUPS: { id: GroupId; title: string; hint: string; icon: LucideIcon; color: string; tint: string }[] = [
  { id: "income", title: "Money coming in", hint: "Take-home pay after taxes and payroll deductions.", icon: Wallet, color: "#167D68", tint: "bg-emerald-50 text-emerald" },
  { id: "save", title: "Pay yourself first", hint: "Savings and investing that happen before anything else.", icon: PiggyBank, color: "#167D68", tint: "bg-emerald-50 text-emerald" },
  { id: "essentials", title: "Essentials", hint: "The bills that keep your household running.", icon: Home, color: "#10243A", tint: "bg-navy/8 text-navy" },
  { id: "debt", title: "Debt payments", hint: "Credit cards, loans, and other balances.", icon: CreditCard, color: "#B4533A", tint: "bg-[#B4533A]/10 text-[#9A4330]" },
  { id: "lifestyle", title: "Life and fun", hint: "The things that make life enjoyable. Budget them on purpose.", icon: Smile, color: "#C9A45C", tint: "bg-gold-50 text-gold-600" },
];
const color = (g: GroupId) => GROUPS.find((x) => x.id === g)!.color;

export function BudgetTool() {
  const [budget, setBudget] = useState<Budget>(exampleBudget);
  const [isExample, setIsExample] = useState(true);
  const [open, setOpen] = useState<Record<GroupId, boolean>>({ income: true, save: true, essentials: true, debt: false, lifestyle: false });
  const loaded = useRef(false);

  // Load a saved budget from this browser, if any.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { budget: Budget };
        if (saved?.budget?.income) {
          setBudget(saved.budget);
          setIsExample(false);
        }
      }
    } catch {
      /* ignore */
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current || isExample) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ budget }));
    } catch {
      /* storage unavailable */
    }
  }, [budget, isExample]);

  const s = useMemo(() => summarize(budget), [budget]);

  const edit = (g: GroupId, id: string, patch: Partial<Line>) => {
    setIsExample(false);
    setBudget((b) => ({ ...b, [g]: b[g].map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  };
  const add = (g: GroupId) => {
    setIsExample(false);
    setBudget((b) => ({ ...b, [g]: [...b[g], newLine("")] }));
  };
  const remove = (g: GroupId, id: string) => {
    setIsExample(false);
    setBudget((b) => ({ ...b, [g]: b[g].filter((l) => l.id !== id) }));
  };
  const startBlank = () => {
    setBudget(blankBudget());
    setIsExample(false);
    setOpen({ income: true, save: true, essentials: true, debt: true, lifestyle: true });
    window.scrollTo({ top: document.getElementById("budget-start")?.offsetTop ?? 0, behavior: "smooth" });
  };
  const loadExample = () => {
    setBudget(exampleBudget());
    setIsExample(true);
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  };

  const groupTotal = (g: GroupId) => (g === "income" ? s.income : s.totals[g as Exclude<GroupId, "income">]);

  return (
    <div id="budget-start" className="scroll-mt-24 space-y-6">
      {isExample && (
        <div className="no-print flex flex-col gap-4 rounded-[var(--radius-card)] border border-gold/50 bg-gold-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="flex items-start gap-3 leading-relaxed">
            <Sparkles className="mt-1 size-5 shrink-0 text-gold-600" aria-hidden />
            <span><strong>These are example numbers</strong> for a family of four so you can see how it works. Replace them with yours, or start fresh.</span>
          </p>
          <button type="button" onClick={startBlank} className="shrink-0 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-ivory hover:bg-navy-800">
            Start my own budget
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        {/* Inputs */}
        <div className="min-w-0 space-y-4">
          {GROUPS.map((g, gi) => {
            const total = groupTotal(g.id);
            const isOpen = open[g.id];
            return (
              <section key={g.id} className="overflow-hidden rounded-[var(--radius-card)] border border-navy/10 bg-white shadow-soft">
                <h2>
                  <button
                    type="button"
                    onClick={() => setOpen((o) => ({ ...o, [g.id]: !o[g.id] }))}
                    aria-expanded={isOpen}
                    aria-controls={`grp-${g.id}`}
                    className="flex w-full items-center gap-4 p-5 text-left hover:bg-ivory/60 sm:px-6"
                  >
                    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", g.tint)}>
                      <g.icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-slate-600">Step {gi + 1}</span>
                      <span className="block font-display text-xl font-bold">{g.title}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-display text-xl font-bold tabular-nums">{formatUSD(total)}</span>
                      <span className="block font-sans text-xs font-normal text-slate-600">per month</span>
                    </span>
                    <ChevronDown className={cn("size-5 shrink-0 text-slate-600 transition-transform", isOpen && "rotate-180")} aria-hidden />
                  </button>
                </h2>
                <div id={`grp-${g.id}`} hidden={!isOpen} className="border-t border-navy/8 px-5 pb-5 pt-4 sm:px-6">
                  <p className="text-sm text-slate-600">{g.hint}</p>
                  <ul className="mt-4 space-y-3">
                    {budget[g.id].map((l) => (
                      <LineRow key={l.id} line={l} onChange={(p) => edit(g.id, l.id, p)} onRemove={() => remove(g.id, l.id)} />
                    ))}
                  </ul>
                  <button type="button" onClick={() => add(g.id)} className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-dashed border-emerald/40 px-4 py-2 text-sm font-semibold text-emerald hover:border-emerald">
                    <Plus className="size-4" aria-hidden /> Add a line
                  </button>
                </div>
              </section>
            );
          })}
        </div>

        {/* Live summary */}
        <aside aria-live="polite" className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className={cn("rounded-[var(--radius-card)] p-6 text-ivory shadow-lift transition-colors", s.left < -0.5 ? "bg-[#7A2E1F]" : "bg-navy")}>
            <p className="text-sm text-ivory/75">{s.left < -0.5 ? "Over budget each month" : "Left to give a job"}</p>
            <p className={cn("mt-1 font-display text-5xl font-bold tabular-nums", s.left < -0.5 ? "text-ivory" : "text-gold")}>{formatUSD(Math.abs(s.left))}</p>
            <p className="mt-2 text-sm text-ivory/75">
              {formatUSD(s.income)} coming in · {formatUSD(s.planned)} planned
            </p>
            <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-white/10" role="img" aria-label="Where your money goes">
              {(["save", "essentials", "debt", "lifestyle"] as const).map((g) => {
                const base = Math.max(s.income, s.planned);
                const w = base > 0 ? (s.totals[g] / base) * 100 : 0;
                return <span key={g} style={{ width: `${w}%`, background: g === "essentials" ? "#FAF8F2" : color(g) }} className="h-full transition-all duration-500" />;
              })}
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-5 shadow-soft">
            <p className="text-sm font-semibold">Where each dollar goes</p>
            <ul className="mt-3 space-y-3">
              {(["save", "essentials", "debt", "lifestyle"] as const).map((g) => {
                const meta = GROUPS.find((x) => x.id === g)!;
                const p = s.pct(s.totals[g]);
                return (
                  <li key={g}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: meta.color }} />{meta.title}</span>
                      <span className="tabular-nums"><strong>{p.toFixed(0)}%</strong> <span className="text-slate-600">· {formatUSD(s.totals[g])}</span></span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ivory-200">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, p)}%`, background: meta.color }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-5 shadow-soft">
            <p className="text-sm font-semibold">Your budget checkup</p>
            <ul className="mt-3 space-y-3">
              {s.checks.map((c) => {
                const Icon = c.tone === "good" ? CheckCircle2 : c.tone === "watch" ? AlertTriangle : Info;
                return (
                  <li key={c.title} className="flex gap-3">
                    <Icon className={cn("mt-0.5 size-5 shrink-0", c.tone === "good" ? "text-emerald" : c.tone === "watch" ? "text-[#B4533A]" : "text-gold-600")} aria-hidden />
                    <div>
                      <p className="text-sm font-semibold">{c.title}</p>
                      <p className="text-sm leading-relaxed text-slate-600">{c.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="no-print flex flex-wrap gap-3">
            <PrintButton />
            <button type="button" onClick={isExample ? startBlank : loadExample} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-navy/5 hover:text-navy">
              <RotateCcw className="size-4" aria-hidden /> {isExample ? "Clear example" : "See the example"}
            </button>
          </div>
          <p className="text-xs leading-relaxed text-slate-600">
            {isExample ? "Example numbers aren't saved." : "Your budget is saved only in this browser. Nothing is sent to us."} Guidelines shown are common rules of thumb for education, not advice for your situation.
          </p>
        </aside>
      </div>
    </div>
  );
}

function LineRow({ line, onChange, onRemove }: { line: Line; onChange: (p: Partial<Line>) => void; onRemove: () => void }) {
  const monthly = toMonthly(Number(line.amount), line.freq);
  return (
    <li>
      <div className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1.3fr_1fr_auto_auto] sm:items-center">
      <input
        aria-label="What is it?"
        placeholder="What is it?"
        value={line.label}
        maxLength={50}
        onChange={(e) => onChange({ label: e.target.value })}
        className={cn(inputClass, "h-11 text-[0.95rem]")}
      />
      <button type="button" onClick={onRemove} aria-label={`Remove ${line.label || "line"}`} className="inline-flex size-11 items-center justify-center rounded-full text-slate-600 hover:bg-red-50 hover:text-red-700 sm:order-last">
        <Trash2 className="size-4" />
      </button>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">$</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder="0"
          aria-label={`${line.label || "Amount"} amount`}
          value={line.amount}
          onChange={(e) => onChange({ amount: e.target.value })}
          className={cn(inputClass, "h-11 pl-7 tabular-nums")}
        />
      </div>
      <select
        aria-label={`${line.label || "Amount"} how often`}
        value={line.freq}
        onChange={(e) => onChange({ freq: e.target.value as Freq })}
        className={cn(inputClass, "h-11 w-auto pr-3 text-sm")}
      >
        {(Object.keys(FREQ_LABEL) as Freq[]).map((f) => (
          <option key={f} value={f}>{FREQ_LABEL[f]}</option>
        ))}
      </select>
      </div>
      {line.freq !== "monthly" && monthly > 0 && (
        <p className="mt-1 pl-1 text-xs text-slate-600">≈ {formatUSD(monthly)} per month</p>
      )}
    </li>
  );
}
