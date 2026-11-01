"use client";

import { useState } from "react";
import { emergencyFund, formatUSD, validateEmergencyFund } from "@/lib/calculators";
import { Label, Select } from "@/components/ui/input";
import { Assumptions, ErrorList, NumberField, PrintButton, Stat, ToolLayout } from "./fields";

export function EmergencyFundCalculator() {
  const [essentials, setEssentials] = useState("3200");
  const [savings, setSavings] = useState("1500");
  const [months, setMonths] = useState("3");
  const [saving, setSaving] = useState("300");

  const input = { monthlyEssentials: Number(essentials), currentSavings: Number(savings), targetMonths: Number(months), monthlySaving: Number(saving) };
  const errors = validateEmergencyFund(input);
  const r = errors.length ? null : emergencyFund(input);

  return (
    <ToolLayout
      form={
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-xl font-bold">Your numbers</h2>
          <NumberField label="Monthly essential expenses" prefix="$" value={essentials} onChange={setEssentials} min={0} step={50} hint="Housing, utilities, food, transportation, insurance, minimum debt payments, childcare." />
          <NumberField label="Current emergency savings" prefix="$" value={savings} onChange={setSavings} min={0} step={100} />
          <div>
            <Label htmlFor="ef-months">Target</Label>
            <Select id="ef-months" value={months} onChange={(e) => setMonths(e.target.value)}>
              <option value="1">1 month (starter fund)</option>
              <option value="3">3 months</option>
              <option value="4">4 months</option>
              <option value="6">6 months</option>
              <option value="9">9 months (variable income)</option>
              <option value="12">12 months</option>
            </Select>
          </div>
          <NumberField label="How much you can save each month" prefix="$" value={saving} onChange={setSaving} min={0} step={25} hint="Optional. Used to estimate your timeline." />
        </form>
      }
      results={
        <div className="space-y-6">
          <ErrorList errors={errors} />
          {r && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label="Your reserve target" value={formatUSD(r.target)} emphasis sub={`${months} ${months === "1" ? "month" : "months"} of essentials`} />
                <Stat label="Savings gap" value={formatUSD(r.gap)} />
                <Stat label="You're covered for" value={`${r.monthsCovered.toFixed(1)} mo`} />
              </div>
              <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Progress to goal</span>
                  <span className="tabular-nums text-slate-600">{Math.round(r.progressPct)}%</span>
                </div>
                <div className="mt-3 h-4 overflow-hidden rounded-full bg-ivory-200" role="img" aria-label={`${Math.round(r.progressPct)}% of target saved`}>
                  <div className="h-full rounded-full bg-emerald transition-all duration-500" style={{ width: `${r.progressPct}%` }} />
                </div>
                <p className="mt-4 leading-relaxed">
                  {r.gap === 0 ? (
                    <>You&rsquo;ve reached your target. Nice work. Keep it in a separate account and refill it after you use it.</>
                  ) : r.monthsToGoal ? (
                    <>
                      Saving <strong>{formatUSD(Number(saving))}/month</strong>, you could reach your target in about <strong>{r.monthsToGoal} months</strong>
                      {r.monthsToGoal > 12 ? ` (around ${(r.monthsToGoal / 12).toFixed(1)} years)` : ""}.
                    </>
                  ) : (
                    <>Add a monthly savings amount to see how long it could take to close the gap.</>
                  )}
                </p>
                {Number(savings) < r.starterTarget && Number(months) > 1 && (
                  <p className="mt-3 rounded-xl bg-gold-50 p-3 text-sm">
                    First milestone: a starter fund of <strong>{formatUSD(r.starterTarget)}</strong> (one month of essentials).
                  </p>
                )}
              </div>
              <PrintButton />
            </>
          )}
          <Assumptions
            items={[
              "Three to six months of essential expenses is a common educational guideline. Households with variable income, one earner, or dependents may want more.",
              "Timeline assumes a steady monthly savings amount and does not include interest earned.",
              "Your right reserve depends on your job stability, health, insurance, and family situation.",
            ]}
          />
        </div>
      }
    />
  );
}
