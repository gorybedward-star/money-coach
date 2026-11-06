"use client";

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Award, Flame, Printer, RotateCcw } from "lucide-react";
import { benefitIdsFor, monthLabel, resetProgress, scorecard, startReset, toolkitSummary } from "@/lib/toolkit/calc";
import { toolkitBrand } from "@/content/toolkit";
import { cn } from "@/lib/utils";
import { useToolkit } from "./store";
import { Btn, Card, Eyebrow, PageHeader, Ring, pct, signed, usd } from "./ui";

function formatDay(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/** One before/after line. `better` says which direction is good. */
function Row({ label, before, now, fmt, better = "up", deltaFmt }: { label: string; before: number | null; now: number | null; fmt: (n: number) => string; better?: "up" | "down"; deltaFmt?: (n: number) => string }) {
  const has = before !== null && now !== null;
  const delta = has ? now! - before! : 0;
  const good = better === "up" ? delta > 0 : delta < 0;
  const flat = Math.abs(delta) < 0.005;
  return (
    <tr className="border-t border-[#eef1f5]">
      <th scope="row" className="py-3 pr-3 text-left text-sm font-medium">{label}</th>
      <td className="py-3 pr-3 text-right text-sm tabular-nums text-[#5f6f86]">{before === null ? "—" : fmt(before)}</td>
      <td className="py-3 pr-3 text-right text-sm font-semibold tabular-nums">{now === null ? "—" : fmt(now)}</td>
      <td className="py-3 text-right text-sm tabular-nums">
        {has && !flat ? (
          <span className={cn("inline-flex items-center gap-0.5 font-semibold", good ? "text-[#167d68]" : "text-[#b4483c]")}>
            {delta > 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {(deltaFmt ?? fmt)(Math.abs(delta))}
          </span>
        ) : (
          <span className="text-[#9aa7b8]">—</span>
        )}
      </td>
    </tr>
  );
}

export function Results() {
  const { state, update } = useToolkit();
  const t = toolkitSummary(state);
  const card = scorecard(state, benefitIdsFor(state));
  const rp = resetProgress(state, t);
  const b = state.reset.baseline;
  const [confirm, setConfirm] = useState(false);
  const [canPrint, setCanPrint] = useState(false);
  useEffect(() => {
    // Printing is blocked inside embedded previews; offer it only on the real site.
    try {
      setCanPrint(window.self === window.top);
    } catch {
      setCanPrint(false);
    }
  }, []);

  const nwChange = b ? t.nw.netWorth - b.netWorth : 0;
  const debtPaid = b ? b.debt - t.progress.current : 0;
  const saved = b ? t.emergency.current - b.emergency : 0;
  const headline = !b
    ? "Your results will appear here."
    : nwChange > 0
      ? `Your net worth is up ${usd(nwChange)} since Day 1.`
      : debtPaid > 0
        ? `You've paid down ${usd(debtPaid)} of debt since Day 1.`
        : "You've built your plan. The numbers follow the habits.";

  return (
    <div>
      <PageHeader title="My Money Reset Results" intro={b ? `Day 1 was ${formatDay(b.date)}. Here's what's changed, using only the numbers you've entered.` : "Your before-and-after report."}>
        <div className="flex flex-wrap gap-2 print:hidden">
          {canPrint && <Btn variant="secondary" onClick={() => window.print()}><Printer className="size-4" /> Print or save as PDF</Btn>}
        </div>
      </PageHeader>

      {/* Headline */}
      <section className="overflow-hidden rounded-3xl bg-[#0b1f3a] text-white print:border print:border-[#0b1f3a]">
        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <Eyebrow className="text-[#8cc7b5]">Day {rp.day} of 30 · {rp.completed} of {rp.total} steps done</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl" style={{ textWrap: "balance" }}>{headline}</h2>
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div><p className="text-white/60">Net worth</p><p className="text-xl font-semibold tabular-nums">{b ? signed(nwChange) : "—"}</p></div>
              <div><p className="text-white/60">Debt paid down</p><p className="text-xl font-semibold tabular-nums">{b ? usd(Math.max(0, debtPaid)) : "—"}</p></div>
              <div><p className="text-white/60">Added to emergency fund</p><p className="text-xl font-semibold tabular-nums">{b ? usd(Math.max(0, saved)) : "—"}</p></div>
              <div><p className="text-white/60">Streak</p><p className="flex items-center gap-1 text-xl font-semibold tabular-nums"><Flame className="size-4 text-[#8cc7b5]" />{rp.streak} days</p></div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4">
            <Ring value={card.total / 100} size={104} stroke={10} label="Scorecard">
              <span>
                <span className="block text-2xl font-semibold tabular-nums">{card.total}</span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-white/60">score</span>
              </span>
            </Ring>
            <div>
              <Eyebrow className="text-white/60">Scorecard</Eyebrow>
              <p className="text-lg font-semibold">{b ? `${card.total - b.score >= 0 ? "+" : ""}${card.total - b.score} points` : card.label}</p>
              <p className="text-xs text-white/60">{b ? `From ${b.score} on Day 1` : ""}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Day 1 vs. today" eyebrow="Your numbers">
          <div className="-mx-1 overflow-x-auto px-1">
            <table className="w-full min-w-[420px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.12em] text-[#5f6f86]">
                  <th className="pb-2 text-left font-semibold">Measure</th>
                  <th className="pb-2 pr-3 text-right font-semibold">Day 1</th>
                  <th className="pb-2 pr-3 text-right font-semibold">Today</th>
                  <th className="pb-2 text-right font-semibold">Change</th>
                </tr>
              </thead>
              <tbody>
                <Row label="Net worth" before={b?.netWorth ?? null} now={t.nw.netWorth} fmt={usd} />
                <Row label="Consumer debt" before={b?.debt ?? null} now={t.progress.current} fmt={usd} better="down" />
                <Row label="Emergency savings" before={b?.emergency ?? null} now={t.emergency.current} fmt={usd} />
                <Row label="Months of essentials covered" before={b?.monthsCovered ?? null} now={t.emergency.months} fmt={(n) => n.toFixed(1)} />
                <Row label="Savings rate" before={b?.savingsRate ?? null} now={t.pay.savingsRate} fmt={(n) => pct(n, 1)} deltaFmt={(n) => `${(n * 100).toFixed(1)} pts`} />
                <Row label="Investing each month" before={b?.investingMonthly ?? null} now={t.investing.monthly} fmt={usd} />
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[13px] text-[#5f6f86]">
            {t.progress.current > 0 && !t.plan.neverPaysOff ? `On your current plan you'll be free of consumer debt around ${monthLabel(t.plan.months)}.` : t.progress.current === 0 ? "No consumer debt in your tracker." : ""}
          </p>
        </Card>

        <Card title="Scorecard by area" eyebrow="Day 1 → today">
          <ul className="space-y-3">
            {card.rows.map((r) => {
              const before = b?.rows[r.id];
              const d = before === undefined ? null : r.score - before;
              return (
                <li key={r.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5">
                  <span className="text-sm font-medium">{r.label}</span>
                  <span className="text-sm tabular-nums">
                    <span className="text-[#5f6f86]">{before ?? "—"} → </span>
                    <span className="font-semibold">{r.score}</span>
                    {d !== null && d !== 0 && <span className={cn("ml-1.5 text-xs font-semibold", d > 0 ? "text-[#167d68]" : "text-[#b4483c]")}>{d > 0 ? "+" : ""}{d}</span>}
                  </span>
                  <div className="relative col-span-2 h-2 overflow-hidden rounded-full bg-[#e6ebf2]">
                    {before !== undefined && <div className="absolute inset-y-0 left-0 rounded-full bg-[#c9d5e4]" style={{ width: `${before}%` }} />}
                    <div className="absolute inset-y-0 left-0 rounded-full bg-[#167d68]" style={{ width: `${r.score}%`, opacity: 0.9 }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {state.reset.move.commitment && (
        <Card className="mt-4" eyebrow="My One Money Move" title={state.reset.move.commitment}>
          <p className="text-sm text-[#5f6f86]">{state.reset.move.measure}</p>
        </Card>
      )}

      <div className="mt-6 grid gap-4 print:hidden lg:grid-cols-2">
        <Card>
          <div className="flex items-start gap-3">
            <Award className="mt-0.5 size-5 shrink-0 text-[#167d68]" />
            <div>
              <p className="font-semibold">Proud of your progress?</p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-[#5f6f86]">
                Gory would love to hear it. <a href="/share-your-story" className="font-medium text-[#167d68] underline underline-offset-2">Share your story</a>. Want help with the next 30 days? Learn about the <a href={toolkitBrand.coachingHref} className="font-medium text-[#167d68] underline underline-offset-2">7-Week Money Reset</a> coaching program.
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <p className="font-semibold">Start your next 30 days</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-[#5f6f86]">Today&rsquo;s numbers become your new Day 1 and your steps reset. Your net worth history stays.</p>
          {confirm ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn onClick={() => { update((s) => startReset(s, undefined, true)); setConfirm(false); window.location.hash = "#/reset"; }}>Yes, start a new 30 days</Btn>
              <Btn variant="secondary" onClick={() => setConfirm(false)}>Cancel</Btn>
            </div>
          ) : (
            <Btn variant="secondary" className="mt-3" onClick={() => setConfirm(true)}><RotateCcw className="size-4" /> Start a new 30 days</Btn>
          )}
        </Card>
      </div>
      <p className="mt-4 hidden text-xs text-[#5f6f86] print:block">Money Coach Financial Reset Toolkit · Educational tool only, not financial, investment, tax, legal or insurance advice.</p>
    </div>
  );
}
