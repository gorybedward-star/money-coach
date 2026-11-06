"use client";

import { useMemo } from "react";
import { projectGrowth, toolkitSummary } from "@/lib/toolkit/calc";
import { useToolkit } from "./store";
import { GrowthChart } from "./charts";
import { Card, Learn, NumField, PageHeader, Stat, SyncBadge, SyncToggle, Tip, usd } from "./ui";

export function InvestingCalculator() {
  const { state, update } = useToolkit();
  const i = state.investing;
  const set = (patch: Partial<typeof i>) => update((s) => ({ ...s, investing: { ...s.investing, ...patch } }));
  const t = toolkitSummary(state);
  const eff = t.investing;
  const g = useMemo(() => projectGrowth(eff), [eff]);
  const yearsErr = i.years > 60 ? "Use 60 years or fewer." : null;

  return (
    <div>
      <PageHeader n={4} title="Investing Calculator" intro="An educational look at how steady contributions and compound growth can work together over time." />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <Card title="Assumptions" eyebrow="Inputs">
          <div className="space-y-4">
            <div>
              {i.startFromNetWorth ? <Synced label="Starting balance" value={usd(eff.start)} from="Net Worth" href="#/net-worth" /> : <NumField label="Starting balance" value={i.start} onChange={(v) => set({ start: v })} />}
              <SyncToggle checked={i.startFromNetWorth} onChange={(v) => set({ startFromNetWorth: v })}>Use my brokerage and retirement balances from Net Worth</SyncToggle>
            </div>
            <div>
              {i.monthlyFromPaycheck ? <Synced label="Monthly contribution" value={`${usd(eff.monthly)} / month`} from="Paycheck Planner" href="#/paycheck" /> : <NumField label="Monthly contribution" value={i.monthly} onChange={(v) => set({ monthly: v })} />}
              <SyncToggle checked={i.monthlyFromPaycheck} onChange={(v) => set({ monthlyFromPaycheck: v })}>Use the Investing line from my Paycheck Planner</SyncToggle>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Hypothetical annual return" prefix="" suffix="%" max={20} value={i.returnPct} onChange={(v) => set({ returnPct: v })} />
              <NumField label="Years" prefix="" suffix="yrs" max={60} error={yearsErr} value={i.years} onChange={(v) => set({ years: Math.round(v) })} />
            </div>
            <div>
              <NumField label="Inflation assumption (optional)" prefix="" suffix="%" max={15} value={i.inflationPct} onChange={(v) => set({ inflationPct: v })} />
              <label className="mt-2 flex items-center gap-2 text-xs text-[#33475f]">
                <input type="checkbox" className="size-4 accent-[#167d68]" checked={i.showReal} onChange={(e) => set({ showReal: e.target.checked })} />
                Also show the result in today&rsquo;s dollars
              </label>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <Stat label="Projected balance" value={usd(g.final)} tone="good" sub={`After ${Math.round(i.years)} years`} />
              <Stat label="Your contributions" value={usd(g.contributions)} sub="Starting balance + deposits" />
              <Stat label="Hypothetical growth" value={usd(g.growth)} sub={g.final > 0 ? `${Math.round((g.growth / g.final) * 100)}% of the total` : undefined} />
              {i.showReal ? <Stat label="In today's dollars" value={usd(g.real)} sub={`At ${i.inflationPct}% inflation`} /> : <Stat label="Monthly deposit" value={usd(eff.monthly)} />}
            </div>
            <div className="mt-6"><GrowthChart data={g.rows} showReal={i.showReal} /></div>
            <p className="mt-3 rounded-xl bg-[#f4f6f9] p-3 text-xs leading-relaxed text-[#5f6f86]">
              <strong className="text-[#0b1f3a]">Hypothetical illustration only.</strong> Assumes a constant {i.returnPct}% annual return compounded monthly, with deposits at the end of each month, and no taxes or fees. Real markets go up and down, sometimes sharply, and returns are never guaranteed. This is not a projection of any specific investment.
            </p>
          </Card>

          <details className="rounded-2xl border border-[#e3e8ef] bg-white p-5">
            <summary className="cursor-pointer font-medium">Year-by-year table</summary>
            <div className="mt-3 max-h-80 overflow-auto">
              <table className="w-full text-right text-sm tabular-nums">
                <thead className="sticky top-0 bg-white text-[11px] uppercase tracking-[0.12em] text-[#5f6f86]">
                  <tr><th className="py-2 text-left">Year</th><th>Contributions</th><th>Growth</th><th>Balance</th>{i.showReal && <th>Today&rsquo;s $</th>}</tr>
                </thead>
                <tbody className="divide-y divide-[#eef1f5]">
                  {g.rows.slice(1).map((r) => (
                    <tr key={r.year}><td className="py-1.5 text-left">{r.year}</td><td>{usd(r.contributions)}</td><td>{usd(r.growth)}</td><td className="font-medium">{usd(r.balance)}</td>{i.showReal && <td>{usd(r.real)}</td>}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Tip title="Consistency beats timing">Investing the same amount on a schedule, every month, through ups and downs, is called dollar-cost averaging. It removes the guesswork of trying to time the market.</Tip>
        <div className="space-y-2">
          <Learn title="What is compounding?">
            <p>Compounding is growth on top of growth. If your investments earn a return, that return can earn its own return the next year. Time is the biggest ingredient, which is why starting early matters more than starting big.</p>
          </Learn>
          <Learn title="What are broad-market ETFs?">
            <p>An exchange-traded fund (ETF) holds many investments in one share. A broad-market index ETF tracks a large slice of the market, such as the whole U.S. stock market, so one purchase can spread your money across hundreds or thousands of companies, usually at a low cost.</p>
          </Learn>
          <Learn title="Why diversification matters">
            <p>Diversification means not putting all your eggs in one basket. Spreading money across many companies, industries and types of investments can reduce the damage any single one can do. It doesn&rsquo;t eliminate risk or guarantee a profit.</p>
          </Learn>
          <Learn title="What this calculator doesn't do">
            <p>Money Coach does not recommend specific securities, funds or allocations. Your choices depend on your goals, timeline and comfort with risk. For individualized advice, talk with a licensed financial professional.</p>
          </Learn>
        </div>
      </div>
    </div>
  );
}

function Synced({ label, value, from, href }: { label: string; value: string; from: string; href: string }) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium">{label}</p>
      <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-[#167d68]/30 bg-[#f6fbf9] px-3.5 py-2.5">
        <span className="whitespace-nowrap text-[15px] font-semibold tabular-nums">{value}</span>
        <SyncBadge from={from} href={href} />
      </div>
    </div>
  );
}
