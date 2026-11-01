import type { Metadata } from "next";
import { Calendar, ClipboardCheck, Map, MessageCircle } from "lucide-react";
import { features, getOffer, offers, site } from "@/config/site";
import { PageHero, Section } from "@/components/section";
import { LeadForm } from "@/components/lead-form";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Get Started",
  description: "Get your free Family Money Roadmap, take the free Scorecard, or request a coaching session with MONEY COACH.",
};

export default async function GetStartedPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const selected = service ? getOffer(service) : undefined;
  const paidServices = offers.filter((o) => o.price > 0).map((o) => ({ value: o.id, label: `${o.name} ($${o.price}${o.cadence === "month" ? "/mo" : ""})` }));

  return (
    <>
      <PageHero
        eyebrow="Get started"
        title="Your next step starts here."
        intro="Begin free, at your own pace. When you're ready for one-on-one help, we're here."
      />

      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          <Step icon={ClipboardCheck} n={1} title="Take the free Scorecard" body="Ten questions, three minutes, instant results. No email needed.">
            <ButtonLink href="/tools/scorecard" className="mt-6">Start the Scorecard</ButtonLink>
          </Step>
          <Step icon={Map} n={2} title="Get your free Money Roadmap" body="Tell us where to send it and we'll email an educational Family Money Roadmap.">
            <ButtonLink href="#roadmap" variant="outline" className="mt-6">Request my Roadmap</ButtonLink>
          </Step>
          <Step icon={MessageCircle} n={3} title="Talk with a coach" body="Request a Benefits Checkup, Clarity Session, or Wealth Roadmap.">
            <ButtonLink href="#contact" variant="outline" className="mt-6">Request a session</ButtonLink>
          </Step>
        </div>
      </Section>

      <Section tone="white" id="roadmap">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">Free lead magnet</p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Get My Free Family Money Roadmap</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              A practical, step-by-step educational guide to the six stages of building family wealth, with checklists and links to free tools.
              For a more personalized version, take the Scorecard first and request your Roadmap from your results page.
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-navy/10 bg-ivory p-6 sm:p-8">
            <LeadForm type="roadmap" submitLabel="Send My Free Roadmap" />
          </div>
        </div>
      </Section>

      <Section id="contact">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">Request a session or ask a question</p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{selected ? `Request: ${selected.name}` : "Let's talk"}</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Tell us a little about what you&rsquo;re looking for. We&rsquo;ll reply to confirm details, scheduling, and next steps. Nothing is
              charged online.
            </p>
            <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-6">
              <p className="flex items-center gap-2 font-semibold"><Calendar className="size-5 text-emerald" aria-hidden /> Book a time</p>
              {features.bookingUrl ? (
                <ButtonLink href={features.bookingUrl} target="_blank" rel="noopener noreferrer" className="mt-4">Open the booking calendar</ButtonLink>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Online booking is coming soon. For now, send a request with the form and we&rsquo;ll find a time with you by email.
                </p>
              )}
            </div>
            <p className="mt-6 text-sm text-slate-600">
              Prefer email? Write to <a className="font-semibold text-emerald underline" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-6 shadow-soft sm:p-8">
            <LeadForm type="contact" showMessage services={paidServices} defaultService={selected?.price ? selected.id : undefined} submitLabel="Send my request" />
          </div>
        </div>
      </Section>
    </>
  );
}

function Step({ icon: Icon, n, title, body, children }: { icon: React.ElementType; n: number; title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-[var(--radius-card)] border border-navy/8 bg-white p-7 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald"><Icon className="size-6" aria-hidden /></span>
        <span className="font-display text-4xl font-bold text-gold/50">0{n}</span>
      </div>
      <h2 className="mt-5 text-xl font-bold">{title}</h2>
      <p className="mt-2 flex-1 text-slate-600">{body}</p>
      <div>{children}</div>
    </div>
  );
}
