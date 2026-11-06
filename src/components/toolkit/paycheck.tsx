"use client";

import { EXPENSES, FREQUENCIES, type Frequency } from "@/lib/toolkit/model";
import { paycheckSummary, debtTrackerMonthly } from "@/lib/toolkit/calc";
import { useToolkit } from "./store";
import { Donut } from "./charts";
import { C, Card, SyncBadge, SyncToggle, Learn, Legend, NumField, PageHeader, SelectField, Stat, Tip, pct, signed, usd } from "./ui";

const SLICE_COLORS: Record<string, string> = {
  housing: C.navy,
  transportation: C.navy2,
  utilities: C.steel,
  groceries: "#7f98bb",
  insurance: "#a9bbd2",
  other: C.mist,
  debt: C.gold,
  savings: C.green,
  investing: "#4fa58c",
  remaining: "#e6ebf2",
};

export function PaycheckPlanner() {
  const { state, update } = useToolkit();
  const p = state.paycheck;
  const tracker = debtTrackerMonthly(state.debt.debts, state.debt.extra);
  const s = paycheckSummary(p, tracker);
  const set = (patch: Partial<typeof p>) => update((st) => ({ ...st, paycheck: { ...st.paycheck, ...patch } }));
  const setExp = (key: keyof typeof p.expenses, v: number) => update((st) => ({ ...st, paycheck: { ...st.paycheck, expenses: { ...st.paycheck.expenses, [key]: v } } }));
  const perYear = FREQUENCIES[p.frequency].perYear;

  return (
    <div>
      <PageHeader n={1} title="Paycheck Planner" intro="Start with what actually lands in your account. Then decide, on purpose, where every dollar goes." />

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-4">
          <Card title="Your paycheck" eyebrow="Income">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="How often are you paid?" value={p.frequency} onChange={(v) => set({ frequency: v as Frequency })} options={Object.entries(FREQUENCIES).map(([value, f]) => ({ value: value as Frequency, label: f.label }))} />
              <NumField label="Take-home pay per paycheck" hint="After taxes and payroll deductions" value={p.netPay} onChange={(v) => set({ netPay: v })} />
            </div>
            <p className="mt-3 text-[13px] text-[#5f6f86]">
              {perYear} paychecks a year × {usd(p.netPay)} ÷ 12 = <strong className="text-[#0b1f3a]">{usd(s.income)}</strong> a month.
              {p.frequency === "biweekly" || p.frequency === "weekly" ? " Some months have an extra paycheck; this averages them out." : ""}
            </p>
          </Card>

          <Card title="Monthly expenses" eyebrow="Spending">
            <div className="grid gap-4 sm:grid-cols-2">
              {EXPENSES.map((e) => (
                <NumField key={e.key} label={e.label} hint={e.hint} value={p.expenses[e.key]} onChange={(v) => setExp(e.key, v)} />
              ))}
            </div>
          </Card>

          <Card title="Debt, savings and investing" eyebrow="Monthly allocations">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <NumField label="Debt payments" value={p.debtFromTracker ? tracker : p.debtPayments} onChange={(v) => set({ debtPayments: v, debtFromTracker: false })} hint={p.debtFromTracker ? "From your Debt Freedom Tracker" : "Entered here"} />
                <SyncToggle checked={p.debtFromTracker} onChange={(v) => set({ debtFromTracker: v })}>Use Debt Tracker total</SyncToggle>
              </div>
              <div><NumField label="Savings" hint="Emergency fund and goals" value={p.savings} onChange={(v) => set({ savings: v })} />{state.emergency.contributionFromPaycheck && <div className="mt-2"><SyncBadge href="#/emergency">Feeds Emergency Fund</SyncBadge></div>}</div>
              <div><NumField label="Investing" hint="IRA, brokerage, extra retirement" value={p.investing} onChange={(v) => set({ investing: v })} />{state.investing.monthlyFromPaycheck && <div className="mt-2"><SyncBadge href="#/investing">Feeds Investing Calculator</SyncBadge></div>}</div>
            </div>
            <p className="mt-3 text-xs text-[#5f6f86]">Payroll retirement contributions like a 401(k) or TSP come out before your take-home pay, so don&rsquo;t count them here.</p>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card title="Where your money goes" eyebrow="Monthly plan">
            {s.income > 0 ? (
              <>
                <Donut data={s.slices.map((x) => ({ label: x.label, amount: x.amount, color: SLICE_COLORS[x.key] }))} center={{ top: usd(s.income), bottom: "take-home" }} />
                <div className="mt-4">
                  <Legend items={s.slices.map((x) => ({ color: SLICE_COLORS[x.key], label: x.label, value: `${usd(x.amount)} · ${pct(x.amount / s.income)}` }))} />
                </div>
              </>
            ) : (
              <p className="py-10 text-center text-sm text-[#5f6f86]">Enter your take-home pay to see your plan.</p>
            )}
          </Card>

          <Card>
            <div className="grid grid-cols-2 gap-5">
              <Stat label="Monthly take-home" value={usd(s.income)} />
              <Stat label="Monthly expenses" value={usd(s.expenses)} />
              <Stat label="Available cash flow" value={signed(s.available)} tone={s.available < 0 ? "bad" : "good"} sub="Take-home minus expenses and debt" />
              <Stat label="Savings rate" value={pct(s.savingsRate, 1)} sub="Savings + investing ÷ take-home" />
            </div>
            <div className={`mt-5 rounded-xl p-4 ${s.remaining < 0 ? "bg-[#b4483c]/8 text-[#7a2c24]" : "bg-[#eef6f3] text-[#0b1f3a]"}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">Left after planned allocations</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{signed(s.remaining)}</p>
              <p className="mt-1 text-[13px] opacity-80">
                {s.income <= 0 ? "Add your income to begin." : s.remaining < 0 ? "Your plan spends more than you bring home. Trim an expense or lower an allocation until this is $0 or more." : s.remaining === 0 ? "Every dollar has a job. That's a zero-based plan." : "Give these dollars a job: extra debt payment, savings or investing."}
              </p>
            </div>
          </Card>

          <Tip title="Automate it">Pay yourself first. Set an automatic transfer to savings for the day your paycheck lands, so saving happens before spending. Even $25 a paycheck builds the habit.</Tip>
        </div>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <Learn title="What's a good savings rate?">
          <p>Many people aim to save and invest 15% or more of their income over time, counting any workplace retirement contributions. If that feels far away, start with 1% to 5% and raise it with every raise.</p>
        </Learn>
        <Learn title="Why use monthly numbers?">
          <p>Most bills are monthly, so converting your pay to a monthly average makes the plan easy to compare. Example: $2,000 every two weeks is $2,000 × 26 ÷ 12 = $4,333 a month.</p>
        </Learn>
      </div>
    </div>
  );
}
