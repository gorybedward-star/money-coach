import { Check, Star } from "lucide-react";
import { formatOfferCadence, formatOfferPrice, offers, type Offer } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PricingCards({ ids }: { ids?: string[] }) {
  // The 7-Week Money Reset is a program with its own page and banner, not a card.
  const list = ids ? offers.filter((o) => ids.includes(o.id)) : offers.filter((o) => o.id !== "reset");
  return (
    <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {list.map((o) => (
        <li key={o.id} className={cn(o.featured && "md:col-span-2 xl:col-span-1 xl:-my-4")}>
          <PricingCard offer={o} />
        </li>
      ))}
    </ul>
  );
}

export function PricingCard({ offer: o }: { offer: Offer }) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-[var(--radius-card)] border p-6 sm:p-7 xl:p-6",
        o.featured
          ? "border-gold bg-navy text-ivory shadow-lift ring-4 ring-gold/20"
          : "border-navy/10 bg-white text-navy shadow-soft",
      )}
    >
      {o.featured && (
        <Badge variant="light" className="absolute -top-3 left-7 bg-gold text-navy">
          <Star className="size-3 fill-current" aria-hidden /> Most popular start
        </Badge>
      )}
      <h3 className={cn("text-xl font-bold leading-snug", o.featured ? "text-ivory" : "text-navy")}>{o.name}</h3>
      <p className="mt-4 flex items-baseline gap-1.5">
        <span className="font-display text-5xl font-bold xl:text-[2.6rem]">{formatOfferPrice(o)}</span>
        <span className={cn("whitespace-nowrap text-sm", o.featured ? "text-ivory/70" : "text-slate-600")}>{formatOfferCadence(o)}</span>
      </p>
      <p className={cn("mt-2 text-sm font-semibold", o.featured ? "text-gold" : "text-emerald")}>{o.deliverable}</p>
      <p className={cn("mt-4 text-sm leading-relaxed", o.featured ? "text-ivory/80" : "text-slate-600")}>{o.description}</p>
      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {o.includes.map((item) => (
          <li key={item} className="flex gap-2.5">
            <Check className={cn("mt-0.5 size-4 shrink-0", o.featured ? "text-gold" : "text-emerald")} aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className={cn("mt-6 text-xs", o.featured ? "text-ivory/60" : "text-slate-600")}>Best for: {o.bestFor}</p>
      <ButtonLink href={o.href} variant={o.featured ? "gold" : o.price === 0 ? "primary" : "outline"} className="mt-5 h-auto min-h-11 w-full whitespace-normal py-2.5 text-center leading-snug">
        {o.ctaLabel}
      </ButtonLink>
    </div>
  );
}
