import { features, founderMilestones } from "@/config/site";
import { cn } from "@/lib/utils";

export function FounderMilestones({ light = false }: { light?: boolean }) {
  return (
    <div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {founderMilestones.map((m) => (
          <div
            key={m.label}
            className={cn("flex flex-col-reverse rounded-2xl border p-4", light ? "border-ivory/15 bg-white/5" : "border-navy/10 bg-white")}
          >
            <dt className={cn("mt-1 text-xs leading-snug", light ? "text-ivory/70" : "text-slate-600")}>{m.label}</dt>
            <dd className={cn("font-display text-2xl font-bold", light ? "text-gold" : "text-navy")}>{m.value}</dd>
          </div>
        ))}
      </dl>
      <p className={cn("mt-3 text-xs leading-relaxed", light ? "text-ivory/60" : "text-slate-600")}>
        Founder-reported personal milestones{features.milestonesConfirmed ? "" : ", pending confirmation before publication"}. Shared to illustrate
        principles, not as typical or guaranteed results. Your results will differ.
      </p>
    </div>
  );
}
