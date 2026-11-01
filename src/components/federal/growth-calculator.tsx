"use client";

import { useId, useState } from "react";
import { formatUSD } from "@/lib/calculators";
import { agencyMatch, RETIREMENT_SYSTEMS, tspGrowth, validateAgencyMatch, validateTspGrowth, type RetirementSystem } from "@/lib/tsp";
import { SOURCES } from "@/config/federal-rules";
import { Label, Select } from "@/components/ui/input";
import { Assumptions, ErrorList, NumberField, PrintButton, Stat, ToolLayout } from "@/components/tools/fields";
import { GrowthChart } from "@/components/tools/growth-chart";
import { NoSensitiveInfo, SourceList } from "./shared";

export function TspGrowthCalculator() {
  const sysId = useId();
  const [balance, setBalance] = useState("25000");
  const [pay, setPay] = useState("65000");
  const [rate, setRate] = useState("5");
  const [system, setSystem] = useState<RetirementSystem>("fers");
  const [years, setYears] = useState("25");
  const [ret, setRet] = useState("6");

  const errors = [
    ...validateAgencyMatch({ annualBasicPay: Number(pay), employeeRatePct: Number(rate) }),
    ...validateTspGrowth({ currentBalance: Number(balance), annualEmployee: 0, annualAgency: 0, years: Number(years), annualReturnPct: Number(ret) }),
  ];
  // Annual contributions for one year under current limits (no catch-up assumed).
  const m = errors.length ? null : agencyMatch({ annualBasicPay: Number(pay), employeeRatePct: Number(rate), system });
  const r = m ? tspGrowth({ currentBalance: Number(balance), annualEmployee: m.employee, annualAgency: m.agencyTotal, years: Number(years), annualReturnPct: Number(ret) }) : null;
  const parts = r
    ? [
        { label: "Starting balance", value: r.startingBalance, cls: "bg-slate" },
        { label: "Your contributions", value: r.employeeContributions, cls: "bg-navy" },
        { label: "Agency contributions", value: r.agencyContributions, cls: "bg-emerald" },
        { label: "Modeled investment growth", value: Math.max(0, r.growth), cls: "bg-gold" },
      ]
    : [];

  return (
    <ToolLayout
      form={
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-xl font-bold">Your numbers</h2>
          <NumberField label="Current TSP balance" prefix="$" value={balance} onChange={setBalance} min={0} step={1000} hint="An approximate figure is fine. Never share your account details." />
          <NumberField label="Annual basic pay" prefix="$" value={pay} onChange={setPay} min={0} step={1000} />
          <NumberField label="Your contribution" suffix="% of pay" value={rate} onChange={setRate} min={0} max={100} step={1} />
          <div>
            <Label htmlFor={sysId}>Agency contributions</Label>
            <Select id={sysId} value={system} onChange={(e) => setSystem(e.target.value as RetirementSystem)}>
              {Object.entries(RETIREMENT_SYSTEMS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>
          <NumberField label="Years until retirement" value={years} onChange={setYears} min={1} max={60} step={1} />
          <div>
            <NumberField label="Hypothetical annual return" suffix="%" value={ret} onChange={setRet} min={-5} max={12} step={0.5} hint="An assumption for illustration only. Actual returns vary and can be negative." />
            <input type="range" min={0} max={10} step={0.5} value={Number(ret) || 0} onChange={(e) => setRet(e.target.value)} className="mt-3 w-full" aria-label="Hypothetical return slider" />
          </div>
          <NoSensitiveInfo />
        </form>
      }
      results={
        <div className="space-y-6">
          <ErrorList errors={errors} />
          {r && m && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Stat label={`Illustrative balance in ${years} years`} value={formatUSD(r.finalBalance)} emphasis sub={`At a hypothetical ${ret}% per year`} />
                <Stat label="Going in each year" value={formatUSD(m.total)} sub={`You ${formatUSD(m.employee)} + agency ${formatUSD(m.agencyTotal)}`} />
                <Stat label="Your contributions" value={formatUSD(r.employeeContributions)} />
                <Stat label="Agency contributions" value={formatUSD(r.agencyContributions)} />
              </div>
              <div className="rounded-2xl border border-navy/10 bg-white p-5">
                <p className="text-sm font-semibold">What makes up the illustrative balance</p>
                <div className="mt-3 flex h-4 overflow-hidden rounded-full bg-ivory-200" role="img" aria-label={parts.map((p) => `${p.label} ${formatUSD(p.value)}`).join(", ")}>
                  {parts.map((p) => <span key={p.label} className={p.cls} style={{ width: `${r.finalBalance > 0 ? (p.value / Math.max(r.finalBalance, 1)) * 100 : 0}%` }} />)}
                </div>
                <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  {parts.map((p) => (
                    <li key={p.label} className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-slate-600"><span className={`size-2.5 rounded-full ${p.cls}`} /> {p.label}</span>
                      <span className="font-semibold tabular-nums">{formatUSD(p.value)}</span>
                    </li>
                  ))}
                  {r.growth < 0 && (
                    <li className="col-span-full text-sm text-red-800">Modeled investment losses: {formatUSD(r.growth)}</li>
                  )}
                </ul>
              </div>
              <GrowthChart
                title="Illustrative balance vs. money put in"
                xLabels={r.series.map((s) => `Yr ${s.year}`)}
                series={[
                  { key: "in", label: "Starting balance + contributions", color: "#10243A", values: r.series.map((s) => s.contributions) },
                  { key: "bal", label: "Illustrative balance", color: "#167D68", values: r.series.map((s) => s.balance) },
                ]}
              />
              <PrintButton />
            </>
          )}
          <Assumptions
            items={[
              "Pay, contribution rate, and agency contributions stay level every year. Raises, step increases, and inflation are not modeled.",
              "Contributions are spread monthly and growth compounds monthly at a single constant hypothetical rate. Real returns vary year to year and can be negative.",
              "Annual contribution limits are applied for the current year only. Catch-up contributions are not included.",
              "Fees, taxes, loans, and withdrawals are not modeled. Results are before any taxes owed on Traditional balances.",
              "This is a hypothetical illustration, not a projection of any TSP fund's performance, and not a recommendation.",
            ]}
          />
          <SourceList sources={[SOURCES.tspCalculators, SOURCES.tspContributionTypes, SOURCES.tspFunds]} />
        </div>
      }
    />
  );
}
