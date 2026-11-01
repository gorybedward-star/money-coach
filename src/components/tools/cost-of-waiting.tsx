"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { costOfWaiting, formatUSD, validateCostOfWaiting } from "@/lib/calculators";
import { Assumptions, ErrorList, NumberField, ToolLayout } from "./fields";
import { GrowthChart } from "./growth-chart";

export function CostOfWaitingCalculator() {
  const [currentAge, setCurrentAge] = useState("25");
  const [waitAge, setWaitAge] = useState("35");
  const [retirementAge, setRetirementAge] = useState("65");
  const [monthly, setMonthly] = useState("200");
  const [rate, setRate] = useState("7");

  const input = {
    currentAge: Number(currentAge),
    waitAge: Number(waitAge),
    retirementAge: Number(retirementAge),
    monthlyInvestment: Number(monthly),
    annualReturnPct: Number(rate),
  };
  const errors = validateCostOfWaiting(input);
  const r = useMemo(() => (errors.length ? null : costOfWaiting(input)), [currentAge, waitAge, retirementAge, monthly, rate]); // eslint-disable-line react-hooks/exhaustive-deps
  const yearsWaited = input.waitAge - input.currentAge;

  return (
    <ToolLayout
      form={
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-xl font-bold">Your numbers</h2>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Current age" value={currentAge} onChange={setCurrentAge} min={14} max={90} step={1} invalid={errors.some((e) => e.includes("current age"))} />
            <NumberField label="Age if you wait" value={waitAge} onChange={setWaitAge} min={15} max={95} step={1} invalid={errors.some((e) => e.includes("wait"))} />
          </div>
          <NumberField label="Retirement age" value={retirementAge} onChange={setRetirementAge} min={30} max={100} step={1} invalid={errors.some((e) => e.includes("Retirement"))} />
          <NumberField label="Monthly investment" prefix="$" value={monthly} onChange={setMonthly} min={1} step={25} invalid={errors.some((e) => e.includes("monthly"))} />
          <div>
            <NumberField label="Hypothetical annual return" suffix="%" value={rate} onChange={setRate} min={0} max={15} step={0.5} invalid={errors.some((e) => e.includes("return"))} hint="A hypothetical, constant rate for illustration only. Try a few different rates." />
            <input type="range" min={0} max={12} step={0.5} value={Number(rate) || 0} onChange={(e) => setRate(e.target.value)} className="mt-3 w-full" aria-label="Hypothetical return slider" />
          </div>
        </form>
      }
      results={
        <div className="space-y-6">
          <ErrorList errors={errors} />
          {r && (
            <>
              <div className="rounded-[var(--radius-card)] bg-navy p-6 text-ivory sm:p-8">
                <p className="text-sm text-ivory/75">Hypothetical cost of waiting {yearsWaited} {yearsWaited === 1 ? "year" : "years"}</p>
                <p className="mt-1 font-display text-5xl font-bold tabular-nums text-gold sm:text-6xl">{formatUSD(r.costOfWaiting)}</p>
                <p className="mt-3 leading-relaxed text-ivory/80">
                  Waiting means investing {formatUSD(r.startNow.contributions - r.wait.contributions)} less of your own money, but the
                  modeled difference at age {input.retirementAge} is {formatUSD(r.costOfWaiting)}. That gap is mostly lost years of compound growth.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ScenarioCard title={`Start now at ${input.currentAge}`} s={r.startNow} accent="emerald" />
                <ScenarioCard title={`Wait until ${input.waitAge}`} s={r.wait} accent="gold" />
              </div>

              <GrowthChart
                title="Modeled balance by age"
                xLabels={r.series.map((p) => p.age)}
                series={[
                  { key: "now", label: `Start at ${input.currentAge}`, color: "#167D68", values: r.series.map((p) => p.startNow) },
                  { key: "wait", label: `Start at ${input.waitAge}`, color: "#C9A45C", values: r.series.map((p) => p.wait) },
                ]}
              />

              <div className="rounded-2xl bg-emerald-50 p-5 text-sm leading-relaxed">
                To reach the same modeled balance starting at {input.waitAge}, you would need to invest about{" "}
                <strong>{formatUSD(r.monthlyNeededToCatchUp)}/month</strong> instead of {formatUSD(input.monthlyInvestment)}. Starting small now can be easier
                than catching up later. <Link href="/tools/pay-yourself-first" className="font-semibold text-emerald underline">Find your pay-yourself-first amount</Link>.
              </div>
            </>
          )}
          <Assumptions
            items={[
              "Contributions are made monthly at the end of each month and the hypothetical return is constant and compounded monthly. Real investment returns vary year to year, can be negative, and are not guaranteed.",
              "Taxes, fees, inflation, and changes in contribution amounts are not included. Fees and inflation would reduce real results.",
              "“Start now” begins contributions at your current age. “Wait” begins at the age you entered. Both stop at retirement age.",
              "This is a hypothetical illustration for education. It does not represent any specific investment and is not a recommendation.",
            ]}
          />
        </div>
      }
    />
  );
}

function ScenarioCard({ title, s, accent }: { title: string; s: ReturnType<typeof costOfWaiting>["startNow"]; accent: "emerald" | "gold" }) {
  const contribShare = s.balance > 0 ? (s.contributions / s.balance) * 100 : 100;
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5">
      <p className="flex items-center gap-2 font-semibold">
        <span className={`size-2.5 rounded-full ${accent === "emerald" ? "bg-emerald" : "bg-gold"}`} /> {title}
      </p>
      <p className="mt-3 font-display text-3xl font-bold tabular-nums">{formatUSD(s.balance)}</p>
      <p className="text-xs text-slate-600">modeled balance after {s.years} years</p>
      <span aria-hidden className="mt-4 flex h-2 overflow-hidden rounded-full bg-ivory-200">
        <span className="bg-navy" style={{ width: `${contribShare}%` }} />
        <span className={accent === "emerald" ? "bg-emerald" : "bg-gold"} style={{ width: `${100 - contribShare}%` }} />
      </span>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div><dt className="text-slate-600">Your contributions</dt><dd className="font-semibold tabular-nums">{formatUSD(s.contributions)}</dd></div>
        <div><dt className="text-slate-600">Modeled growth</dt><dd className="font-semibold tabular-nums">{formatUSD(s.growth)}</dd></div>
      </dl>
    </div>
  );
}

