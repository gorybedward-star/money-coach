"use client";

import { ExternalLink, Landmark, ShieldCheck } from "lucide-react";
import { BENEFIT_ITEMS, BENEFIT_STATUSES, FEDERAL_TSP_BASICS, PROTECTION_DISCLAIMER } from "@/content/toolkit";
import type { BenefitStatus } from "@/lib/toolkit/model";
import { cn } from "@/lib/utils";
import { useToolkit } from "./store";
import { Card, Eyebrow, PageHeader, Progress, Segmented, Tip, pct } from "./ui";

const STATUS_STYLE: Record<BenefitStatus, string> = {
  "not-started": "border-[#d5dde8] text-[#5f6f86]",
  reviewed: "border-[#5b7aa6] bg-[#5b7aa6]/10 text-[#1d3a63]",
  available: "border-[#b8954a] bg-[#b8954a]/10 text-[#6b5320]",
  using: "border-[#167d68] bg-[#167d68] text-white",
  "follow-up": "border-[#b4483c] bg-[#b4483c]/8 text-[#8e3328]",
  "not-offered": "border-[#d5dde8] bg-[#f4f6f9] text-[#5f6f86] line-through",
};

export function BenefitsChecklist() {
  const { state, update } = useToolkit();
  const b = state.benefits;
  const items = BENEFIT_ITEMS.filter((i) => !i.federal || b.federal);
  const touched = items.filter((i) => (b.items[i.id]?.status ?? "not-started") !== "not-started").length;
  const followUps = items.filter((i) => b.items[i.id]?.status === "follow-up");
  const groups = [...new Set(items.map((i) => i.group))];

  const setItem = (id: string, patch: Partial<{ status: BenefitStatus; note: string }>) =>
    update((s) => ({ ...s, benefits: { ...s.benefits, items: { ...s.benefits.items, [id]: { ...(s.benefits.items[id] ?? { status: "not-started" as BenefitStatus, note: "" }), ...patch } } } }));

  return (
    <div>
      <PageHeader n={5} title="Employee Benefits Checklist" intro="Your benefits can be worth thousands of dollars a year. Every employer is different, so check what yours actually offers.">
        <div className="w-full sm:w-auto">
          <Eyebrow>Federal employee?</Eyebrow>
          <div className="mt-1.5">
            <Segmented label="Federal employee" value={b.federal ? "yes" : "no"} onChange={(v) => update((s) => ({ ...s, benefits: { ...s.benefits, federal: v === "yes" } }))} options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]} />
          </div>
        </div>
      </PageHeader>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm"><strong className="tabular-nums">{touched} of {items.length}</strong> benefits reviewed</p>
          <p className="text-sm text-[#5f6f86]">{followUps.length ? `${followUps.length} need follow-up: ${followUps.map((f) => f.title.split(" (")[0]).join(", ")}` : "No follow-ups yet"}</p>
        </div>
        <Progress className="mt-3" value={items.length ? touched / items.length : 0} label="Benefits reviewed" />
        <p className="mt-2 text-xs text-[#5f6f86]">{pct(items.length ? touched / items.length : 0)} complete. Your benefits guide, HR portal or open-enrollment materials have the details.</p>
      </Card>

      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g}>
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
              {g === "Health & protection" && <ShieldCheck className="size-5 text-[#167d68]" />}
              {g}
            </h2>
            <div className="grid gap-3 lg:grid-cols-2">
              {items.filter((i) => i.group === g).map((item) => {
                const entry = b.items[item.id] ?? { status: "not-started" as BenefitStatus, note: "" };
                return (
                  <Card key={item.id} className={cn(entry.status === "follow-up" && "border-[#b4483c]/30")}>
                    <h3 className="font-display text-[17px] font-semibold leading-snug">{item.title}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-[#33475f]">{item.what}</p>
                    <p className="mt-3 rounded-xl bg-[#f4f6f9] p-3 text-[13px] leading-relaxed text-[#33475f]"><span className="font-semibold text-[#0b1f3a]">Ask HR: </span>{item.ask}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`${item.title} status`}>
                      {BENEFIT_STATUSES.map((st) => (
                        <button key={st.id} type="button" role="radio" aria-checked={entry.status === st.id} onClick={() => setItem(item.id, { status: st.id })} className={cn("rounded-full border px-3 py-1 text-xs font-medium transition", entry.status === st.id ? STATUS_STYLE[st.id] : "border-[#e3e8ef] text-[#5f6f86] hover:border-[#0b1f3a]/30")}>
                          {st.label}
                        </button>
                      ))}
                    </div>
                    <textarea aria-label={`Notes for ${item.title}`} placeholder="Notes (no account numbers, please)" value={entry.note} maxLength={500} onChange={(e) => setItem(item.id, { note: e.target.value })} className="mt-3 min-h-[44px] w-full resize-y rounded-xl border border-[#d5dde8] px-3 py-2 text-sm outline-none focus:border-[#167d68] focus:ring-4 focus:ring-[#167d68]/12" rows={1} />
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {b.federal && (
        <section className="mt-8 overflow-hidden rounded-2xl border border-[#e3e8ef] bg-white">
          <div className="flex items-center gap-3 bg-[#0b1f3a] px-5 py-4 text-white sm:px-6">
            <Landmark className="size-5 text-[#8cc7b5]" />
            <div>
              <p className="font-display text-lg font-semibold">For federal employees: TSP basics</p>
              <p className="text-xs text-white/60">Independent education. Not affiliated with the TSP, OPM or any agency.</p>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            {FEDERAL_TSP_BASICS.map((x) => (
              <div key={x.title}>
                <p className="font-semibold">{x.title}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-[#33475f]">{x.body}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[#eef1f5] px-5 py-4 text-sm sm:px-6">
            <a className="inline-flex items-center gap-1.5 font-medium text-[#167d68] hover:underline" href="https://www.tsp.gov/" target="_blank" rel="noreferrer">tsp.gov <ExternalLink className="size-3.5" /></a>
            <a className="inline-flex items-center gap-1.5 font-medium text-[#167d68] hover:underline" href="https://www.opm.gov/healthcare-insurance/" target="_blank" rel="noreferrer">OPM benefits information <ExternalLink className="size-3.5" /></a>
            <a className="inline-flex items-center gap-1.5 font-medium text-[#167d68] hover:underline" href="/federal-employees">Money Coach Federal Wealth Center</a>
          </div>
          <p className="border-t border-[#eef1f5] px-5 py-3 text-xs text-[#5f6f86] sm:px-6">Rules differ for FERS, CSRS and the uniformed services. Always confirm details with your agency&rsquo;s official benefits office or HR.</p>
        </section>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Tip title="Protection is part of every plan">Before investing more, make sure one illness, injury or loss wouldn&rsquo;t undo your progress. Review health, life and disability coverage and confirm your beneficiaries every year.</Tip>
        <p className="rounded-2xl border border-[#e3e8ef] bg-white p-4 text-[13px] leading-relaxed text-[#5f6f86]"><ShieldCheck className="mb-1 inline size-4 text-[#167d68]" /> {PROTECTION_DISCLAIMER}</p>
      </div>
    </div>
  );
}
