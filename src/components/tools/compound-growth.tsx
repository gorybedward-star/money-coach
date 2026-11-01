"use client";

import { useMemo, useState } from "react";
import { compoundGrowth, formatUSD, validateCompoundGrowth } from "@/lib/calculators";
import { Assumptions, ErrorList, NumberField, PrintButton, Stat, ToolLayout } from "./fields";
import { GrowthChart } from "./growth-chart";

export function CompoundGrowthCalculator() {
  const [start, setStart] = useState("1000");
  const [monthly, setMonthly] = useState("250");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("25");

  const input = { startingBalance: Number(start), monthlyContribution: Number(monthly), annualReturnPct: Number(rate), years: Number(years) };
  const errors = validateCompoundGrowth(input);
  const r = useMemo(() => (errors.length ? null : compoundGrowth(input)), [start, monthly, rate, years]); // eslint-disable-line react-hooks/exhaustive-deps
  const growthShare = r && r.finalValue > 0 ? (r.growth / r.finalValue) * 100 : 0;

  return (
    <ToolLayout
      form={
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-xl font-bold">Your numbers</h2>
          <NumberField label="Starting balance" prefix="$" value={start} onChange={setStart} min={0} step={100} />
          <NumberField label="Monthly contribution" prefix="$" value={monthly} onChange={setMonthly} min={0} step={25} />
          <div>
            <NumberField label="Hypothetical annual return" suffix="%" value={rate} onChange={setRate} min={0} max={15} step={0.5} />
            <input type="range" min={0} max={12} step={0.5} value={Number(rate) || 0} onChange={(e) => setRate(e.target.value)} className="mt-3 w-full" aria-label="Hypothetical return slider" />
          </div>
          <div>
            <NumberField label="Years invested" suffix="years" value={years} onChange={setYears} min={1} max={70} step={1} />
            <input type="range" min={1} max={50} step={1} value={Number(years) || 1} onChange={(e) => setYears(e.target.value)} className="mt-3 w-full" aria-label="Years slider" />
          </div>
        </form>
      }
      results={
        <div className="space-y-6">
          <ErrorList errors={errors} />
          {r && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label={`Projected value in ${years} years`} value={formatUSD(r.finalValue)} emphasis />
                <Stat label="Your contributions" value={formatUSD(r.totalContributions)} />
                <Stat label="Modeled growth" value={formatUSD(r.growth)} sub={`${Math.round(growthShare)}% of the final value`} />
              </div>
              <GrowthChart
                title="Contributions vs. projected value"
                xLabels={r.series.map((p) => `Yr ${p.year}`)}
                series={[
                  { key: "value", label: "Projected value", color: "#167D68", values: r.series.map((p) => p.value) },
                  { key: "contrib", label: "Your contributions", color: "#C9A45C", values: r.series.map((p) => p.contributions) },
                ]}
              />
              <p className="text-lg leading-relaxed">
                Over {years} years, about <strong>{Math.round(growthShare)}%</strong> of the projected balance comes from modeled growth rather than your own
                deposits. That share grows the longer money stays invested.
              </p>
              <PrintButton />
            </>
          )}
          <Assumptions
            items={[
              "Contributions are made at the end of each month and the hypothetical return is constant and compounded monthly. Real returns vary, can be negative, and are not guaranteed.",
              "Taxes, fees, and inflation are not included and would reduce real results.",
              "This is an educational illustration, not a recommendation of any investment.",
            ]}
          />
        </div>
      }
    />
  );
}
