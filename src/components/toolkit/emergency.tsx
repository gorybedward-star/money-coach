"use client";

import { CheckCircle2 } from "lucide-react";
import { FREQUENCIES, type EmergencyGoal, type Frequency } from "@/lib/toolkit/model";
import { monthLabel, toolkitSummary } from "@/lib/toolkit/calc";
import { useToolkit } from "./store";
import { Card, Eyebrow, Learn, NumField, PageHeader, Progress, SelectField, SyncBadge, SyncToggle, Tip, usd } from "./ui";

function duration(m: number | null) {
  if (m === null) return "Add your essentials";
  if (m === 0) return "Reached";
  if (!Number.isFinite(m)) return "Add a contribution";
  const y = Math.floor(m / 12);
  const r = m % 12;
  return `${y ? `${y} yr ` : ""}${r ? `${r} mo` : ""}`.trim() + ` · ${monthLabel(m)}`;
}

export function EmergencyFund() {
  const { state, update } = useToolkit();
  const e = state.emergency;
  const t = toolkitSummary(state);
  const s = t.emergency;
  const set = (patch: Partial<typeof e>) => update((st) => ({ ...st, emergency: { ...st.emergency, ...patch } }));

  return (
    <div>
      <PageHeader n={3} title="Emergency Fund Builder" intro="Cash set aside for real emergencies, like a job loss, a car repair or a medical bill, so a surprise doesn't become new debt." />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card title="Your numbers" eyebrow="Inputs">
          <div className="space-y-4">
            <div>
              <NumField label="Current emergency savings" value={e.current} onChange={(v) => set({ current: v })} />
              <SyncToggle checked={e.syncToNetWorth} onChange={(v) => set({ syncToNetWorth: v })}>Count it as cash in my Net Worth</SyncToggle>
            </div>
            <div>
              <NumField label="Essential monthly expenses" hint={e.essentialsFromPaycheck ? "Housing, transportation, utilities, groceries, insurance and debt minimums from your Paycheck Planner" : "What you'd need each month to cover the basics"} value={s.essentials} onChange={(v) => set({ essentials: v, essentialsFromPaycheck: false })} />
              <SyncToggle checked={e.essentialsFromPaycheck} onChange={(v) => set({ essentialsFromPaycheck: v })}>Use my Paycheck Planner essentials</SyncToggle>
            </div>
            {e.contributionFromPaycheck ? (
              <div>
                <p className="mb-1.5 text-[13px] font-medium">Savings contribution</p>
                <div className="flex items-center justify-between rounded-xl border border-dashed border-[#167d68]/30 bg-[#f6fbf9] px-3.5 py-2.5">
                  <span className="whitespace-nowrap text-[15px] font-semibold tabular-nums">{usd(s.monthly)}/mo</span>
                  <SyncBadge from="Paycheck Planner" href="#/paycheck" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <NumField label="Savings contribution" value={e.contribution} onChange={(v) => set({ contribution: v })} />
                <SelectField label="How often" value={e.frequency} onChange={(v) => set({ frequency: v as Frequency })} options={Object.entries(FREQUENCIES).map(([value, f]) => ({ value: value as Frequency, label: f.label }))} />
              </div>
            )}
            <div className="-mt-2">
              <SyncToggle checked={e.contributionFromPaycheck} onChange={(v) => set({ contributionFromPaycheck: v })}>Use the Savings line from my Paycheck Planner</SyncToggle>
              {!e.contributionFromPaycheck && <p className="mt-2 text-[13px] text-[#5f6f86]">That&rsquo;s about <strong className="text-[#0b1f3a]">{usd(s.monthly)}</strong> a month.</p>}
            </div>
            <NumField label="Starter milestone" hint="Many people start with $1,000. Change it to fit your life." value={e.starterGoal} onChange={(v) => set({ starterGoal: v })} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="bg-[#0b1f3a] text-white">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <Eyebrow className="text-white/60">Months covered</Eyebrow>
                <p className="mt-1.5 text-4xl font-semibold tabular-nums">{s.months === null ? "—" : s.months.toFixed(1)}</p>
                <p className="mt-1 text-xs text-white/60">If income stopped today</p>
              </div>
              <div>
                <Eyebrow className="text-white/60">Saved</Eyebrow>
                <p className="mt-1.5 text-4xl font-semibold tabular-nums">{usd(s.current)}</p>
                <p className="mt-1 text-xs text-white/60">Essentials: {usd(s.essentials)}/mo</p>
              </div>
            </div>
          </Card>

          <Card title="Your milestones" eyebrow="Choose the goal shown on your dashboard">
            <div className="space-y-3" role="radiogroup" aria-label="Emergency fund goal">
              {s.goals.map((g) => {
                const reached = s.current >= g.target && g.target > 0;
                const selected = e.goal === g.id;
                return (
                  <button key={g.id} type="button" role="radio" aria-checked={selected} onClick={() => set({ goal: g.id as EmergencyGoal })} className={`block w-full rounded-xl border p-4 text-left transition ${selected ? "border-[#0b1f3a] ring-2 ring-[#0b1f3a]/10" : "border-[#e3e8ef] hover:border-[#0b1f3a]/30"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 font-medium">
                        {reached && <CheckCircle2 className="size-4 text-[#167d68]" />}
                        {g.label}
                      </span>
                      <span className="font-semibold tabular-nums">{usd(g.target)}</span>
                    </div>
                    <Progress className="mt-3" value={g.target > 0 ? s.current / g.target : 0} label={g.label} tone={reached ? "green" : "navy"} />
                    <p className="mt-2 text-xs text-[#5f6f86]">{reached ? "Reached. Nice work." : `Time to reach: ${duration(g.months)}`}</p>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Tip title="Keep it separate and boring">Keep your emergency fund in a separate savings account you don&rsquo;t see every day, ideally one that pays interest. It&rsquo;s insurance, not an investment, so safety and quick access matter more than return.</Tip>
        <div className="space-y-2">
          <Learn title="Three months or six?">
            <p>Three months of essentials is a common target for steady, two-income households. Six months or more makes sense if your income varies, you&rsquo;re the only earner, or your industry has layoffs.</p>
          </Learn>
          <Learn title="How the time estimate works">
            <p>We convert your contribution to a monthly amount (for example, every two weeks × 26 ÷ 12) and divide what&rsquo;s left to save by it. It doesn&rsquo;t include interest earned, so you may get there a little sooner.</p>
          </Learn>
          <Learn title="Emergency funds and protection">
            <p>Cash covers short-term surprises. Health, disability and life insurance protect against the big ones. Review your coverage in the Employee Benefits Checklist.</p>
          </Learn>
        </div>
      </div>
    </div>
  );
}
