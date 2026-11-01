"use client";

import { useState } from "react";
import { formatUSD, lifeInsuranceNeeds } from "@/lib/calculators";
import { Assumptions, ErrorList, NumberField, PrintButton, ToolLayout } from "./fields";

export function LifeInsuranceEstimator() {
  const [v, setV] = useState({
    annualIncome: "55000",
    yearsToReplace: "10",
    dependents: "2",
    educationPerChild: "25000",
    mortgageBalance: "180000",
    otherDebts: "12000",
    finalExpenses: "15000",
    existingCoverage: "110000",
    availableAssets: "20000",
  });
  const set = (k: keyof typeof v) => (x: string) => setV((s) => ({ ...s, [k]: x }));
  const n = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, Number(x)])) as Record<keyof typeof v, number>;
  const errors: string[] = [];
  if (Object.values(n).some((x) => !Number.isFinite(x) || x < 0)) errors.push("Enter $0 or more in every field (use 0 if something doesn't apply).");
  if (n.yearsToReplace > 50) errors.push("Enter 50 years or fewer of income replacement.");
  if (!Number.isInteger(n.dependents) || n.dependents > 20) errors.push("Enter a whole number of dependents (0 to 20).");
  const r = errors.length ? null : lifeInsuranceNeeds(n);

  return (
    <ToolLayout
      form={
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-xl font-bold">Your household</h2>
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-wider text-emerald">What your family would need</legend>
            <div className="grid grid-cols-2 gap-4">
              <NumberField label="Income to replace / yr" prefix="$" value={v.annualIncome} onChange={set("annualIncome")} min={0} step={1000} />
              <NumberField label="For how many years" value={v.yearsToReplace} onChange={set("yearsToReplace")} min={0} max={50} step={1} />
              <NumberField label="Children / dependents" value={v.dependents} onChange={set("dependents")} min={0} max={20} step={1} />
              <NumberField label="Education per child" prefix="$" value={v.educationPerChild} onChange={set("educationPerChild")} min={0} step={1000} />
              <NumberField label="Mortgage balance" prefix="$" value={v.mortgageBalance} onChange={set("mortgageBalance")} min={0} step={1000} />
              <NumberField label="Other debts" prefix="$" value={v.otherDebts} onChange={set("otherDebts")} min={0} step={500} />
            </div>
            <NumberField label="Final expenses" prefix="$" value={v.finalExpenses} onChange={set("finalExpenses")} min={0} step={1000} hint="Funeral and end-of-life costs." />
          </fieldset>
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-wider text-emerald">What&rsquo;s already in place</legend>
            <div className="grid grid-cols-2 gap-4">
              <NumberField label="Existing life coverage" prefix="$" value={v.existingCoverage} onChange={set("existingCoverage")} min={0} step={5000} hint="Work + individual." />
              <NumberField label="Savings available" prefix="$" value={v.availableAssets} onChange={set("availableAssets")} min={0} step={1000} hint="That your family could use." />
            </div>
          </fieldset>
        </form>
      }
      results={
        <div className="space-y-6">
          <ErrorList errors={errors} />
          {r && (
            <>
              <div className="rounded-[var(--radius-card)] bg-navy p-6 text-ivory sm:p-8">
                <p className="text-sm text-ivory/75">Illustrative coverage gap</p>
                <p className="mt-1 font-display text-5xl font-bold tabular-nums text-gold sm:text-6xl">{formatUSD(r.gap)}</p>
                <p className="mt-3 leading-relaxed text-ivory/80">
                  {r.gap > 0
                    ? "This is a rough educational starting point for a conversation, not a recommendation to buy a specific amount or type of insurance."
                    : `Based on these inputs, existing coverage and savings exceed the estimated needs by about ${formatUSD(r.surplus)}. Review as your life changes.`}
                </p>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-navy/10 bg-white">
                <table className="w-full min-w-[20rem] text-left text-sm">
                  <tbody className="tabular-nums">
                    <tr className="bg-ivory-200"><th scope="rowgroup" colSpan={2} className="px-5 py-2.5 text-xs uppercase tracking-wider text-slate-600">Estimated needs</th></tr>
                    {r.needs.map((x) => (
                      <tr key={x.label} className="border-t border-navy/5"><th scope="row" className="px-5 py-2.5 font-medium">{x.label}</th><td className="px-5 py-2.5 text-right">{formatUSD(x.value)}</td></tr>
                    ))}
                    <tr className="border-t border-navy/10 font-semibold"><th scope="row" className="px-5 py-2.5">Total needs</th><td className="px-5 py-2.5 text-right">{formatUSD(r.totalNeeds)}</td></tr>
                    <tr className="bg-ivory-200"><th scope="rowgroup" colSpan={2} className="px-5 py-2.5 text-xs uppercase tracking-wider text-slate-600">Resources in place</th></tr>
                    {r.resources.map((x) => (
                      <tr key={x.label} className="border-t border-navy/5"><th scope="row" className="px-5 py-2.5 font-medium">{x.label}</th><td className="px-5 py-2.5 text-right">− {formatUSD(x.value)}</td></tr>
                    ))}
                    <tr className="border-t-2 border-navy/15 font-bold"><th scope="row" className="px-5 py-3">Illustrative gap</th><td className="px-5 py-3 text-right">{formatUSD(r.gap)}</td></tr>
                  </tbody>
                </table>
              </div>
              <PrintButton />
            </>
          )}
          <Assumptions
            items={[
              "This uses a simple needs-based method (income, debts, mortgage, education, final expenses). Professionals use more detailed analyses.",
              "It does not account for inflation, investment returns, taxes, Social Security survivor benefits, a surviving spouse's income, or changing needs over time.",
              "Employer-provided coverage often ends when you leave the job. Consider how much of your coverage is portable.",
              "MONEY COACH does not sell insurance or recommend specific products. Talk with a licensed insurance professional about your situation.",
            ]}
          />
        </div>
      }
    />
  );
}
