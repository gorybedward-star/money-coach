"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, ArrowRight, Building2, Car, CheckCircle2, ChevronDown, CreditCard, Flag, Home, Info, Landmark, LineChart, Plus,
  FileDown, Lock, RotateCcw, Save, Sparkles, Trophy, Trash2, TrendingDown, TrendingUp, Wallet, type LucideIcon,
} from "lucide-react";
import {
  ASSET_GROUPS, DEBT_GROUPS, EXAMPLE_ESSENTIALS, HIGH_INTEREST_APR, WEALTH_LEVELS, addSnapshot, blankSheet, exampleSheet, isHighInterest, newLine,
  nextRoadmapStep, projectArrival, wealthLevel, summarize, type DebtGroupId, type GroupId, type Line, type Sheet, type Snapshot,
} from "@/lib/net-worth";
import { summarize as summarizeBudget, type Budget } from "@/lib/budget";
import { formatCompactUSD, formatUSD } from "@/lib/calculators";
import { inputClass } from "@/components/ui/input";
import { PrintButton } from "./fields";
import { cn } from "@/lib/utils";
import { sendLead } from "@/lib/send-lead";

const KEY = "mc-networth-v1";
const BUDGET_KEY = "mc-budget-v1";

type GroupMeta = { id: GroupId; title: string; hint: string; icon: LucideIcon; color: string; tint: string; debt?: boolean };

const GROUPS: GroupMeta[] = [
  { id: "cash", title: "Cash and savings", hint: "Checking, savings, and your emergency fund. Money you can reach this week.", icon: Wallet, color: "#167D68", tint: "bg-emerald-50 text-emerald" },
  { id: "invest", title: "Retirement and investments", hint: "Current balances from your latest statements. These are the assets that compound.", icon: LineChart, color: "#0E5B4B", tint: "bg-emerald-50 text-emerald" },
  { id: "property", title: "Home and real estate", hint: "A realistic estimate of what it would sell for today. Enter the loan below, under what you owe.", icon: Home, color: "#C9A45C", tint: "bg-gold-50 text-gold-600" },
  { id: "belongings", title: "Vehicles and other", hint: "What you could sell them for, not what you paid. These usually lose value over time.", icon: Car, color: "#8A97A8", tint: "bg-navy/8 text-navy" },
  { id: "costly", title: "Credit cards and personal loans", hint: `The costly kind. Anything at ${HIGH_INTEREST_APR}% APR or more is flagged as high-interest.`, icon: CreditCard, color: "#B4533A", tint: "bg-[#B4533A]/10 text-[#9A4330]", debt: true },
  { id: "loans", title: "Car and student loans", hint: "Enter the payoff balance and rate (optional). Rates of 8% or more are flagged.", icon: Landmark, color: "#D08A6E", tint: "bg-[#B4533A]/10 text-[#9A4330]", debt: true },
  { id: "mortgage", title: "Mortgage and home loans", hint: "The remaining balance on your home and any home equity loans.", icon: Building2, color: "#7A2E1F", tint: "bg-[#B4533A]/10 text-[#9A4330]", debt: true },
];
const meta = (g: GroupId) => GROUPS.find((x) => x.id === g)!;

type Saved = { sheet: Sheet; essentials: string; snapshots: Snapshot[] };

function readBudgetEssentials(): number | null {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { budget?: Budget };
    if (!saved?.budget?.essentials) return null;
    const s = summarizeBudget(saved.budget);
    const e = s.totals.essentials + s.totals.debt;
    return e > 0 ? Math.round(e) : null;
  } catch {
    return null;
  }
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });

export function NetWorthTool() {
  const [sheet, setSheet] = useState<Sheet>(exampleSheet);
  const [essentials, setEssentials] = useState(EXAMPLE_ESSENTIALS);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isExample, setIsExample] = useState(true);
  const [budgetEssentials, setBudgetEssentials] = useState<number | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [open, setOpen] = useState<Record<GroupId, boolean>>({ cash: true, invest: true, property: false, belongings: false, costly: true, loans: false, mortgage: false });
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Saved;
        if (saved?.sheet?.cash) {
          setSheet(saved.sheet);
          setEssentials(saved.essentials ?? "");
          setSnapshots(Array.isArray(saved.snapshots) ? saved.snapshots : []);
          setIsExample(false);
        }
      }
    } catch {
      /* ignore */
    }
    setBudgetEssentials(readBudgetEssentials());
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current || isExample) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ sheet, essentials, snapshots } satisfies Saved));
    } catch {
      /* storage unavailable */
    }
  }, [sheet, essentials, snapshots, isExample]);

  const s = useMemo(() => summarize(sheet, Number(essentials) || 0), [sheet, essentials]);
  const step = useMemo(() => nextRoadmapStep(s), [s]);

  const touch = () => setIsExample(false);
  const edit = (g: GroupId, id: string, patch: Partial<Line>) => {
    touch();
    setSheet((b) => ({ ...b, [g]: b[g].map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  };
  const add = (g: GroupId) => {
    touch();
    setSheet((b) => ({ ...b, [g]: [...b[g], meta(g).debt ? newLine("", "", "") : newLine("")] }));
  };
  const remove = (g: GroupId, id: string) => {
    touch();
    setSheet((b) => ({ ...b, [g]: b[g].filter((l) => l.id !== id) }));
  };
  const startBlank = () => {
    setSheet(blankSheet());
    setEssentials(budgetEssentials ? String(budgetEssentials) : "");
    setSnapshots([]);
    setIsExample(false);
    setOpen({ cash: true, invest: true, property: true, belongings: true, costly: true, loans: true, mortgage: true });
    window.scrollTo({ top: document.getElementById("networth-start")?.offsetTop ?? 0, behavior: "smooth" });
  };
  const loadExample = () => {
    setSheet(exampleSheet());
    setEssentials(EXAMPLE_ESSENTIALS);
    setSnapshots([]);
    setIsExample(true);
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  };
  const saveSnapshot = () => {
    setSnapshots((list) => addSnapshot(list, { date: new Date().toISOString(), assets: Math.round(s.assets), debts: Math.round(s.debts), netWorth: Math.round(s.netWorth) }));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  // In the example, show a sample history so visitors can see what tracking looks like.
  const history = isExample ? exampleHistory(s.netWorth) : snapshots;
  const negative = s.netWorth < -0.5;

  return (
    <div id="networth-start" className="scroll-mt-24 space-y-6">
      {isExample && (
        <div className="no-print flex flex-col gap-4 rounded-[var(--radius-card)] border border-gold/50 bg-gold-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="flex items-start gap-3 leading-relaxed">
            <Sparkles className="mt-1 size-5 shrink-0 text-gold-600" aria-hidden />
            <span><strong>These are example numbers</strong> for the same family of four as our budget example. Replace them with yours, or start fresh.</span>
          </p>
          <button type="button" onClick={startBlank} className="shrink-0 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-ivory hover:bg-navy-800">
            Start my own snapshot
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Inputs */}
        <div className="min-w-0 space-y-4">
          <SideHeading n={1} title="What you own" total={s.assets} tone="own" />
          {ASSET_GROUPS.map((g) => (
            <GroupPanel key={g} g={meta(g)} lines={sheet[g]} total={s.groups[g]} open={open[g]} onToggle={() => setOpen((o) => ({ ...o, [g]: !o[g] }))}
              onEdit={(id, p) => edit(g, id, p)} onAdd={() => add(g)} onRemove={(id) => remove(g, id)} />
          ))}

          <SideHeading n={2} title="What you owe" total={s.debts} tone="owe" />
          {DEBT_GROUPS.map((g) => (
            <GroupPanel key={g} g={meta(g)} lines={sheet[g]} total={s.groups[g]} open={open[g]} onToggle={() => setOpen((o) => ({ ...o, [g]: !o[g] }))}
              onEdit={(id, p) => edit(g, id, p)} onAdd={() => add(g)} onRemove={(id) => remove(g, id)} />
          ))}

          <SideHeading n={3} title="Your safety net check" />
          <section className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-5 shadow-soft sm:p-6">
            <label htmlFor="nw-essentials" className="block font-semibold">Monthly essentials <span className="font-normal text-slate-600">(optional)</span></label>
            <p className="mt-1 text-sm text-slate-600">Housing, utilities, food, transportation, insurance, childcare, and minimum debt payments. We use it to show how many months your cash could carry your family.</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="relative w-48">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">$</span>
                <input id="nw-essentials" type="number" inputMode="decimal" min={0} step="any" placeholder="0" value={essentials}
                  onChange={(e) => { touch(); setEssentials(e.target.value); }} className={cn(inputClass, "h-11 pl-7 tabular-nums")} />
              </div>
              <span className="text-sm text-slate-600">per month</span>
              {budgetEssentials !== null && String(budgetEssentials) !== essentials && (
                <button type="button" onClick={() => { touch(); setEssentials(String(budgetEssentials)); }}
                  className="no-print inline-flex items-center gap-1.5 rounded-full border-2 border-emerald/30 px-4 py-2 text-sm font-semibold text-emerald hover:border-emerald">
                  Use my budget: {formatUSD(budgetEssentials)}
                </button>
              )}
            </div>
            {budgetEssentials === null && (
              <p className="mt-3 text-xs text-slate-600">
                Tip: build your plan in the <Link href="/tools/budget" className="font-semibold text-emerald underline underline-offset-2">Family Budget Builder</Link> and we can fill this in for you.
              </p>
            )}
          </section>
        </div>

        {/* Live summary */}
        <aside aria-live="polite" className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className={cn("rounded-[var(--radius-card)] p-6 text-ivory shadow-lift transition-colors", negative ? "bg-[#7A2E1F]" : "bg-navy")}>
            <p className="text-sm text-ivory/75">{negative ? "Your net worth today (below zero)" : "Your net worth today"}</p>
            <p className={cn("mt-1 font-display text-5xl font-bold tabular-nums", negative ? "text-ivory" : "text-gold")}>
              {negative ? "−" : ""}{formatUSD(Math.abs(s.netWorth))}
            </p>
            <p className="mt-2 text-sm text-ivory/75">{formatUSD(s.assets)} owned · {formatUSD(s.debts)} owed</p>
            <OwnOweBars s={s} />
          </div>

          <WealthLevelCard netWorth={s.netWorth} history={history} isExample={isExample} />

          <div className="rounded-[var(--radius-card)] border-2 border-gold/60 bg-gold-50 p-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-600">
              <Flag className="size-4" aria-hidden /> Your next move · Roadmap stage {step.stage}
            </p>
            <p className="mt-2 font-display text-2xl font-bold">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-navy/80">{step.detail}</p>
            <Link href={step.href} className="no-print mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald hover:underline">
              {step.cta} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Tile label="Months of cash" value={s.monthsCovered === null ? "—" : s.monthsCovered.toFixed(1)} sub={s.monthsCovered === null ? "Add essentials" : "of essentials"} tone={s.monthsCovered === null ? "info" : s.monthsCovered >= 3 ? "good" : "watch"} />
            <Tile label="High-interest debt" value={formatCompactUSD(s.highInterest)} sub={`${HIGH_INTEREST_APR}%+ APR`} tone={s.highInterest > 0 ? "watch" : "good"} />
            <Tile label="Assets that can grow" value={`${s.growingPct.toFixed(0)}%`} sub="investments + property" tone={s.growingPct >= 50 ? "good" : "info"} />
            <Tile label="Without home and cars" value={(s.financialNetWorth < 0 ? "−" : "") + formatCompactUSD(Math.abs(s.financialNetWorth))} sub="financial net worth" tone={s.financialNetWorth >= 0 ? "good" : "watch"} />
          </div>

          <ProgressTracker history={history} isExample={isExample} onSave={saveSnapshot} onStart={startBlank} justSaved={justSaved}
            onClear={() => setSnapshots([])} />

          <div className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-5 shadow-soft">
            <p className="text-sm font-semibold">Your net worth checkup</p>
            <ul className="mt-3 space-y-3">
              {s.checks.map((c) => {
                const Icon = c.tone === "good" ? CheckCircle2 : c.tone === "watch" ? AlertTriangle : Info;
                return (
                  <li key={c.title} className="flex gap-3">
                    <Icon className={cn("mt-0.5 size-5 shrink-0", c.tone === "good" ? "text-emerald" : c.tone === "watch" ? "text-[#B4533A]" : "text-gold-600")} aria-hidden />
                    <div>
                      <p className="text-sm font-semibold">{c.title}</p>
                      <p className="text-sm leading-relaxed text-slate-600">{c.detail}</p>
                      {c.href && <Link href={c.href} className="no-print mt-1 inline-block text-sm font-semibold text-emerald hover:underline">{c.cta} →</Link>}
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
            {isExample ? "Example numbers aren’t saved." : "Your numbers and snapshots are saved only in this browser. Nothing is sent to us."} Please don&rsquo;t enter account numbers.
            This tool is for education only. It is not financial, investment, tax, legal, or insurance advice, and guidelines shown are common rules of thumb, not recommendations for your situation.
          </p>
        </aside>
      </div>
    </div>
  );
}

function SideHeading({ n, title, total, tone }: { n: number; title: string; total?: number; tone?: "own" | "owe" }) {
  return (
    <div className="flex items-end justify-between gap-3 pt-2 first:pt-0">
      <h2 className="text-2xl font-bold">
        <span className="mr-2 font-sans text-xs font-semibold uppercase tracking-wider text-slate-600">Part {n}</span>
        {title}
      </h2>
      {total !== undefined && (
        <p className={cn("font-display text-xl font-bold tabular-nums", tone === "owe" ? "text-[#9A4330]" : "text-emerald")}>{formatUSD(total)}</p>
      )}
    </div>
  );
}

function GroupPanel({ g, lines, total, open, onToggle, onEdit, onAdd, onRemove }: {
  g: GroupMeta; lines: Line[]; total: number; open: boolean; onToggle: () => void;
  onEdit: (id: string, p: Partial<Line>) => void; onAdd: () => void; onRemove: (id: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-card)] border border-navy/10 bg-white shadow-soft">
      <h3>
        <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={`nw-${g.id}`} className="flex w-full items-center gap-4 p-5 text-left hover:bg-ivory/60 sm:px-6">
          <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", g.tint)}>
            <g.icon className="size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 font-display text-lg font-bold sm:text-xl">{g.title}</span>
          <span className="font-display text-lg font-bold tabular-nums sm:text-xl">{formatUSD(total)}</span>
          <ChevronDown className={cn("size-5 shrink-0 text-slate-600 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      </h3>
      <div id={`nw-${g.id}`} hidden={!open} className="border-t border-navy/8 px-5 pb-5 pt-4 sm:px-6">
        <p className="text-sm text-slate-600">{g.hint}</p>
        <ul className="mt-4 space-y-3">
          {lines.map((l) => (
            <LineRow key={l.id} line={l} debt={g.debt ? (g.id as DebtGroupId) : undefined} onChange={(p) => onEdit(l.id, p)} onRemove={() => onRemove(l.id)} />
          ))}
        </ul>
        <button type="button" onClick={onAdd} className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-dashed border-emerald/40 px-4 py-2 text-sm font-semibold text-emerald hover:border-emerald">
          <Plus className="size-4" aria-hidden /> Add a line
        </button>
      </div>
    </section>
  );
}

function LineRow({ line, debt, onChange, onRemove }: { line: Line; debt?: DebtGroupId; onChange: (p: Partial<Line>) => void; onRemove: () => void }) {
  const flagged = debt && Number(line.amount) > 0 && isHighInterest(debt, line);
  return (
    <li>
      <div className={cn("grid grid-cols-[1fr_auto] gap-2 sm:items-center", debt ? "sm:grid-cols-[1.3fr_1fr_6.5rem_auto]" : "sm:grid-cols-[1.4fr_1fr_auto]")}>
        <input aria-label="What is it?" placeholder="What is it?" value={line.label} maxLength={50} onChange={(e) => onChange({ label: e.target.value })} className={cn(inputClass, "h-11 text-[0.95rem]")} />
        <button type="button" onClick={onRemove} aria-label={`Remove ${line.label || "line"}`} className="inline-flex size-11 items-center justify-center rounded-full text-slate-600 hover:bg-red-50 hover:text-red-700 sm:order-last">
          <Trash2 className="size-4" />
        </button>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">$</span>
          <input type="number" inputMode="decimal" min={0} step="any" placeholder="0" aria-label={`${line.label || "Line"} ${debt ? "balance" : "value"}`}
            value={line.amount} onChange={(e) => onChange({ amount: e.target.value })} className={cn(inputClass, "h-11 pl-7 tabular-nums")} />
        </div>
        {debt && (
          <div className="relative">
            <input type="number" inputMode="decimal" min={0} max={100} step="any" placeholder="APR" aria-label={`${line.label || "Line"} interest rate (APR)`}
              value={line.apr ?? ""} onChange={(e) => onChange({ apr: e.target.value })} className={cn(inputClass, "h-11 pr-7 tabular-nums")} />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-600">%</span>
          </div>
        )}
      </div>
      {flagged && (
        <p className="mt-1 flex items-center gap-1 pl-1 text-xs font-semibold text-[#9A4330]">
          <AlertTriangle className="size-3.5" aria-hidden /> High-interest: a top payoff priority
        </p>
      )}
    </li>
  );
}

function OwnOweBars({ s }: { s: ReturnType<typeof summarize> }) {
  const max = Math.max(s.assets, s.debts, 1);
  const row = (label: string, total: number, ids: GroupId[]) => (
    <div>
      <div className="flex justify-between text-xs text-ivory/75"><span>{label}</span><span className="tabular-nums">{formatCompactUSD(total)}</span></div>
      <div className="mt-1 flex h-3 overflow-hidden rounded-full bg-white/10" style={{ width: `${Math.max(4, (total / max) * 100)}%` }}>
        {ids.map((g) => {
          const w = total > 0 ? (s.groups[g] / total) * 100 : 0;
          return <span key={g} title={`${meta(g).title}: ${formatUSD(s.groups[g])}`} style={{ width: `${w}%`, background: meta(g).color }} className="h-full transition-all duration-500" />;
        })}
      </div>
    </div>
  );
  return (
    <div className="mt-5 space-y-3" role="img" aria-label={`You own ${formatUSD(s.assets)} and owe ${formatUSD(s.debts)}`}>
      {row("Own", s.assets, ASSET_GROUPS)}
      {row("Owe", s.debts, DEBT_GROUPS)}
    </div>
  );
}

function Tile({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "good" | "watch" | "info" }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-4 shadow-soft">
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      <p className={cn("mt-1 font-display text-2xl font-bold tabular-nums", tone === "good" ? "text-emerald" : tone === "watch" ? "text-[#9A4330]" : "text-navy")}>{value}</p>
      <p className="text-xs text-slate-600">{sub}</p>
    </div>
  );
}

function exampleHistory(current: number): Snapshot[] {
  // Six quarterly snapshots for the example family, ending at today's example number.
  const steps = [-21_500, -16_800, -12_900, -8_200, -3_900, 0];
  const now = new Date();
  return steps.map((d, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (steps.length - 1 - i) * 3, now.getDate());
    return { date: date.toISOString(), assets: 0, debts: 0, netWorth: current + d };
  });
}

function ProgressTracker({ history, isExample, onSave, onStart, onClear, justSaved }: {
  history: Snapshot[]; isExample: boolean; onSave: () => void; onStart: () => void; onClear: () => void; justSaved: boolean;
}) {
  const last = history.at(-1);
  const prev = history.at(-2);
  const first = history[0];
  const change = last && prev ? last.netWorth - prev.netWorth : null;
  const total = last && first && history.length > 1 ? last.netWorth - first.netWorth : null;

  return (
    <div className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Progress tracker {isExample && <span className="font-normal text-slate-600">(sample)</span>}</p>
        {isExample ? (
          <button type="button" onClick={onStart} className="no-print inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-ivory hover:bg-navy-800">
            Start tracking mine
          </button>
        ) : (
          <button type="button" onClick={onSave} className="no-print inline-flex items-center gap-1.5 rounded-full bg-emerald px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
            <Save className="size-3.5" aria-hidden /> {justSaved ? "Saved" : "Save today's snapshot"}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Save a snapshot today, then come back once a month. Watching this line climb is one of the best motivators there is.
        </p>
      ) : (
        <>
          <Sparkline history={history} />
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Change label="Since last snapshot" value={change} />
            <Change label={first ? `Since ${shortDate(first.date)}` : "Overall"} value={total} />
          </div>
          {history.length === 1 && <p className="mt-2 text-xs text-slate-600">Save another snapshot next month to see your progress.</p>}
          {!isExample && (
            <button type="button" onClick={onClear} className="no-print mt-3 text-xs font-semibold text-slate-600 underline underline-offset-2 hover:text-navy">
              Clear history
            </button>
          )}
        </>
      )}
    </div>
  );
}

function Change({ label, value }: { label: string; value: number | null }) {
  const up = value !== null && value >= 0;
  return (
    <div className="rounded-xl bg-ivory-200 p-3">
      <p className="text-xs text-slate-600">{label}</p>
      {value === null ? (
        <p className="mt-0.5 font-semibold text-slate-600">—</p>
      ) : (
        <p className={cn("mt-0.5 flex items-center gap-1 font-display text-lg font-bold tabular-nums", up ? "text-emerald" : "text-[#9A4330]")}>
          {up ? <TrendingUp className="size-4" aria-hidden /> : <TrendingDown className="size-4" aria-hidden />}
          {up ? "+" : "−"}{formatUSD(Math.abs(value))}
        </p>
      )}
    </div>
  );
}

function Sparkline({ history }: { history: Snapshot[] }) {
  const W = 320, H = 110, P = 8;
  const vals = history.map((h) => h.netWorth);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const x = (i: number) => (history.length === 1 ? W / 2 : P + (i / (history.length - 1)) * (W - P * 2));
  const y = (v: number) => H - P - ((v - min) / span) * (H - P * 2);
  const pts = history.map((h, i) => `${x(i)},${y(h.netWorth)}`).join(" ");
  const zeroY = min < 0 && max > 0 ? y(0) : null;
  return (
    <figure className="mt-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full" role="img" aria-label={`Net worth over ${history.length} snapshots, from ${formatUSD(vals[0])} to ${formatUSD(vals.at(-1)!)}`}>
        <defs>
          <linearGradient id="nw-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#167D68" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#167D68" stopOpacity="0" />
          </linearGradient>
        </defs>
        {zeroY !== null && <line x1={0} x2={W} y1={zeroY} y2={zeroY} stroke="#10243A" strokeOpacity="0.2" strokeDasharray="3 3" />}
        {history.length > 1 && <polygon points={`${x(0)},${H - P} ${pts} ${x(history.length - 1)},${H - P}`} fill="url(#nw-fill)" />}
        {history.length > 1 && <polyline points={pts} fill="none" stroke="#167D68" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
        {history.map((h, i) => (
          <circle key={h.date} cx={x(i)} cy={y(h.netWorth)} r={i === history.length - 1 ? 4.5 : 3} fill={i === history.length - 1 ? "#C9A45C" : "#167D68"}>
            <title>{`${shortDate(h.date)}: ${formatUSD(h.netWorth)}`}</title>
          </circle>
        ))}
      </svg>
      <figcaption className="flex justify-between text-xs text-slate-600">
        <span>{shortDate(history[0].date)}</span>
        {history.length > 1 && <span>{shortDate(history.at(-1)!.date)}</span>}
      </figcaption>
    </figure>
  );
}

const goalLabel = (n: number) => (n >= 1_000_000 ? `$${n / 1_000_000}M` : n >= 1_000 ? `$${Math.round(n / 1_000)}K` : formatUSD(n));

function WealthLevelCard({ netWorth, history, isExample }: { netWorth: number; history: Snapshot[]; isExample: boolean }) {
  const low = Math.min(netWorth, ...history.map((h) => h.netWorth));
  const st = wealthLevel(netWorth, low);
  const totalLevels = WEALTH_LEVELS.length - 1;

  if (!st.level) {
    return (
      <div className="rounded-[var(--radius-card)] border-2 border-gold bg-white p-5 shadow-soft">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-600"><Trophy className="size-4" aria-hidden /> All {totalLevels} wealth levels complete</p>
        <p className="mt-2 font-display text-2xl font-bold">Legacy achieved</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">Protect it, plan your estate with licensed professionals, and pass on the habits that built it.</p>
      </div>
    );
  }

  const L = st.level;
  const pct = Math.round(st.progress * 100);
  const arrival = L.n > 0 || netWorth < 0 ? projectArrival(history, L.goal) : null;
  const R = 34, C = 2 * Math.PI * R;
  const next = WEALTH_LEVELS[L.n + 1];

  return (
    <div className="rounded-[var(--radius-card)] border-2 border-gold/60 bg-white p-5 shadow-soft">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-600">
        <Trophy className="size-4" aria-hidden /> {L.n === 0 ? "Your wealth tracker" : `Wealth level ${L.n} of ${totalLevels}`}
      </p>
      <div className="mt-3 flex items-center gap-4">
        <svg viewBox="0 0 80 80" className="size-20 shrink-0 -rotate-90" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct}% of the way to ${goalLabel(L.goal)}`}>
          <circle cx="40" cy="40" r={R} fill="none" stroke="#F2EEE2" strokeWidth="8" />
          <circle cx="40" cy="40" r={R} fill="none" stroke="url(#lvl-grad)" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - st.progress)} className="transition-all duration-700" />
          <defs><linearGradient id="lvl-grad"><stop offset="0%" stopColor="#167D68" /><stop offset="100%" stopColor="#C9A45C" /></linearGradient></defs>
          <text x="40" y="40" transform="rotate(90 40 40)" textAnchor="middle" dominantBaseline="central" className="fill-navy font-display text-[17px] font-bold">{pct}%</text>
        </svg>
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold leading-tight">{L.n === 0 ? "Get to $0" : `Goal: ${goalLabel(L.goal)}`}</p>
          <p className="text-sm font-semibold text-emerald">{L.name}</p>
          <p className="mt-0.5 text-sm tabular-nums text-slate-600">{formatUSD(st.toGo)} to go</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{L.tagline}</p>

      {st.checkpoints.length > 0 && (
        <ol className="mt-3 grid grid-cols-4 gap-1.5 text-center" aria-label="Checkpoints in this level">
          {st.checkpoints.map((c) => (
            <li key={c.value} className={cn("rounded-full py-1 text-xs font-semibold tabular-nums", c.reached ? "bg-emerald text-white" : "bg-ivory-200 text-slate-600")}>
              {goalLabel(c.value)}
            </li>
          ))}
          <li className="rounded-full bg-gold-50 py-1 text-xs font-bold tabular-nums text-gold-600 ring-1 ring-gold/50">{goalLabel(L.goal)}</li>
        </ol>
      )}

      <div className="mt-3 rounded-xl bg-ivory-200 p-3 text-sm">
        {arrival?.date && arrival.months !== null ? (
          <p>
            At your pace{isExample ? " (sample)" : ""} of <strong className="tabular-nums">+{formatUSD(arrival.perMonth)}/month</strong>, you&rsquo;d reach {goalLabel(L.goal)} around{" "}
            <strong>{arrival.date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</strong>. Raise your monthly progress to get there faster.
          </p>
        ) : arrival && arrival.months === null ? (
          <p>Your snapshots show net worth flat or down lately. One extra debt payment or savings transfer a month gets the line moving up again.</p>
        ) : (
          <p>Save a snapshot each month. After a few weeks we&rsquo;ll estimate when you&rsquo;ll reach {goalLabel(L.goal)} at your pace.</p>
        )}
      </div>

      {L.guide && (
        <a href={L.guide.href} download className="no-print mt-3 flex items-center gap-3 rounded-xl border border-emerald/30 bg-emerald-50 p-3 hover:border-emerald">
          <FileDown className="size-6 shrink-0 text-emerald" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-navy">Free guide: {L.guide.title}</span>
            <span className="block text-xs text-slate-600">{L.guide.pages}-page PDF for this level · No email required</span>
          </span>
          <span className="text-sm font-semibold text-emerald">Download</span>
        </a>
      )}
      {L.guide && !isExample && <GuideSignup level={L.n} />}

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        {st.completed.map((c) => (
          <span key={c.n} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
            <CheckCircle2 className="size-3.5" aria-hidden /> {goalLabel(c.goal)}
          </span>
        ))}
        {next && (
          <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-navy/20 px-2.5 py-1 text-slate-600">
            <Lock className="size-3.5" aria-hidden /> Level {next.n} unlocks at {goalLabel(L.goal)}
          </span>
        )}
      </div>
    </div>
  );
}

/** Optional: get the next level's guide by email. The download above never requires this. */
function GuideSignup({ level }: { level: number }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setState("error"); setError("Please enter a valid email."); return; }
    setState("sending");
    try {
      const res = await sendLead({ type: "guide", email: email.trim(), marketingConsent: true, context: { "Wealth level": String(level), Source: "Net Worth Tracker" } });
      if (res.ok) setState("done");
      else { setState("error"); setError(res.error); }
    } catch {
      setState("error"); setError("We couldn't send that right now. Please try again.");
    }
  };
  if (state === "done") {
    return <p className="no-print mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald"><CheckCircle2 className="size-4" aria-hidden /> You&rsquo;re on the list. We&rsquo;ll email you the next level&rsquo;s guide when it&rsquo;s ready.</p>;
  }
  return (
    <form onSubmit={submit} className="no-print mt-2">
      <label htmlFor="guide-email" className="text-xs text-slate-600">Optional: email me the next level&rsquo;s guide when it&rsquo;s ready.</label>
      <div className="mt-1 flex gap-2">
        <input id="guide-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={cn(inputClass, "h-10 min-w-0 flex-1 text-sm")} />
        <button type="submit" disabled={state === "sending"} className="shrink-0 rounded-full bg-navy px-4 text-xs font-semibold text-ivory hover:bg-navy-800 disabled:opacity-60">{state === "sending" ? "Sending…" : "Notify me"}</button>
      </div>
      {state === "error" && <p role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
      <p className="mt-1 text-[11px] text-slate-600">Only your email is sent, never your numbers. Unsubscribe anytime.</p>
    </form>
  );
}
