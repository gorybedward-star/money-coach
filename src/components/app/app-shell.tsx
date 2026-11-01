import Link from "next/link";
import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { signOut } from "@/lib/actions/auth";
import { site } from "@/config/site";

type NavItem = { href: string; label: string };

/** Calm, minimal layout for the coach dashboard and client portal. */
export function AppShell({ area, nav = [], children, signedIn = true }: { area: string; nav?: NavItem[]; children: ReactNode; signedIn?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-navy/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href={nav[0]?.href ?? "/"} className="flex items-center gap-2.5">
            <LogoMark className="size-8" />
            <span className="font-display text-base font-bold tracking-tight">
              MONEY <span className="text-emerald">COACH</span>
            </span>
          </Link>
          <span className="hidden text-sm text-slate-600 sm:inline">· {area}</span>
          <nav aria-label={area} className="ml-auto flex items-center gap-1">
            {nav.slice(1).map((n) => (
              <Link key={n.href} href={n.href} className="rounded-full px-3 py-2 text-sm font-medium text-navy hover:bg-navy/5">
                {n.label}
              </Link>
            ))}
            {signedIn && (
              <form action={signOut}>
                <button type="submit" className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-navy/5 hover:text-navy">
                  <LogOut className="size-4" aria-hidden />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </form>
            )}
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-navy/10 px-4 py-6 text-center text-xs leading-relaxed text-slate-600 sm:px-6">
        <p className="mx-auto max-w-3xl">
          Money Coach provides financial education and coaching, not individualized investment, tax, or legal advice.
          Consult a licensed professional where needed. Money Coach is independent and is not affiliated with or endorsed by
          Morgan Housel, Dave Ramsey, or Ramsey Solutions.
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} {site.legalName} ·{" "}
          <Link href="/privacy" className="underline underline-offset-2">Privacy</Link>
        </p>
      </footer>
    </div>
  );
}

export function NotConfigured() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">The client portal is almost ready</h1>
      <p className="mt-3 text-slate-600">
        Coaching accounts aren&rsquo;t switched on yet. If you&rsquo;re a Money Coach client, please check back soon or email{" "}
        <a className="text-emerald underline" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">{eyebrow}</p>}
      <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{title}</h1>
      {children && <div className="mt-2 text-slate-600">{children}</div>}
    </div>
  );
}
