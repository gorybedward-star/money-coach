import Link from "next/link";
import { legalNav, mainNav, site } from "@/config/site";
import { Logo } from "./logo";

const toolLinks = [
  { href: "/tools/scorecard", label: "Family Money Scorecard" },
  { href: "/tools/pay-yourself-first", label: "Pay Yourself First Calculator" },
  { href: "/tools/cost-of-waiting", label: "Cost of Waiting Calculator" },
  { href: "/employee-benefits#checklist", label: "Employee Benefits Checklist" },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy text-ivory/80">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-sm font-display text-lg text-ivory">{site.tagline}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed">{site.promise}</p>
          </div>
          <FooterCol title="Explore" links={mainNav} />
          <FooterCol title="Free tools" links={toolLinks} />
          <FooterCol
            title="Company"
            links={[{ href: "/get-started", label: "Get Started" }, { href: "/get-started#contact", label: "Contact" }, ...legalNav]}
          />
        </div>

        <div className="mt-14 border-t border-ivory/15 pt-8 text-xs leading-relaxed text-ivory/70">
          <p>
            <strong className="text-ivory">Education only.</strong> {site.name} provides general financial education and
            coaching. We are not a registered investment adviser, broker-dealer, insurance agency, financial planner,
            attorney, CPA, or fiduciary, and nothing on this site is individualized investment, insurance, legal, or tax
            advice. Calculators show hypothetical illustrations, not guarantees. Investing involves risk, including loss
            of principal. Consult a qualified, licensed professional about your situation.{" "}
            <Link href="/disclaimer" className="underline underline-offset-2 hover:text-ivory">
              Read the full disclaimer
            </Link>
            .
          </p>
          <p className="mt-4">© {new Date().getFullYear()} {site.legalName}. {site.name} is owned and operated by {site.legalName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-gold">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-ivory hover:underline underline-offset-4">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
