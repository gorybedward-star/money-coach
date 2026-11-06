"use client";

import { useMemo } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { uid, type Debt, type Strategy } from "@/lib/toolkit/model";
import { debtProgress, monthLabel, simulateDebts, underwaterDebts, validateDebt } from "@/lib/toolkit/calc";
import { useToolkit } from "./store";
import { PayoffChart } from "./charts";
import { Btn, Card, SyncBadge, Eyebrow, Learn, NumField, PageHeader, Progress, Segmented, Stat, TextField, Tip, pct, usd } from "./ui";

export function DebtTracker() {
  const { state, update } = useToolkit();
  const plan = state.debt;
  const setPlan = (patch: Partial<typeof plan>) => update((s) => ({ ...s, debt: { ...s.debt, ...patch } }));
  const setDebt = (id: string, patch: Partial<Debt>) =>
    update((s) => ({
      ...s,
      debt: {
        ...s.debt,
        debts: s.debt.debts.map((d) => {
          if (d.id !== id) return d;
          const next = { ...d, ...patch };
          // The starting balance tracks the highest balance seen, so progress never goes negative.
          if (patch.balance !== undefined && patch.balance > next.startBalance) next.startBalance = patch.balance;
          return next;
        }),
      },
    }));

  const sims = useMemo(() => {
    const snowball = simulateDebts(plan.debts, plan.extra, "snowball");
    const avalanche = simulateDebts(plan.debts, plan.extra, "avalanche");
    const minimums = simulateDebts(plan.debts, 0, "avalanche", false);
    return { snowball, avalanche, minimums };
  }, [plan.debts, plan.extra]);
  const chosen = sims[plan.strategy];
  const other = sims[plan.strategy === "snowball" ? "avalanche" : "snowball"];
  const progress = debtProgress(plan.debts);
  const underwater = underwaterDebts(plan.debts);
  const active = plan.debts.filter((d) => d.balance > 0);

  const series = useMemo(() => {
    const len = Math.min(600, Math.max(sims.snowball.balances.length, sims.avalanche.balances.length, sims.minimums.balances.length));
    const step = len > 120 ? 3 : 1;
    const out = [];
    for (let m = 0; m < len; m += step) out.push({ month: m, snowball: sims.snowball.balances[m] ?? 0, avalanche: sims.avalanche.balances[m] ?? 0, minimums: sims.minimums.balances[m] ?? 0 });
    return out;
  }, [sims]);

  return (
    <div>
      <PageHeader n={2} title="Debt Freedom Tracker" intro="List every debt, choose a strategy and see exactly when you'll be free, and how much interest you'll keep.">
        <div className="flex flex-wrap gap-1.5 sm:justify-end">
          {state.paycheck.debtFromTracker && <SyncBadge href="#/paycheck">Payments feed Paycheck Planner</SyncBadge>}
          {state.netWorth.debtsFromTracker && <SyncBadge href="#/net-worth">Balances feed Net Worth</SyncBadge>}
        </div>
      </PageHeader>

      {active.length > 0 && (
        <Card className="mb-4">
          <div className="grid gap-5 sm:grid-cols-4">
            <Stat label="Total owed today" value={usd(progress.current)} />
            <Stat label="Paid off so far" value={usd(progress.paid)} tone="good" sub={`${pct(progress.progress)} of ${usd(progress.start)}`} />
            <Stat label="Debt-free date" value={chosen.neverPaysOff ? "Not yet" : monthLabel(chosen.months)} sub={chosen.neverPaysOff ? "Payments don't cover interest" : `${chosen.months} months`} />
            <Stat label="Monthly toward debt" value={usd(active.reduce((s, d) => s + d.minPayment, 0) + plan.extra)} sub={`Minimums + ${usd(plan.extra)} extra`} />
          </div>
          <Progress className="mt-5" value={progress.progress} label="Debt paid off" />
        </Card>
      )}

      <Card title="Your debts" eyebrow="Mortgages belong in the Net Worth Tracker" action={<Btn variant="ghost" onClick={() => setPlan({ debts: [...plan.debts, { id: uid("d"), name: "", balance: 0, apr: 0, minPayment: 0, startBalance: 0 }] })}><Plus className="size-4" /> Add debt</Btn>}>
        <div className="hidden grid-cols-[1.4fr_1fr_0.7fr_0.9fr_auto] gap-3 px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5f6f86] md:grid">
          <span>Creditor</span><span>Balance</span><span>APR</span><span>Minimum / mo</span><span className="w-10" />
        </div>
        <div className="space-y-3">
          {plan.debts.map((d) => {
            const errs = validateDebt(d);
            const payoff = chosen.perDebt[d.id];
            return (
              <div key={d.id} className="rounded-xl border border-[#eef1f5] p-3 md:border-0 md:p-0">
                <div className="grid grid-cols-2 gap-2 md:grid-cols-[1.4fr_1fr_0.7fr_0.9fr_auto] md:items-center md:gap-3">
                  <div className="col-span-2 md:col-span-1"><TextField ariaLabel="Creditor or debt name" placeholder="e.g. Visa card" compact value={d.name} onChange={(v) => setDebt(d.id, { name: v })} /></div>
                  <NumField ariaLabel="Balance" compact value={d.balance} onChange={(v) => setDebt(d.id, { balance: v })} />
                  <NumField ariaLabel="Interest rate (APR)" compact prefix="" suffix="%" max={100} value={d.apr} onChange={(v) => setDebt(d.id, { apr: v })} />
                  <NumField ariaLabel="Minimum monthly payment" compact value={d.minPayment} onChange={(v) => setDebt(d.id, { minPayment: v })} />
                  <button type="button" aria-label={`Remove ${d.name || "debt"}`} onClick={() => setPlan({ debts: plan.debts.filter((x) => x.id !== d.id) })} className="grid size-10 place-items-center justify-self-end rounded-lg text-[#5f6f86] hover:bg-[#f4f6f9] hover:text-[#b4483c]">
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 px-1 text-xs text-[#5f6f86]">
                  {payoff?.month ? <span>Paid off {monthLabel(payoff.month)} · {usd(payoff.interest)} interest</span> : null}
                  {d.startBalance > d.balance && <span className="text-[#167d68]">{usd(d.startBalance - d.balance)} paid since you started</span>}
                  {errs.map((e) => <span key={e} className="text-[#b4483c]">{e}</span>)}
                </div>
              </div>
            );
          })}
          {!plan.debts.length && <p className="py-6 text-sm text-[#5f6f86]">No debts yet. Add credit cards, car loans, student loans and personal loans.</p>}
        </div>
      </Card>

      {underwater.length > 0 && (
        <div role="alert" className="mt-4 flex gap-3 rounded-2xl border border-[#b4483c]/25 bg-[#b4483c]/5 p-4 text-sm text-[#7a2c24]">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>{underwater.map((d) => d.name || "A debt").join(", ")}: the minimum payment doesn&rsquo;t cover the monthly interest, so the balance would grow on its own. Your extra payment or freed-up minimums need to reach it.</p>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card title="Your plan" eyebrow="Strategy">
          <Segmented label="Payoff strategy" value={plan.strategy} onChange={(v) => setPlan({ strategy: v as Strategy })} options={[{ value: "avalanche", label: "Avalanche" }, { value: "snowball", label: "Snowball" }]} />
          <p className="mt-3 text-[13px] leading-relaxed text-[#5f6f86]">
            {plan.strategy === "avalanche" ? "Highest interest rate first. Usually saves the most money." : "Smallest balance first. Quick wins that build momentum."}
          </p>
          <div className="mt-4">
            <NumField label="Extra payment each month" hint="On top of all minimums, aimed at one debt at a time" value={plan.extra} onChange={(v) => setPlan({ extra: v })} />
          </div>
          {active.length > 0 && (
            <ol className="mt-5 space-y-2">
              {chosen.order.map((id, i) => {
                const d = plan.debts.find((x) => x.id === id)!;
                const m = chosen.perDebt[id]?.month;
                return (
                  <li key={id} className="flex items-center justify-between gap-3 rounded-xl bg-[#f4f6f9] px-3 py-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#0b1f3a] text-[11px] font-semibold text-white">{i + 1}</span>
                      <span className="truncate">{d.name || "Unnamed debt"}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-[#5f6f86]">{m ? monthLabel(m) : "—"}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>

        <Card title="Snowball vs. avalanche" eyebrow="Compare">
          {active.length ? (
            <>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div />
                <Eyebrow>Avalanche</Eyebrow>
                <Eyebrow>Snowball</Eyebrow>
                <span className="text-[#5f6f86]">Debt-free</span>
                <span className="font-semibold tabular-nums">{sims.avalanche.neverPaysOff ? "—" : monthLabel(sims.avalanche.months)}</span>
                <span className="font-semibold tabular-nums">{sims.snowball.neverPaysOff ? "—" : monthLabel(sims.snowball.months)}</span>
                <span className="text-[#5f6f86]">Total interest</span>
                <span className="font-semibold tabular-nums">{usd(sims.avalanche.totalInterest)}</span>
                <span className="font-semibold tabular-nums">{usd(sims.snowball.totalInterest)}</span>
                <span className="text-[#5f6f86]">Saved vs. minimums only</span>
                <span className="font-semibold tabular-nums text-[#167d68]">{sims.minimums.neverPaysOff ? "—" : usd(sims.minimums.totalInterest - sims.avalanche.totalInterest)}</span>
                <span className="font-semibold tabular-nums text-[#167d68]">{sims.minimums.neverPaysOff ? "—" : usd(sims.minimums.totalInterest - sims.snowball.totalInterest)}</span>
              </div>
              <p className="mt-3 text-[13px] text-[#5f6f86]">
                {Math.abs(other.totalInterest - chosen.totalInterest) < 1
                  ? "Both strategies cost about the same with your numbers."
                  : `${plan.strategy === "avalanche" ? "Avalanche" : "Snowball"} ${chosen.totalInterest < other.totalInterest ? "saves" : "costs"} ${usd(Math.abs(other.totalInterest - chosen.totalInterest))} ${chosen.totalInterest < other.totalInterest ? "more than" : "more than"} ${plan.strategy === "avalanche" ? "snowball" : "avalanche"}. The best plan is the one you'll stick with.`}
                {!sims.minimums.neverPaysOff && ` Paying minimums only would take ${sims.minimums.months} months.`}
              </p>
              <div className="mt-4"><PayoffChart series={series} /></div>
            </>
          ) : (
            <p className="py-8 text-sm text-[#5f6f86]">Add a debt to compare strategies.</p>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Tip title="Stop the leak first">While you pay debt down, try not to add new balances. A paused card and a small starter emergency fund keep surprises from undoing your progress.</Tip>
        <Learn title="How these numbers are calculated">
          <p>Each month, interest is added to every balance at its APR ÷ 12. Every debt then gets its minimum payment, and your extra payment goes to the top-priority debt. When a debt is paid off, its minimum rolls into the next one.</p>
          <p>Assumptions: fixed interest rates, no new charges, no fees or promotional rates, and payments made on time every month. Real lender calculations (daily interest, statement dates) will differ slightly. &ldquo;Minimums only&rdquo; assumes each debt gets only its own minimum, with nothing rolled over.</p>
        </Learn>
      </div>
    </div>
  );
}
