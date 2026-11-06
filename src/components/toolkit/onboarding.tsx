"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Lock, Plus, Sparkles, Trash2 } from "lucide-react";
import { EXPENSES, FREQUENCIES, GOAL_PRESETS, blankState, monthKey, uid, type Frequency, type ToolkitState } from "@/lib/toolkit/model";
import { effectiveNetWorth, netWorthSummary } from "@/lib/toolkit/calc";
import { toolkitBrand } from "@/content/toolkit";
import { cn } from "@/lib/utils";
import { go, sampleState, useToolkit } from "./store";
import { Btn, Eyebrow, NumField, SelectField, TextField, usd } from "./ui";

type Quick = { cash: number; retirement: number; brokerage: number; vehicle: number; home: number; mortgage: number };
const STEPS = ["Paycheck", "Safety net & debts", "What you own", "Your goal"];

export function Onboarding() {
  const { replace, state } = useToolkit();
  const [step, setStep] = useState(-1);
  const [d, setD] = useState<ToolkitState>(() => ({ ...blankState(), debt: { debts: [{ id: uid("d"), name: "", balance: 0, apr: 0, minPayment: 0, startBalance: 0 }], extra: 0, strategy: "avalanche" } }));
  const [q, setQ] = useState<Quick>({ cash: 0, retirement: 0, brokerage: 0, vehicle: 0, home: 0, mortgage: 0 });

  const finish = () => {
    const debts = d.debt.debts.filter((x) => x.balance > 0).map((x) => ({ ...x, name: x.name || "Debt", startBalance: x.balance }));
    const assets = [
      q.cash && { id: uid("a"), category: "cash" as const, name: "Checking & savings", amount: q.cash },
      q.retirement && { id: uid("a"), category: "retirement" as const, name: "Retirement accounts", amount: q.retirement },
      q.brokerage && { id: uid("a"), category: "brokerage" as const, name: "Brokerage", amount: q.brokerage },
      q.vehicle && { id: uid("a"), category: "vehicle" as const, name: "Vehicle", amount: q.vehicle },
    ].filter(Boolean) as ToolkitState["netWorth"]["assets"];
    const properties = q.home || q.mortgage ? [{ id: uid("p"), name: "Home", value: q.home, mortgage: q.mortgage }] : [];
    // Debts and the emergency fund are entered once and sync into net worth automatically.
    const netWorth = { ...d.netWorth, assets, properties, liabilities: [], snapshots: [] as ToolkitState["netWorth"]["snapshots"] };
    const next: ToolkitState = { ...d, mode: "own", onboarded: true, debt: { ...d.debt, debts }, netWorth };
    const sum = netWorthSummary(effectiveNetWorth(next));
    if (sum.assets > 0 || sum.liabilities > 0) netWorth.snapshots = [{ id: uid("s"), month: monthKey(), assets: sum.assets, liabilities: sum.liabilities }];
    replace(next);
    go("dashboard");
  };

  const set = (fn: (s: ToolkitState) => ToolkitState) => setD(fn);
  const pay = d.paycheck;

  return (
    <div className="min-h-dvh bg-[#0b1f3a] px-4 py-8 text-[#0b1f3a] sm:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8cc7b5]">Money Coach</p>
          <p className="mt-1 font-display text-2xl font-semibold">{toolkitBrand.name}</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-10">
          {step === -1 ? (
            <div className="text-center">
              <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">Your money, in one clear picture.</h1>
              <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[#5f6f86]">{toolkitBrand.philosophy} Set up takes about five minutes. Round numbers are perfect, and you can skip anything.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setStep(0)} className="rounded-2xl bg-[#0b1f3a] p-5 text-left text-white transition hover:bg-[#1d3a63]">
                  <ArrowRight className="mb-3 size-5 text-[#8cc7b5]" />
                  <p className="font-semibold">Enter my numbers</p>
                  <p className="mt-1 text-[13px] text-white/70">A quick, four-step setup</p>
                </button>
                <button type="button" onClick={() => { replace(sampleState()); go("dashboard"); }} className="rounded-2xl border border-[#d5dde8] p-5 text-left transition hover:border-[#0b1f3a]/40">
                  <Sparkles className="mb-3 size-5 text-[#167d68]" />
                  <p className="font-semibold">Explore with sample data</p>
                  <p className="mt-1 text-[13px] text-[#5f6f86]">See a fictional family&rsquo;s toolkit first</p>
                </button>
              </div>
              {state.onboarded && (
                <button type="button" onClick={() => go("dashboard")} className="mt-5 text-sm font-medium text-[#167d68] hover:underline">Back to my dashboard</button>
              )}
              <p className="mt-8 flex items-start justify-center gap-2 text-left text-xs leading-relaxed text-[#5f6f86]">
                <Lock className="mt-0.5 size-3.5 shrink-0" /> Prototype: your entries stay in this browser only. Never enter Social Security numbers, bank logins or account numbers.
              </p>
            </div>
          ) : (
            <div>
              <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Setup progress">
                {STEPS.map((s, i) => (
                  <li key={s} aria-current={i === step ? "step" : undefined}>
                    <div className={cn("h-1.5 rounded-full", i <= step ? "bg-[#167d68]" : "bg-[#e6ebf2]")} />
                    <p className={cn("mt-2 hidden text-[11px] font-medium sm:block", i === step ? "text-[#0b1f3a]" : "text-[#5f6f86]")}>{s}</p>
                  </li>
                ))}
              </ol>

              {step === 0 && (
                <div className="space-y-5">
                  <Header n={1} title="Your paycheck" sub="What lands in your account after taxes and deductions." />
                  <TextField label="Your first name (optional)" value={d.name} onChange={(v) => set((s) => ({ ...s, name: v }))} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField label="Pay frequency" value={pay.frequency} onChange={(v) => set((s) => ({ ...s, paycheck: { ...s.paycheck, frequency: v as Frequency }, emergency: { ...s.emergency, frequency: v as Frequency } }))} options={Object.entries(FREQUENCIES).map(([value, f]) => ({ value: value as Frequency, label: f.label }))} />
                    <NumField label="Take-home pay per paycheck" value={pay.netPay} onChange={(v) => set((s) => ({ ...s, paycheck: { ...s.paycheck, netPay: v } }))} />
                  </div>
                  <div>
                    <Eyebrow>Monthly expenses (estimates are fine)</Eyebrow>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {EXPENSES.map((e) => (
                        <NumField key={e.key} label={e.label} compact value={pay.expenses[e.key]} onChange={(v) => set((s) => ({ ...s, paycheck: { ...s.paycheck, expenses: { ...s.paycheck.expenses, [e.key]: v } } }))} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <Header n={2} title="Safety net and debts" sub="Your emergency savings and anything you owe besides a mortgage." />
                  <NumField label="Emergency savings today" value={d.emergency.current} onChange={(v) => set((s) => ({ ...s, emergency: { ...s.emergency, current: v } }))} />
                  <div>
                    <Eyebrow>Debts</Eyebrow>
                    <div className="mt-3 space-y-3">
                      {d.debt.debts.map((x) => (
                        <div key={x.id} className="grid grid-cols-2 gap-2 rounded-xl border border-[#eef1f5] p-3 sm:grid-cols-[1.3fr_1fr_0.7fr_0.9fr_auto] sm:items-end">
                          <div className="col-span-2 sm:col-span-1"><TextField label="Name" compact placeholder="e.g. Visa" value={x.name} onChange={(v) => set((s) => ({ ...s, debt: { ...s.debt, debts: s.debt.debts.map((y) => (y.id === x.id ? { ...y, name: v } : y)) } }))} /></div>
                          <NumField label="Balance" compact value={x.balance} onChange={(v) => set((s) => ({ ...s, debt: { ...s.debt, debts: s.debt.debts.map((y) => (y.id === x.id ? { ...y, balance: v } : y)) } }))} />
                          <NumField label="APR" compact prefix="" suffix="%" max={100} value={x.apr} onChange={(v) => set((s) => ({ ...s, debt: { ...s.debt, debts: s.debt.debts.map((y) => (y.id === x.id ? { ...y, apr: v } : y)) } }))} />
                          <NumField label="Min / mo" compact value={x.minPayment} onChange={(v) => set((s) => ({ ...s, debt: { ...s.debt, debts: s.debt.debts.map((y) => (y.id === x.id ? { ...y, minPayment: v } : y)) } }))} />
                          <button type="button" aria-label="Remove debt" onClick={() => set((s) => ({ ...s, debt: { ...s.debt, debts: s.debt.debts.filter((y) => y.id !== x.id) } }))} className="grid size-10 place-items-center justify-self-end rounded-lg text-[#5f6f86] hover:bg-[#f4f6f9]"><Trash2 className="size-4" /></button>
                        </div>
                      ))}
                      <Btn variant="ghost" onClick={() => set((s) => ({ ...s, debt: { ...s.debt, debts: [...s.debt.debts, { id: uid("d"), name: "", balance: 0, apr: 0, minPayment: 0, startBalance: 0 }] } }))}><Plus className="size-4" /> Add another debt</Btn>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <Header n={3} title="What you own" sub="Your debts and emergency fund already sync in from step 2. Add the rest and we'll build your first net worth snapshot." />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <NumField label="Checking & other savings" hint="Not counting your emergency fund, which syncs in from step 2" value={q.cash} onChange={(v) => setQ({ ...q, cash: v })} />
                    <NumField label="Retirement (TSP, 401(k), IRA)" value={q.retirement} onChange={(v) => setQ({ ...q, retirement: v })} />
                    <NumField label="Other investments" value={q.brokerage} onChange={(v) => setQ({ ...q, brokerage: v })} />
                    <NumField label="Vehicles (resale value)" value={q.vehicle} onChange={(v) => setQ({ ...q, vehicle: v })} />
                    <NumField label="Home value (if you own)" value={q.home} onChange={(v) => setQ({ ...q, home: v })} />
                    <NumField label="Mortgage balance" value={q.mortgage} onChange={(v) => setQ({ ...q, mortgage: v })} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <Header n={4} title="Your first goal" sub="Pick a net worth goal and one small move to start this week." />
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {GOAL_PRESETS.map((g) => (
                      <button key={g} type="button" aria-pressed={d.netWorth.goal === g} onClick={() => set((s) => ({ ...s, netWorth: { ...s.netWorth, goal: g } }))} className={cn("rounded-xl border px-3 py-3 text-sm font-semibold tabular-nums", d.netWorth.goal === g ? "border-[#0b1f3a] bg-[#0b1f3a] text-white" : "border-[#d5dde8]")}>
                        {g >= 1_000_000 ? "$1M" : usd(g)}
                      </button>
                    ))}
                  </div>
                  <NumField label="Or a custom goal" value={(GOAL_PRESETS as readonly number[]).includes(d.netWorth.goal) ? 0 : d.netWorth.goal} onChange={(v) => v > 0 && set((s) => ({ ...s, netWorth: { ...s.netWorth, goal: v } }))} />
                  <TextField label="My One Money Move" placeholder="e.g. Set up a $50 automatic transfer to savings every payday" value={d.reset.move.commitment} onChange={(v) => set((s) => ({ ...s, reset: { ...s.reset, move: { ...s.reset.move, commitment: v } } }))} />
                </div>
              )}

              <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#eef1f5] pt-6">
                <Btn variant="secondary" onClick={() => setStep(step - 1)}><ArrowLeft className="size-4" /> Back</Btn>
                <div className="flex gap-2">
                  {step < 3 && <Btn variant="ghost" onClick={() => setStep(step + 1)}>Skip</Btn>}
                  <Btn onClick={() => (step < 3 ? setStep(step + 1) : finish())}>{step < 3 ? "Continue" : "Open my dashboard"} <ArrowRight className="size-4" /></Btn>
                </div>
              </div>
            </div>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-white/50">Educational tool only. Not financial, investment, tax, legal or insurance advice.</p>
      </div>
    </div>
  );
}

function Header({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <div>
      <Eyebrow className="text-[#167d68]">Step {n} of 4</Eyebrow>
      <h2 className="mt-1 font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-[#5f6f86]">{sub}</p>
    </div>
  );
}
