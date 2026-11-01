"use client";

import { useSyncExternalStore } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { roadmapStages } from "@/content/roadmap";
import { cn } from "@/lib/utils";

// Checklist progress is saved only in this browser (localStorage). Nothing is sent anywhere.
const KEY = "mc-roadmap-v1";
const EVENT = "mc-roadmap-change";
const EMPTY = "[]";

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}
function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable: progress just won't persist */
  }
  window.dispatchEvent(new Event(EVENT));
}
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

let memory: string[] = [];
function useChecked(): [Set<string>, (id: string) => void, () => void] {
  const raw = useSyncExternalStore(subscribe, () => {
    const r = read();
    return r === EMPTY && memory.length ? JSON.stringify(memory) : r;
  }, () => EMPTY);
  let ids: string[] = [];
  try {
    ids = JSON.parse(raw);
  } catch {
    ids = [];
  }
  const set = new Set(ids);
  const toggle = (id: string) => {
    const next = set.has(id) ? ids.filter((x) => x !== id) : [...ids, id];
    memory = next;
    write(next);
  };
  const reset = () => {
    memory = [];
    write([]);
  };
  return [set, toggle, reset];
}

const itemId = (stage: string, i: number) => `${stage}:${i}`;
const totalItems = roadmapStages.reduce((s, st) => s + st.checklist.length, 0);

export function StageChecklist({ stageId, items }: { stageId: string; items: string[] }) {
  const [checked, toggle] = useChecked();
  const done = items.filter((_, i) => checked.has(itemId(stageId, i))).length;
  const pct = (done / items.length) * 100;
  return (
    <div className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-4 text-emerald" aria-hidden /> Checklist</p>
        <span className="text-xs font-semibold tabular-nums text-slate-600">{done} of {items.length}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ivory-200" aria-hidden>
        <div className="h-full rounded-full bg-emerald transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-4 space-y-1 text-sm leading-relaxed">
        {items.map((c, i) => {
          const id = itemId(stageId, i);
          const on = checked.has(id);
          return (
            <li key={id}>
              <label className="flex cursor-pointer gap-3 rounded-lg p-1.5 hover:bg-ivory">
                <input type="checkbox" checked={on} onChange={() => toggle(id)} className="mt-0.5 size-4 shrink-0 accent-emerald" />
                <span className={cn(on && "text-slate-600 line-through decoration-emerald/60")}>{c}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {done === items.length && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">Stage complete. Well done.</p>}
    </div>
  );
}

export function RoadmapOverallProgress() {
  const [checked, , reset] = useChecked();
  const done = roadmapStages.reduce((s, st) => s + st.checklist.filter((_, i) => checked.has(itemId(st.id, i))).length, 0);
  const pct = Math.round((done / totalItems) * 100);
  return (
    <div className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-6 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">Your progress</p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums">{pct}% <span className="text-base font-normal text-slate-600">· {done} of {totalItems} steps</span></p>
        </div>
        {done > 0 && (
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-navy">
            <RotateCcw className="size-4" aria-hidden /> Start over
          </button>
        )}
      </div>
      <ol className="mt-5 grid grid-cols-6 gap-1.5" aria-label="Progress by stage">
        {roadmapStages.map((st) => {
          const d = st.checklist.filter((_, i) => checked.has(itemId(st.id, i))).length;
          return (
            <li key={st.id} title={`${st.title}: ${d} of ${st.checklist.length}`}>
              <a href={`#${st.id}`} className="block">
                <span className="block h-2 overflow-hidden rounded-full bg-ivory-200">
                  <span className="block h-full rounded-full bg-emerald" style={{ width: `${(d / st.checklist.length) * 100}%` }} />
                </span>
                <span className="mt-1.5 block truncate text-[0.7rem] text-slate-600">{st.n}. {st.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-slate-600">Check off steps below as you go. Your progress is saved only in this browser.</p>
    </div>
  );
}
