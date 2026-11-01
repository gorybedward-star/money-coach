import { ArrowRight } from "lucide-react";
import { site } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";

export function CtaBand({
  title = site.closing,
  intro = "Take the free Family Money Scorecard in about three minutes, or request your free Money Roadmap. No pressure, and no email needed to see your results.",
}: {
  title?: string;
  intro?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy py-20 text-ivory sm:py-28">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -left-24 bottom-0 size-80 rounded-full bg-emerald/20 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="text-balance text-3xl font-bold leading-tight sm:text-5xl">{title}</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-ivory/80">{intro}</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/get-started" size="lg" variant="gold">
            Get My Free Money Roadmap <ArrowRight />
          </ButtonLink>
          <ButtonLink href="/tools/scorecard" size="lg" variant="outlineLight">
            Take the Free Scorecard
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
