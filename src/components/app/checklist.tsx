"use client";

import { useOptimistic, useTransition } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { id: string; label: string; done: boolean };

/** Accessible checklist. Each tick saves immediately. */
export function Checklist({
  items,
  toggle,
  label,
  disabled = false,
}: {
  items: Item[];
  toggle?: (itemId: string, done: boolean) => Promise<void>;
  label: string;
  disabled?: boolean;
}) {
  const [optimistic, setOptimistic] = useOptimistic(items, (state, change: { id: string; done: boolean }) =>
    state.map((i) => (i.id === change.id ? { ...i, done: change.done } : i)),
  );
  const [, startTransition] = useTransition();
  const doneCount = optimistic.filter((i) => i.done).length;

  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <p className="mb-3 text-sm text-slate-600" aria-live="polite">
        {doneCount} of {optimistic.length} done
      </p>
      <ul className="space-y-2">
        {optimistic.map((item) => (
          <li key={item.id}>
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                item.done ? "border-emerald/30 bg-emerald-50" : "border-navy/10 bg-white hover:border-navy/25",
                (disabled || !toggle) && "cursor-default",
              )}
            >
              <input
                type="checkbox"
                className="peer sr-only"
                checked={item.done}
                disabled={disabled || !toggle}
                onChange={(e) => {
                  const done = e.target.checked;
                  startTransition(async () => {
                    setOptimistic({ id: item.id, done });
                    await toggle?.(item.id, done);
                  });
                }}
              />
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 peer-focus-visible:ring-4 peer-focus-visible:ring-gold/50",
                  item.done ? "border-emerald bg-emerald text-white" : "border-navy/25 bg-white",
                )}
              >
                {item.done && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className={cn("text-[0.95rem] leading-snug", item.done && "text-slate-600")}>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
