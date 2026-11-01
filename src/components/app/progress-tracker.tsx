import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = { week: number; title: string; done: boolean };

/** Seven-week tracker: completed sessions, the current week, and what's ahead. */
export function ProgressTracker({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <ol className="grid grid-cols-7 gap-1.5 sm:gap-2" aria-label="Seven-week progress">
      {steps.map((s) => {
        const isCurrent = s.week === current && !s.done;
        return (
          <li key={s.week} className="flex flex-col items-center text-center">
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold sm:size-10",
                s.done && "border-emerald bg-emerald text-white",
                isCurrent && "border-gold bg-gold-50 text-navy",
                !s.done && !isCurrent && "border-navy/15 bg-white text-slate-600",
              )}
              aria-hidden
            >
              {s.done ? <Check className="size-4" /> : s.week}
            </span>
            <span className="sr-only">
              Week {s.week}: {s.title} — {s.done ? "session completed" : isCurrent ? "current week" : "upcoming"}
            </span>
            <span className={cn("mt-1.5 hidden text-[11px] leading-tight sm:block", isCurrent ? "font-semibold text-navy" : "text-slate-600")}>
              {s.title}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
