import { Quote } from "lucide-react";
import { testimonials } from "@/content/testimonials";
import { Section, SectionHeading } from "@/components/section";

/** Hidden until at least one approved quote is added in src/content/testimonials.ts. */
export function Testimonials({
  title = "What families are saying",
  tone = "white",
}: {
  title?: string;
  tone?: "ivory" | "white" | "sand";
}) {
  if (testimonials.length === 0) return null;
  return (
    <Section tone={tone} id="testimonials">
      <SectionHeading center eyebrow="In their words" title={title} />
      <ul className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <li key={t.name + t.quote.slice(0, 20)}>
            <figure className="flex h-full flex-col rounded-[var(--radius-card)] border border-navy/10 bg-ivory p-7">
              <Quote className="size-7 text-gold" aria-hidden />
              <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-navy">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-6 text-sm">
                <span className="font-semibold text-navy">{t.name}</span>
                {t.detail && <span className="block text-slate-600">{t.detail}</span>}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-slate-600">
        Shared with permission. Individual experiences vary and are not typical or guaranteed results. Coaching is education
        only, not financial, investment, insurance, legal, or tax advice.
      </p>
    </Section>
  );
}
