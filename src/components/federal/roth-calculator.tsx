"use client";

import { useState } from "react";
import { formatUSD } from "@/lib/calculators";
import { rothVsTraditional, validateRothVsTraditional } from "@/lib/tsp";
import { getLimits, otherRules, SOURCES } from "@/config/federal-rules";
import { Assumptions, ErrorList, NumberField, PrintButton, ToolLayout } from "@/components/tools/fields";
import { NoSensitiveInfo, SourceList } from "./shared";

export function RothVsTraditionalCalculator() {
  const [amount, setAmount] = useState("6000");
  const [years, setYears] = useState("25");
  const [ret, setRet] = useState("6");
  const [taxNow, setTaxNow] = useState("22");
  const [taxLater, setTaxLater] = useState("22");
  const L = getLimits();

  const input = { annualAmount: Number(amount), years: Number(years), annualReturnPct: Number(ret), taxNowPct: Number(taxNow), taxRetirementPct: Number(taxLater) };
  const errors = validateRothVsTraditional(input);
  const r = errors.length ? null : rothVsTraditional(input);
  const scenarios = r
    ? [-10, 0, 10].map((d) => {
        const later = Math.min(60, Math.max(0, Number(taxNow) + d));
        return { label: d < 0 ? "Lower in retirement" : d > 0 ? "Higher in retirement" : "Same in retirement", later, res: rothVsTraditional({ ...input, taxRetirementPct: later }) };
      })
    : [];

  return (
    <ToolLayout
      form={
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-xl font-bold">Illustrative assumptions</h2>
          <NumberField label="Pay directed to the TSP each year" prefix="$" value={amount} onChange={setAmount} min={0} step={500} hint="The pre-tax amount for Traditional. Roth is shown at the same take-home cost." />
          <NumberField label="Years until withdrawal" value={years} onChange={setYears} min={1} max={60} step={1} />
          <NumberField label="Hypothetical annual return" suffix="%" value={ret} onChange={setRet} min={0} max={12} step={0.5} />
          <NumberField label="Assumed tax rate today" suffix="%" value={taxNow} onChange={setTaxNow} min={0} max={60} step={1} hint="Your marginal rate: federal plus state, if any." />
          <NumberField label="Assumed tax rate in retirement" suffix="%" value={taxLater} onChange={setTaxLater} min={0} max={60} step={1} hint="Nobody knows this for certain. Try several values." />
          <NoSensitiveInfo />
        </form>
      }
      results={
        <div className="space-y-6">
          <ErrorList errors={errors} />
          {r && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Side title="Traditional TSP" tone="navy" rows={[
                  ["Goes into the TSP each year", formatUSD(Number(amount))],
                  ["Lowers your take-home pay by about", formatUSD(r.traditional.takeHomeCostPerYear)],
                  ["Illustrative balance", formatUSD(r.traditional.balance)],
                  ["Tax due on withdrawal", `− ${formatUSD(r.traditional.taxOnWithdrawal)}`],
                ]} total={r.traditional.afterTax} />
                <Side title="Roth TSP" tone="emerald" rows={[
                  ["Goes into the TSP each year", formatUSD(r.roth.takeHomeCostPerYear)],
                  ["Lowers your take-home pay by about", formatUSD(r.roth.takeHomeCostPerYear)],
                  ["Illustrative balance", formatUSD(r.roth.balance)],
                  ["Tax due on qualified withdrawal", "$0"],
                ]} total={r.roth.afterTax} />
              </div>

              <div className="rounded-2xl bg-emerald-50 p-5 leading-relaxed">
                {r.higherUnderTheseAssumptions === "equal" ? (
                  <p><strong>Under these assumptions, the after-tax results are about the same.</strong> When the tax rate today equals the tax rate in retirement, Traditional and Roth come out even at the same take-home cost.</p>
                ) : (
                  <p>
                    <strong>Under these assumptions only,</strong> {r.higherUnderTheseAssumptions === "roth" ? "Roth" : "Traditional"} shows about {formatUSD(Math.abs(r.difference))} more after tax,
                    because the assumed retirement tax rate is {Number(taxLater) > Number(taxNow) ? "higher" : "lower"} than today&rsquo;s. Change the assumptions and the result can flip. This does not mean one is better for you.
                  </p>
                )}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-navy/10 bg-white">
                <table className="w-full min-w-[30rem] text-left text-sm">
                  <caption className="px-5 pt-4 text-left font-semibold">Same contribution, three tax futures (today&rsquo;s rate: {taxNow}%)</caption>
                  <thead>
                    <tr className="border-b border-navy/10">
                      <th scope="col" className="px-5 py-3">If your retirement tax rate is</th>
                      <th scope="col" className="px-5 py-3">Traditional, after tax</th>
                      <th scope="col" className="px-5 py-3">Roth, after tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map((s) => (
                      <tr key={s.label} className="border-b border-navy/6 last:border-0">
                        <th scope="row" className="px-5 py-2.5 font-medium">{s.label} ({s.later}%)</th>
                        <td className="px-5 py-2.5 tabular-nums">{formatUSD(s.res.traditional.afterTax)}</td>
                        <td className="px-5 py-2.5 tabular-nums">{formatUSD(s.res.roth.afterTax)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-2xl border border-navy/10 bg-white p-5 text-sm leading-relaxed text-slate-600">
                <p className="font-semibold text-navy">Other differences the math above does not capture</p>
                <ul className="mt-2 list-disc space-y-1.5 pl-5">
                  <li>Both share one elective deferral limit ({formatUSD(L.electiveDeferral)} in {L.year}). A Roth dollar is after tax, so a maxed-out Roth contribution shelters more total value.</li>
                  <li>Agency contributions are always Traditional, so FERS employees have some Traditional money either way.</li>
                  <li>Roth withdrawals are tax-free only if qualified: {otherRules.rothQualifiedYears} years since your first Roth contribution and age 59½, disability, or death.</li>
                  <li>Roth TSP balances have no required minimum distributions during your lifetime (since {otherRules.rothNoLifetimeRmdSince}). Traditional balances generally do, starting at {otherRules.rmdAge}.</li>
                  <li>Traditional contributions lower taxable income today, which can affect credits and deductions.</li>
                </ul>
              </div>
              <PrintButton />
            </>
          )}
          <Assumptions
            items={[
              "Traditional and Roth are compared at the same take-home cost: the Roth contribution equals the Traditional contribution minus the tax it saves today.",
              "Uses one flat marginal tax rate today and one flat rate on all withdrawals. Real tax situations are progressive, change over time, and depend on your other income.",
              "Assumes Roth withdrawals are qualified, and ignores state-specific rules, the IRS 10% additional tax, fees, and investing the Traditional tax savings elsewhere.",
              "Uses a constant hypothetical return. Real returns vary and can be negative.",
              "Educational illustration only. It does not recommend Traditional or Roth. Consider a qualified tax professional for your situation.",
            ]}
          />
          <SourceList sources={[SOURCES.tspRoth, SOURCES.tspLimits, SOURCES.irsRmd]} />
        </div>
      }
    />
  );
}

function Side({ title, rows, total, tone }: { title: string; rows: [string, string][]; total: number; tone: "navy" | "emerald" }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5">
      <p className={`font-display text-xl font-bold ${tone === "navy" ? "text-navy" : "text-emerald"}`}>{title}</p>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-3">
            <dt className="text-slate-600">{k}</dt>
            <dd className="font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 border-t border-navy/10 pt-3">
        <p className="text-sm text-slate-600">Illustrative after-tax value</p>
        <p className="font-display text-3xl font-bold tabular-nums">{formatUSD(total)}</p>
      </div>
    </div>
  );
}
