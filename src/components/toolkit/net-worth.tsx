"use client";

import { useMemo, useState } from "react";
import { Home, Pencil, Plus, Save, Trash2 } from "lucide-react";
import {
  ASSET_CATEGORIES,
  GOAL_PRESETS,
  LIABILITY_CATEGORIES,
  monthKey,
  uid,
  type AssetCategory,
  type LiabilityCategory,
  type Snapshot,
  type ToolkitState,
} from "@/lib/toolkit/model";
import { effectiveNetWorth, toolkitSummary, formatMonth, goalProgress, netWorthHistory, netWorthSummary, snapNW, sortSnapshots, upsertSnapshot } from "@/lib/toolkit/calc";
import { useToolkit } from "./store";
import { GoalDateCard } from "./coach";
import { AssetsLiabilitiesBars, NetWorthArea, type NWPoint } from "./charts";
import { Btn, Card, SyncBadge, Eyebrow, Learn, NumField, PageHeader, Progress, SelectField, Stat, TextField, Tip, pct, signed, usd } from "./ui";

/** Saved snapshots plus a "Now" point when this month's numbers aren't saved yet (or have changed). */
export function netWorthSeries(s: ToolkitState): NWPoint[] {
  const sum = netWorthSummary(effectiveNetWorth(s));
  const snaps = sortSnapshots(s.netWorth.snapshots);
  const pts: NWPoint[] = snaps.map((x) => ({ label: formatMonth(x.month), netWorth: snapNW(x), assets: x.assets, liabilities: x.liabilities }));
  const cur = snaps.find((x) => x.month === monthKey());
  const hasData = sum.assets > 0 || sum.liabilities > 0;
  if (hasData && (!cur || cur.assets !== sum.assets || cur.liabilities !== sum.liabilities)) {
    if (cur) pts.pop();
    pts.push({ label: "Now", netWorth: sum.netWorth, assets: sum.assets, liabilities: sum.liabilities });
  }
  return pts;
}

function Change({ label, data }: { label: string; data: { change: number; assetChange: number; debtReduction: number; gap: number } | null }) {
  if (!data) return <Stat label={label} value="—" tone="muted" sub={label.startsWith("Annual") ? "Appears once you have snapshots 12 months apart." : "Save at least two monthly snapshots to see this."} />;
  return (
    <div>
      <Stat label={label} value={signed(data.change)} tone={data.change >= 0 ? "good" : "bad"} sub={`Over ${data.gap} month${data.gap === 1 ? "" : "s"}`} />
      <dl className="mt-3 space-y-1.5 text-[13px]">
        <div className="flex justify-between gap-3">
          <dt className="text-[#5f6f86]">From paying down debt</dt>
          <dd className="font-medium tabular-nums">{signed(data.debtReduction)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#5f6f86]">From changes in assets</dt>
          <dd className="font-medium tabular-nums">{signed(data.assetChange)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function NetWorthTracker() {
  const { state, update } = useToolkit();
  const nw = state.netWorth;
  const summaryAll = useMemo(() => toolkitSummary(state), [state]);
  const sheet = effectiveNetWorth(state);
  const sum = netWorthSummary(sheet);
  const syncedAssets = sheet.assets.filter((a) => a.id.startsWith("sync-"));
  const syncedDebts = sheet.liabilities.filter((a) => a.id.startsWith("sync-"));
  const hist = netWorthHistory(nw.snapshots);
  const series = useMemo(() => netWorthSeries(state), [state]);
  const thisMonth = monthKey();
  const saved = nw.snapshots.find((s) => s.month === thisMonth);
  const isPreset = (GOAL_PRESETS as readonly number[]).includes(nw.goal);
  const [customGoal, setCustomGoal] = useState(isPreset ? 0 : nw.goal);
  const [editing, setEditing] = useState<string | null>(null);
  const [addMonth, setAddMonth] = useState("");

  const setNW = (fn: (n: typeof nw) => typeof nw) => update((s) => ({ ...s, netWorth: fn(s.netWorth) }));

  const saveSnapshot = () => setNW((n) => ({ ...n, snapshots: upsertSnapshot(n.snapshots, { id: saved?.id ?? uid("s"), month: thisMonth, assets: sum.assets, liabilities: sum.liabilities }) }));

  return (
    <div>
      <PageHeader n={7} title="Net Worth Tracker" intro="What you own minus what you owe. Update it once a month and watch the trend, not the day-to-day noise.">
        <Btn onClick={saveSnapshot}>
          <Save className="size-4" /> {saved ? "Update this month's snapshot" : "Save this month's snapshot"}
        </Btn>
      </PageHeader>

      {/* Summary */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-[#0b1f3a] text-white lg:col-span-2" pad>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow className="text-white/60">Current net worth</Eyebrow>
              <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">{usd(sum.netWorth)}</p>
              <p className="mt-2 text-sm text-white/70">
                {usd(sum.assets)} assets &minus; {usd(sum.liabilities)} liabilities
              </p>
            </div>
            {hist.monthly && (
              <p className="rounded-full bg-white/10 px-3 py-1 text-sm tabular-nums text-[#8cc7b5]">
                {signed(hist.monthly.change)} since {formatMonth(hist.monthly.from.month)}
              </p>
            )}
          </div>
          <div className="mt-6">
            {series.length >= 2 ? <NetWorthArea data={series} dark height={230} /> : <p className="py-10 text-center text-sm text-white/60">Save a snapshot each month to build your growth chart.</p>}
          </div>
        </Card>

        <Card title="Your goal" eyebrow="Net worth goal">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-semibold tabular-nums">{pct(goalProgress(sum.netWorth, nw.goal))}</p>
            <p className="text-sm text-[#5f6f86]">of {usd(nw.goal)}</p>
          </div>
          <Progress className="mt-3" value={goalProgress(sum.netWorth, nw.goal)} label="Progress toward net worth goal" />
          <p className="mt-2 text-xs text-[#5f6f86]">{sum.netWorth >= nw.goal ? "Goal reached. Time to set the next one." : `${usd(nw.goal - sum.netWorth)} to go.`}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {GOAL_PRESETS.map((g) => (
              <button key={g} type="button" aria-pressed={nw.goal === g} onClick={() => setNW((n) => ({ ...n, goal: g }))} className={`rounded-xl border px-3 py-2 text-sm font-medium tabular-nums transition ${nw.goal === g ? "border-[#0b1f3a] bg-[#0b1f3a] text-white" : "border-[#d5dde8] hover:border-[#0b1f3a]/40"}`}>
                {g >= 1_000_000 ? "$1 million" : usd(g)}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-end gap-2">
            <NumField label="Custom goal" value={customGoal} onChange={setCustomGoal} compact />
            <Btn variant="secondary" disabled={!(customGoal > 0)} onClick={() => setNW((n) => ({ ...n, goal: customGoal }))}>Set</Btn>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Card><Change label="Monthly change" data={hist.monthly} /></Card>
        <Card><Change label="Annual change" data={hist.annual} /></Card>
        <Card>
          <Stat label="Home equity" value={usd(sum.homeEquity)} sub={sum.propertyValue > 0 ? `${usd(sum.propertyValue)} value − ${usd(sum.mortgages)} mortgage. Counted once.` : "Add real estate below if you own property."} />
        </Card>
      </div>

      <div className="mt-4">
        <GoalDateCard state={state} t={summaryAll} />
      </div>

      {/* Entry */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card title="Assets" eyebrow="What you own" action={<span className="text-sm font-semibold tabular-nums">{usd(sum.otherAssets)}</span>}>
          <div className="space-y-3">
            {syncedAssets.map((a) => (
              <SyncedRow key={a.id} name={a.name} category={ASSET_CATEGORIES[a.category]} amount={a.amount} from="Emergency Fund" href="#/emergency" />
            ))}
            {nw.assets.map((a) => (
              <div key={a.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem] gap-2 rounded-xl border border-[#eef1f5] p-3 sm:grid-cols-[1.1fr_1fr_8rem_auto] sm:items-center sm:border-0 sm:p-0">
                <div className="col-span-2 sm:col-span-1"><TextField ariaLabel="Asset name" compact value={a.name} onChange={(v) => setNW((n) => ({ ...n, assets: n.assets.map((x) => (x.id === a.id ? { ...x, name: v } : x)) }))} /></div>
                <button type="button" aria-label={`Remove ${a.name || "asset"}`} onClick={() => setNW((n) => ({ ...n, assets: n.assets.filter((x) => x.id !== a.id) }))} className="grid size-10 place-items-center rounded-lg text-[#5f6f86] hover:bg-[#f4f6f9] hover:text-[#b4483c] sm:order-last">
                  <Trash2 className="size-4" />
                </button>
                <SelectField ariaLabel="Asset type" compact value={a.category} onChange={(v) => setNW((n) => ({ ...n, assets: n.assets.map((x) => (x.id === a.id ? { ...x, category: v as AssetCategory } : x)) }))} options={Object.entries(ASSET_CATEGORIES).map(([value, label]) => ({ value: value as AssetCategory, label }))} />
                <NumField ariaLabel="Asset value" compact value={a.amount} onChange={(v) => setNW((n) => ({ ...n, assets: n.assets.map((x) => (x.id === a.id ? { ...x, amount: v } : x)) }))} />
              </div>
            ))}
            <Btn variant="ghost" onClick={() => setNW((n) => ({ ...n, assets: [...n.assets, { id: uid("a"), category: "cash", name: "", amount: 0 }] }))}>
              <Plus className="size-4" /> Add asset
            </Btn>
          </div>
          {!state.emergency.syncToNetWorth && <p className="mt-2 text-xs text-[#5f6f86]">Your emergency fund isn&rsquo;t synced here. Turn it on in the Emergency Fund Builder.</p>}
        </Card>

        <Card title="Liabilities" eyebrow="What you owe" action={<span className="text-sm font-semibold tabular-nums">{usd(sum.otherDebts)}</span>}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <SyncBadge from="Debt Freedom Tracker" href="#/debt" />
            <label className="flex items-center gap-2 text-xs text-[#33475f]">
              <input type="checkbox" className="size-4 accent-[#167d68]" checked={nw.debtsFromTracker} onChange={(e) => setNW((n) => ({ ...n, debtsFromTracker: e.target.checked }))} />
              Include my Debt Tracker balances
            </label>
          </div>
          <div className="space-y-3">
            {syncedDebts.map((a) => (
              <SyncedRow key={a.id} name={a.name} category={LIABILITY_CATEGORIES[a.category]} amount={a.amount} from="Debt Tracker" href="#/debt" />
            ))}
            {nw.debtsFromTracker && nw.liabilities.length > 0 && <p className="pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5f6f86]">Other debts</p>}
            {nw.liabilities.map((a) => (
              <div key={a.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem] gap-2 rounded-xl border border-[#eef1f5] p-3 sm:grid-cols-[1.1fr_1fr_8rem_auto] sm:items-center sm:border-0 sm:p-0">
                <div className="col-span-2 sm:col-span-1"><TextField ariaLabel="Debt name" compact value={a.name} onChange={(v) => setNW((n) => ({ ...n, liabilities: n.liabilities.map((x) => (x.id === a.id ? { ...x, name: v } : x)) }))} /></div>
                <button type="button" aria-label={`Remove ${a.name || "debt"}`} onClick={() => setNW((n) => ({ ...n, liabilities: n.liabilities.filter((x) => x.id !== a.id) }))} className="grid size-10 place-items-center rounded-lg text-[#5f6f86] hover:bg-[#f4f6f9] hover:text-[#b4483c] sm:order-last">
                  <Trash2 className="size-4" />
                </button>
                <SelectField ariaLabel="Debt type" compact value={a.category} onChange={(v) => setNW((n) => ({ ...n, liabilities: n.liabilities.map((x) => (x.id === a.id ? { ...x, category: v as LiabilityCategory } : x)) }))} options={Object.entries(LIABILITY_CATEGORIES).map(([value, label]) => ({ value: value as LiabilityCategory, label }))} />
                <NumField ariaLabel="Amount owed" compact value={a.amount} onChange={(v) => setNW((n) => ({ ...n, liabilities: n.liabilities.map((x) => (x.id === a.id ? { ...x, amount: v } : x)) }))} />
              </div>
            ))}
            <Btn variant="ghost" onClick={() => setNW((n) => ({ ...n, liabilities: [...n.liabilities, { id: uid("l"), category: "credit-card", name: "", amount: 0 }] }))}>
              <Plus className="size-4" /> Add debt
            </Btn>
          </div>
          <p className="mt-3 text-xs text-[#5f6f86]">Change synced balances in the Debt Freedom Tracker and they update here automatically. Mortgages go with their property below, so your home is never counted twice.</p>
        </Card>
      </div>

      <Card className="mt-4" title="Real estate and mortgages" eyebrow="Entered together" action={<Home className="size-5 text-[#5f6f86]" />}>
        <div className="space-y-3">
          {nw.properties.map((p) => (
            <div key={p.id} className="grid gap-2 rounded-xl border border-[#eef1f5] p-3 sm:grid-cols-[1.2fr_1fr_1fr_auto_auto] sm:items-end">
              <TextField label="Property" compact value={p.name} onChange={(v) => setNW((n) => ({ ...n, properties: n.properties.map((x) => (x.id === p.id ? { ...x, name: v } : x)) }))} />
              <NumField label="Estimated value" compact value={p.value} onChange={(v) => setNW((n) => ({ ...n, properties: n.properties.map((x) => (x.id === p.id ? { ...x, value: v } : x)) }))} />
              <NumField label="Mortgage balance" compact value={p.mortgage} onChange={(v) => setNW((n) => ({ ...n, properties: n.properties.map((x) => (x.id === p.id ? { ...x, mortgage: v } : x)) }))} />
              <div className="px-1 pb-2 text-sm sm:text-right">
                <span className="text-[#5f6f86]">Equity </span>
                <span className="font-semibold tabular-nums">{usd(p.value - p.mortgage)}</span>
              </div>
              <button type="button" aria-label={`Remove ${p.name || "property"}`} onClick={() => setNW((n) => ({ ...n, properties: n.properties.filter((x) => x.id !== p.id) }))} className="grid size-10 place-items-center justify-self-end rounded-lg text-[#5f6f86] hover:bg-[#f4f6f9] hover:text-[#b4483c]">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <Btn variant="ghost" onClick={() => setNW((n) => ({ ...n, properties: [...n.properties, { id: uid("p"), name: "Home", value: 0, mortgage: 0 }] }))}>
            <Plus className="size-4" /> Add property
          </Btn>
        </div>
      </Card>

      {/* History */}
      <div className="mt-8 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3" title="Assets and liabilities over time" eyebrow="History">
          {series.length >= 2 ? <AssetsLiabilitiesBars data={series} /> : <p className="py-8 text-sm text-[#5f6f86]">Your history appears after your second snapshot.</p>}
          {hist.sinceStart && (
            <p className="mt-3 text-[13px] leading-relaxed text-[#5f6f86]">
              Since {formatMonth(hist.sinceStart.from.month)}, paying down debt added <strong className="text-[#0b1f3a]">{signed(hist.sinceStart.debtReduction)}</strong> and changes in your assets added <strong className="text-[#0b1f3a]">{signed(hist.sinceStart.assetChange)}</strong>. If you used savings to pay off debt, both sides move, so the split shows each one honestly.
            </p>
          )}
        </Card>

        <Card className="lg:col-span-2" title="Monthly snapshots" eyebrow={`${nw.snapshots.length} saved`}>
          <ul className="max-h-[360px] divide-y divide-[#eef1f5] overflow-y-auto pr-1">
            {[...hist.sorted].reverse().map((s) => (
              <SnapshotRow key={s.id} snap={s} editing={editing === s.id} onEdit={() => setEditing(editing === s.id ? null : s.id)} onSave={(next) => { setNW((n) => ({ ...n, snapshots: upsertSnapshot(n.snapshots, next) })); setEditing(null); }} onDelete={() => setNW((n) => ({ ...n, snapshots: n.snapshots.filter((x) => x.id !== s.id) }))} />
            ))}
            {!nw.snapshots.length && <li className="py-6 text-sm text-[#5f6f86]">No snapshots yet. Save one with the button at the top.</li>}
          </ul>
          <div className="mt-4 flex items-end gap-2 border-t border-[#eef1f5] pt-4">
            <TextField label="Add a past month" type="month" compact value={addMonth} onChange={setAddMonth} />
            <Btn variant="secondary" disabled={!/^\d{4}-\d{2}$/.test(addMonth) || nw.snapshots.some((s) => s.month === addMonth)} onClick={() => { const id = uid("s"); setNW((n) => ({ ...n, snapshots: upsertSnapshot(n.snapshots, { id, month: addMonth, assets: 0, liabilities: 0 }) })); setEditing(id); setAddMonth(""); }}>
              Add
            </Btn>
          </div>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Tip title="Why net worth matters most">Income tells you what comes in. Net worth tells you what you keep. Every dollar of debt you pay off and every dollar you save or invest moves this number up, even on a modest income.</Tip>
        <div className="space-y-2">
          <Learn title="What counts as an asset?">
            <p>Anything you own that has a cash value: bank accounts, investments, retirement accounts like the TSP, 401(k) or IRA, real estate, vehicles and business ownership. Use what you could realistically sell it for, not what you paid.</p>
          </Learn>
          <Learn title="How is home equity handled?">
            <p>Enter each property once with its estimated value and its mortgage balance. The value counts as an asset and the mortgage as a liability, so your equity is included exactly once.</p>
          </Learn>
          <Learn title="Debt reduction vs. asset changes">
            <p>When your net worth changes between two snapshots, we show how much came from lower balances owed and how much came from what you own (saving, investing, market moves or home values). Market values go up and down; paying off debt is progress you control.</p>
          </Learn>
        </div>
      </div>
    </div>
  );
}

function SnapshotRow({ snap, editing, onEdit, onSave, onDelete }: { snap: Snapshot; editing: boolean; onEdit: () => void; onSave: (s: Snapshot) => void; onDelete: () => void }) {
  const [assets, setAssets] = useState(snap.assets);
  const [liab, setLiab] = useState(snap.liabilities);
  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{formatMonth(snap.month)}</p>
          <p className="text-xs tabular-nums text-[#5f6f86]">{usd(snap.assets)} − {usd(snap.liabilities)}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="mr-1 text-sm font-semibold tabular-nums">{usd(snapNW(snap))}</span>
          <button type="button" aria-label={`Edit ${formatMonth(snap.month)}`} onClick={onEdit} className="grid size-8 place-items-center rounded-lg text-[#5f6f86] hover:bg-[#f4f6f9]">
            <Pencil className="size-3.5" />
          </button>
          <button type="button" aria-label={`Delete ${formatMonth(snap.month)}`} onClick={onDelete} className="grid size-8 place-items-center rounded-lg text-[#5f6f86] hover:bg-[#f4f6f9] hover:text-[#b4483c]">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
      {editing && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <NumField label="Total assets" compact value={assets} onChange={setAssets} />
          <NumField label="Total liabilities" compact value={liab} onChange={setLiab} />
          <div className="col-span-2 flex gap-2">
            <Btn className="min-h-9" onClick={() => onSave({ ...snap, assets, liabilities: liab })}>Save changes</Btn>
            <Btn className="min-h-9" variant="secondary" onClick={onEdit}>Cancel</Btn>
          </div>
        </div>
      )}
    </li>
  );
}


function SyncedRow({ name, category, amount, from, href }: { name: string; category: string; amount: number; from: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#167d68]/30 bg-[#f6fbf9] px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#5f6f86]">{category} <SyncBadge from={from} href={href} /></p>
      </div>
      <span className="shrink-0 text-sm font-semibold tabular-nums">{usd(amount)}</span>
    </div>
  );
}
