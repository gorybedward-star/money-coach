"use client";

import { useMemo } from "react";
import { ArrowRight, Target } from "lucide-react";
import { BENEFIT_ITEMS } from "@/content/toolkit";
import { MODULES, CLOSING_QUESTION, toolkitBrand } from "@/content/toolkit";
import { autoTasks, formatMonth, goalProgress, investedAssets, monthLabel, netWorthHistory, scorecard, toolkitSummary } from "@/lib/toolkit/calc";
import type { ToolkitState } from "@/lib/toolkit/model";
import { useToolkit, go } from "./store";
import { NetWorthArea } from "./charts";
import { NextMoveCard, TodayStepCard, WinsStrip, goalDate } from "./coach";
import { netWorthSeries } from "./net-worth";
import { Btn, Card, Eyebrow, Progress, Ring, Stat, pct, signed, usd } from "./ui";

function Tile({ label, value, sub, progress, href, tone }: { label: string; value: string; sub: string; progress?: number; href: string; tone?: "good" | "bad" }) {
  return (
    <a href={`#/${href}`} className="group block rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-[0_1px_2px_rgba(11,31,58,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-18px_rgba(11,31,58,0.35)]">
      <Stat label={label} value={value} sub={sub} tone={tone} />
      {progress !== undefined && <Progress className="mt-4" value={progress} label={label} />}
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#167d68] opacity-80 group-hover:opacity-100">
        Open <ArrowRight className="size-3" />
      </span>
    </a>
  );
}

export function Dashboard() {
  const { state } = useToolkit();
  const t = toolkitSummary(state);
  const series = useMemo(() => netWorthSeries(state), [state]);
  const hist = netWorthHistory(state.netWorth.snapshots);
  const goal = state.netWorth.goal;
  const gp = goalProgress(t.nw.netWorth, goal);
  const goalMonth = useMemo(() => goalDate(state, t), [state, t]);
  const move = state.reset.move;
  const em = t.emergency;
  const hasDebt = t.progress.current > 0;
  const first = state.name.trim().split(" ")[0];
  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  })();

  return (
    <div>
      <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</Eyebrow>
          <h1 className="mt-1 font-display text-3xl font-semibold leading-tight sm:text-[2.5rem]">
            {greeting}
            {first && state.mode === "own" ? `, ${first}` : ""}.
          </h1>
          <p className="mt-1.5 text-[15px] text-[#5f6f86]">{toolkitBrand.philosophy}</p>
        </div>
      </header>

      {/* 1. Net worth hero */}
      <section className="overflow-hidden rounded-3xl bg-[#0b1f3a] text-white shadow-[0_24px_60px_-30px_rgba(11,31,58,0.7)]">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <Eyebrow className="text-white/60">Current net worth</Eyebrow>
            <p className="mt-2 text-[2.6rem] font-semibold leading-none tabular-nums tracking-tight sm:text-6xl">{usd(t.nw.netWorth)}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {hist.monthly ? (
                <span className="text-[#8cc7b5]">
                  {signed(hist.monthly.change)} <span className="text-white/60">since {formatMonth(hist.monthly.from.month)}</span>
                </span>
              ) : (
                <span className="text-white/60">Save monthly snapshots to see your trend.</span>
              )}
              {hist.annual && (
                <span className="text-[#8cc7b5]">
                  {signed(hist.annual.change)} <span className="text-white/60">over 12 months</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 lg:self-start">
            <Ring value={gp} label="Net worth goal" size={88}>
              <span className="text-base font-semibold tabular-nums">{pct(gp)}</span>
            </Ring>
            <div>
              <Eyebrow className="text-white/60">Goal</Eyebrow>
              <p className="text-lg font-semibold tabular-nums">{goal >= 1_000_000 ? `$${goal / 1_000_000}M` : usd(goal)}</p>
              <p className="text-xs text-white/60">{t.nw.netWorth >= goal ? "Reached" : `${usd(goal - t.nw.netWorth)} to go`}</p>
              {goalMonth !== null && goalMonth > 0 && <p className="mt-1 text-xs font-medium text-[#8cc7b5]">On pace for {monthLabel(goalMonth)}</p>}
            </div>
          </div>
        </div>
        <div className="px-2 pb-4 sm:px-6">
          {series.length >= 2 ? <NetWorthArea data={series} dark height={200} /> : <p className="px-4 pb-6 text-sm text-white/60">Your growth chart starts with your first two monthly snapshots.</p>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-4 sm:px-8">
          <p className="text-sm text-white/70">Net worth = total assets − total liabilities</p>
          <a href="#/net-worth" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8cc7b5] hover:text-white">
            Update net worth <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      <NextMoveCard state={state} t={t} />

      <ConnectedView state={state} t={t} />

      {/* 2-7 */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Tile label="Total assets" value={usd(t.nw.assets)} sub="Cash, investments, retirement, property and more" href="net-worth" />
        <Tile label="Total liabilities" value={usd(t.nw.liabilities)} sub={t.nw.mortgages > 0 ? `Including ${usd(t.nw.mortgages)} in mortgages` : "Everything you owe"} href="net-worth" />
        <Tile label="Monthly cash flow" value={t.pay.income > 0 ? signed(t.pay.available) : "—"} tone={t.pay.available < 0 ? "bad" : undefined} sub={t.pay.income > 0 ? `After bills and debt. ${t.pay.remaining >= 0 ? `${usd(t.pay.remaining)} not yet assigned.` : `${usd(-t.pay.remaining)} over plan.`}` : "Add your paycheck to see this"} href="paycheck" />
        <Tile label="Emergency savings" value={usd(em.current)} sub={`${pct(em.progress)} of your ${em.selected.label.toLowerCase()} goal (${usd(em.selected.target)})${em.months !== null ? ` · ${em.months.toFixed(1)} months covered` : ""}`} progress={em.progress} href="emergency" />
        <Tile label="Debt payoff progress" value={hasDebt ? pct(t.progress.progress) : "Debt-free"} tone={hasDebt ? undefined : "good"} sub={hasDebt ? `${usd(t.progress.paid)} paid off. ${t.plan.neverPaysOff ? "Payments don't cover interest yet." : `Debt-free around ${monthLabel(t.plan.months)}.`}` : "No consumer debts entered"} progress={hasDebt ? t.progress.progress : 1} href="debt" />
        <Tile label="Net worth goal" value={pct(gp)} sub={`Toward ${usd(goal)}`} progress={gp} href="net-worth" />
      </div>

      {/* 8. My One Money Move + today's 30-day step */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
      <Card className="border-[#167d68]/25" pad={false}>
        <div className="grid gap-0 sm:grid-cols-[auto_1fr]">
          <div className="flex items-center gap-3 rounded-t-2xl bg-[#eef6f3] p-5 sm:rounded-l-2xl sm:rounded-tr-none sm:px-6">
            <Target className="size-6 text-[#167d68]" />
            <div>
              <Eyebrow className="text-[#167d68]">My One Money Move</Eyebrow>
              <p className="text-xs text-[#5f6f86]">One action. One deadline.</p>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center sm:px-6">
            {move.commitment ? (
              <div>
                {move.priority && <p className="text-xs font-semibold uppercase tracking-wide text-[#5f6f86]">{move.priority}</p>}
                <p className="mt-0.5 font-display text-lg font-semibold leading-snug">{move.commitment}</p>
                {(move.deadline || move.measure) && (
                  <p className="mt-1 text-[13px] text-[#5f6f86]">
                    {move.deadline && <>By {new Date(move.deadline + "T00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}. </>}
                    {move.measure}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[15px] text-[#33475f]">{CLOSING_QUESTION}</p>
            )}
            <Btn variant="secondary" onClick={() => go("reset")} className="shrink-0">{move.commitment ? "Update" : "Set my move"}</Btn>
          </div>
        </div>
      </Card>
      <TodayStepCard state={state} t={t} />
      </div>

      <WinsStrip state={state} t={t} />

      {/* Modules */}
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <Eyebrow>Your toolkit</Eyebrow>
            <h2 className="mt-1 font-display text-2xl font-semibold">Seven modules, use them in any order</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <a key={m.id} href={`#/${m.id}`} className="group rounded-2xl border border-[#e3e8ef] bg-white p-5 transition hover:border-[#0b1f3a]/30">
              <p className="text-[11px] font-semibold tabular-nums tracking-[0.14em] text-[#167d68]">MODULE {m.n}</p>
              <p className="mt-1.5 font-display text-[17px] font-semibold leading-snug">{m.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#5f6f86]">{m.blurb}</p>
            </a>
          ))}
          <a href="#/reset" className="group flex flex-col justify-between rounded-2xl bg-[#167d68] p-5 text-white">
            <p className="font-display text-[17px] font-semibold leading-snug">New here? Start the 30-Day Money Reset.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">Begin Week 1 <ArrowRight className="size-4 transition group-hover:translate-x-0.5" /></span>
          </a>
        </div>
      </section>

      <p className="mt-10 text-center text-[13px] text-[#5f6f86]">
        Prefer to work with a coach? Money Coach also offers a separate{" "}
        <a href={toolkitBrand.coachingHref} className="font-medium text-[#167d68] underline underline-offset-2">7-Week Money Reset coaching program</a>. Optional; everything here works on its own.
      </p>
    </div>
  );
}

type Summary = ReturnType<typeof toolkitSummary>;

/** The centerpiece: every number is entered once and flows to the modules that need it. */
function ConnectedView({ state, t }: { state: ToolkitState; t: Summary }) {
  const auto = Object.values(autoTasks(state, t)).filter(Boolean).length;
  const score = scorecard(state, BENEFIT_ITEMS.filter((i) => !i.federal || state.benefits.federal).map((i) => i.id)).total;
  const links = [
    { on: state.paycheck.debtFromTracker, from: "Debt Tracker", fromHref: "debt", to: "Paycheck Planner", toHref: "paycheck", value: `${usd(t.trackerMonthly)}/mo`, what: "debt payments" },
    { on: state.netWorth.debtsFromTracker, from: "Debt Tracker", fromHref: "debt", to: "Net Worth", toHref: "net-worth", value: usd(t.progress.current), what: "balances owed" },
    { on: state.emergency.essentialsFromPaycheck, from: "Paycheck Planner", fromHref: "paycheck", to: "Emergency Fund", toHref: "emergency", value: `${usd(t.emergency.essentials)}/mo`, what: "essential expenses" },
    { on: state.emergency.contributionFromPaycheck, from: "Paycheck Planner", fromHref: "paycheck", to: "Emergency Fund", toHref: "emergency", value: `${usd(t.pay.savings)}/mo`, what: "savings contribution" },
    { on: state.emergency.syncToNetWorth, from: "Emergency Fund", fromHref: "emergency", to: "Net Worth", toHref: "net-worth", value: usd(t.emergency.current), what: "cash on hand" },
    { on: state.investing.startFromNetWorth, from: "Net Worth", fromHref: "net-worth", to: "Investing", toHref: "investing", value: usd(investedAssets(t.sheet)), what: "already invested" },
    { on: state.investing.monthlyFromPaycheck, from: "Paycheck Planner", fromHref: "paycheck", to: "Investing", toHref: "investing", value: `${usd(t.pay.investing)}/mo`, what: "monthly investing" },
    { on: true, from: "Every module", fromHref: "dashboard", to: "30-Day Reset", toHref: "reset", value: `${auto} steps`, what: `checked off automatically · Scorecard ${score}/100` },
  ];
  const active = links.filter((l) => l.on).length;
  return (
    <section className="mt-4 rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-[0_1px_2px_rgba(11,31,58,0.04)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow className="text-[#167d68]">One connected financial view</Eyebrow>
          <h2 className="mt-1 font-display text-xl font-semibold">Enter a number once. It updates everywhere.</h2>
        </div>
        <p className="text-xs text-[#5f6f86]">{active} of {links.length} connections synced</p>
      </div>
      <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {links.map((l, i) => (
          <li key={i} className={`rounded-xl border p-3.5 ${l.on ? "border-[#167d68]/20 bg-[#f6fbf9]" : "border-dashed border-[#d5dde8] opacity-60"}`}>
            <p className="flex flex-wrap items-center gap-1 text-[11.5px] font-medium text-[#5f6f86]">
              <a href={`#/${l.fromHref}`} className="hover:text-[#0b1f3a] hover:underline">{l.from}</a>
              <ArrowRight className="size-3 text-[#167d68]" aria-label="flows to" />
              <a href={`#/${l.toHref}`} className="hover:text-[#0b1f3a] hover:underline">{l.to}</a>
            </p>
            <p className="mt-1.5 text-lg font-semibold tabular-nums">{l.on ? l.value : "Off"}</p>
            <p className="text-xs text-[#5f6f86]">{l.what}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
