import { ArrowRight, ShieldCheck } from "lucide-react";
import { bookCall, formatOfferPrice, getOffer, resetGuarantee } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * The client path shown as a ladder instead of a menu:
 * free Scorecard, free call, the 7-Week Money Reset, then monthly coaching.
 */
export function ClientPath() {
  const scorecard = getOffer("scorecard")!;
  const reset = getOffer("reset")!;
  const coaching = getOffer("coaching")!;

  const steps = [
    {
      step: "Step 1",
      name: "Take the free Scorecard",
      price: "Free",
      detail: "Ten quick questions. See your score and your #1 next money move in three minutes.",
      href: scorecard.href,
      cta: scorecard.ctaLabel,
      external: false,
    },
    {
      step: "Step 2",
      name: "Book a free 15-minute call",
      price: "Free",
      detail: "Talk with Gory about where you are. You leave with one clear move for this week, with no pressure.",
      href: bookCall.href,
      cta: bookCall.label,
      external: true,
    },
    {
      step: "Step 3",
      name: reset.name,
      price: formatOfferPrice(reset),
      detail: "Seven weeks of one-on-one coaching. One objective and one money move every week, with accountability.",
      href: reset.href,
      cta: reset.ctaLabel,
      external: false,
      highlight: true,
    },
    {
      step: "Step 4",
      name: "Stay on track",
      price: `${formatOfferPrice(coaching)}/mo`,
      detail: "Optional monthly coaching after you graduate. Keep your momentum and cancel anytime.",
      href: coaching.href,
      cta: coaching.ctaLabel,
      external: false,
    },
  ];

  return (
    <div>
      <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((s, i) => (
          <li
            key={s.step}
            className={cn(
              "relative flex flex-col rounded-[var(--radius-card)] border p-6",
              s.highlight ? "border-2 border-gold bg-navy text-ivory shadow-lift" : "border-navy/10 bg-white shadow-soft",
            )}
          >
            <p className={cn("text-xs font-semibold uppercase tracking-[0.2em]", s.highlight ? "text-gold" : "text-emerald")}>
              {s.step}
            </p>
            <h3 className={cn("mt-2 text-xl font-bold leading-snug", s.highlight ? "text-ivory" : "text-navy")}>{s.name}</h3>
            <p className="mt-3 font-display text-4xl font-bold">{s.price}</p>
            <p className={cn("mt-3 flex-1 text-sm leading-relaxed", s.highlight ? "text-ivory/80" : "text-slate-600")}>{s.detail}</p>
            {s.highlight && (
              <p className="mt-4 flex items-start gap-2 text-sm text-ivory/90">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                <span>{resetGuarantee.title}</span>
              </p>
            )}
            <a
              href={s.href}
              {...(s.external && bookCall.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={cn(
                "mt-5 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline",
                s.highlight ? "text-gold" : "text-emerald",
              )}
            >
              {s.cta} <ArrowRight className="size-4" aria-hidden />
            </a>
            {i < steps.length - 1 && (
              <ArrowRight
                aria-hidden
                className="absolute -right-3.5 top-1/2 z-10 hidden size-7 -translate-y-1/2 rounded-full bg-gold p-1 text-navy xl:block"
              />
            )}
          </li>
        ))}
      </ol>
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-gold/50 bg-gold-50 p-5">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden />
        <p className="text-sm leading-relaxed text-navy">
          <strong>{resetGuarantee.title} on {reset.name}.</strong> {resetGuarantee.detail}
        </p>
      </div>
    </div>
  );
}
