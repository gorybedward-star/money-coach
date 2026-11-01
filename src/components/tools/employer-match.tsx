"use client";

import { useState } from "react";
import { employerMatch, formatUSD, type MatchTier } from "@/lib/calculators";
import { Label, Select } from "@/components/ui/input";
import { Assumptions, ErrorList, NumberField, PrintButton, Stat, ToolLayout } from "./fields";

const PRESETS: Record<string, { label: string; tiers: MatchTier[] }> = {
  "100-3-50-2": { label: "100% of first 3%, then 50% of next 2% (common)", tiers: [{ matchPct: 100, onUpToPct: 3 }, { matchPct: 50, onUpToPct: 2 }] },
  "100-4": { label: "100% of the first 4%", tiers: [{ matchPct: 100, onUpToPct: 4 }] },
  "100-6": { label: "100% of the first 6%", tiers: [{ matchPct: 100, onUpToPct: 6 }] },
  "50-6": { label: "50% of the first 6%", tiers: [{ matchPct: 50, onUpToPct: 6 }] },
  custom: { label: "Custom formula", tiers: [] },
};

export function EmployerMatchCalculator() {
  const [salary, setSalary] = useState("60000");
  const [rate, setRate] = useState("4");
  const [preset, setPreset] = useState("100-3-50-2");
  const [cMatch, setCMatch] = useState("50");
  const [cUpTo, setCUpTo] = useState("6");

  const tiers = preset === "custom" ? [{ matchPct: Number(cMatch), onUpToPct: Number(cUpTo) }] : PRESETS[preset].tiers;
  const errors: string[] = [];
  if (!(Number(salary) > 0 && Number(salary) <= 10_000_000)) errors.push("Enter a salary between $1 and $10,000,000.");
  if (!(Number(rate) >= 0 && Number(rate) <= 100)) errors.push("Enter a contribution rate between 0% and 100%.");
  if (preset === "custom" && !(Number(cMatch) > 0 && Number(cMatch) <= 200 && Number(cUpTo) > 0 && Number(cUpTo) <= 100))
    errors.push("Enter a match between 1% and 200% on up to 1% to 100% of pay.");
  const r = errors.length ? null : employerMatch({ salary: Number(salary), employeeRatePct: Number(rate), tiers });

  return (
    <ToolLayout
      form={
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-xl font-bold">Your numbers</h2>
          <NumberField label="Annual salary" prefix="$" value={salary} onChange={setSalary} min={0} step={1000} />
          <div>
            <NumberField label="Your contribution" suffix="% of pay" value={rate} onChange={setRate} min={0} max={100} step={0.5} />
            <input type="range" min={0} max={15} step={0.5} value={Number(rate) || 0} onChange={(e) => setRate(e.target.value)} className="mt-3 w-full" aria-label="Contribution slider" />
          </div>
          <div>
            <Label htmlFor="match-preset">Employer matching formula</Label>
            <Select id="match-preset" value={preset} onChange={(e) => setPreset(e.target.value)}>
              {Object.entries(PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
            <p className="mt-1.5 text-xs text-slate-600">Find your formula in your benefits guide or plan summary.</p>
          </div>
          {preset === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <NumberField label="Employer matches" suffix="%" value={cMatch} onChange={setCMatch} min={1} max={200} step={5} />
              <NumberField label="Of the first" suffix="% of pay" value={cUpTo} onChange={setCUpTo} min={1} max={100} step={0.5} />
            </div>
          )}
        </form>
      }
      results={
        <div className="space-y-6">
          <ErrorList errors={errors} />
          {r && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label="Potential employer match / yr" value={formatUSD(r.employer)} emphasis />
                <Stat label="Your contributions / yr" value={formatUSD(r.employee)} />
                <Stat label="Total going in / yr" value={formatUSD(r.total)} />
              </div>
              {r.missed > 0.5 ? (
                <div className="rounded-2xl border border-gold/50 bg-gold-50 p-5 leading-relaxed">
                  <p className="font-semibold">You may be leaving about {formatUSD(r.missed)} a year on the table.</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Under this formula, contributing <strong>{r.fullMatchAt}%</strong> of pay would receive the full potential match of {formatUSD(r.maxEmployer)}/yr.
                    If that isn&rsquo;t affordable yet, consider increasing by 1% at each raise.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-emerald-50 p-5 leading-relaxed">
                  <p className="font-semibold">At {rate}%, you&rsquo;d receive the full potential match under this formula.</p>
                  <p className="mt-1 text-sm text-slate-600">Confirm vesting rules so you know when the employer money is fully yours.</p>
                </div>
              )}
              <div className="rounded-2xl border border-navy/10 bg-white p-5">
                <p className="text-sm font-semibold">Where the money comes from</p>
                <div className="mt-3 flex h-4 overflow-hidden rounded-full bg-ivory-200" role="img" aria-label={`You ${formatUSD(r.employee)}, employer ${formatUSD(r.employer)}`}>
                  <span className="bg-navy" style={{ width: `${r.total ? (r.employee / r.total) * 100 : 0}%` }} />
                  <span className="bg-emerald" style={{ width: `${r.total ? (r.employer / r.total) * 100 : 0}%` }} />
                </div>
                <p className="mt-2 flex gap-4 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-navy" /> You</span>
                  <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald" /> Employer</span>
                </p>
              </div>
              <PrintButton />
            </>
          )}
          <Assumptions
            items={[
              "Assumes the match is calculated on your full salary each pay period. Some plans calculate per paycheck, use a true-up, or exclude bonuses.",
              "IRS annual contribution limits, plan caps, and eligibility waiting periods are not applied.",
              "Employer contributions may be subject to a vesting schedule.",
              "Your plan documents and administrator determine your actual match and eligibility.",
            ]}
          />
        </div>
      }
    />
  );
}
