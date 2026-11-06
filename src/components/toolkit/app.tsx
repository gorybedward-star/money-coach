"use client";

import { useEffect, useState, type ComponentType } from "react";
import {
  Award,
  CalendarCheck,
  ChartLine,
  ClipboardCheck,
  CreditCard,
  Database,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Sprout,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DISCLAIMER_SHORT, toolkitBrand } from "@/content/toolkit";
import { ToolkitProvider, go, useToolkit, useView, type View } from "./store";
import { Dashboard } from "./dashboard";
import { Onboarding } from "./onboarding";
import { PaycheckPlanner } from "./paycheck";
import { DebtTracker } from "./debt";
import { EmergencyFund } from "./emergency";
import { InvestingCalculator } from "./investing";
import { BenefitsChecklist } from "./benefits";
import { MoneyReset } from "./reset";
import { NetWorthTracker } from "./net-worth";
import { DataSettings } from "./data";
import { Results } from "./results";
import { Celebration } from "./coach";
import { startReset } from "@/lib/toolkit/calc";

const NAV: { view: View; label: string; icon: ComponentType<{ className?: string }>; n?: number }[] = [
  { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { view: "net-worth", label: "Net Worth", icon: ChartLine, n: 7 },
  { view: "paycheck", label: "Paycheck Planner", icon: Wallet, n: 1 },
  { view: "debt", label: "Debt Freedom", icon: CreditCard, n: 2 },
  { view: "emergency", label: "Emergency Fund", icon: ShieldCheck, n: 3 },
  { view: "investing", label: "Investing", icon: Sprout, n: 4 },
  { view: "benefits", label: "Benefits Checklist", icon: ClipboardCheck, n: 5 },
  { view: "reset", label: "30-Day Reset", icon: CalendarCheck, n: 6 },
  { view: "results", label: "My Results", icon: Award },
];

const MOBILE_TABS: View[] = ["dashboard", "net-worth", "paycheck", "debt"];

function Wordmark({ light = true }: { light?: boolean }) {
  return (
    <div className="leading-tight">
      <p className={cn("text-[11px] font-semibold uppercase tracking-[0.28em]", light ? "text-[#8cc7b5]" : "text-[#167d68]")}>Money Coach</p>
      <p className={cn("font-display text-[17px] font-semibold", light ? "text-white" : "text-[#0b1f3a]")}>{toolkitBrand.name}</p>
    </div>
  );
}

function NavList({ view, onPick }: { view: View; onPick?: () => void }) {
  return (
    <nav aria-label="Toolkit" className="space-y-0.5">
      {NAV.map((item) => {
        const active = view === item.view;
        const Icon = item.icon;
        return (
          <a
            key={item.view}
            href={`#/${item.view}`}
            onClick={onPick}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-white/70 transition hover:bg-white/5 hover:text-white",
              active && "bg-white/10 text-white",
            )}
          >
            {active && <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-[#8cc7b5]" />}
            <Icon className={cn("size-[18px] shrink-0", active ? "text-[#8cc7b5]" : "text-white/50")} />
            <span className="flex-1">{item.label}</span>
            {item.n && <span className="text-[11px] tabular-nums text-white/35">{item.n}</span>}
          </a>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ onPick }: { onPick?: () => void }) {
  return (
    <div className="space-y-3 border-t border-white/10 pt-4">
      <a href="#/data" onClick={onPick} className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-white/60 hover:bg-white/5 hover:text-white">
        <Database className="size-4" /> Your data
      </a>
      <div className="rounded-xl bg-white/5 p-3.5 text-[12px] leading-relaxed text-white/60">
        Want a coach in your corner?{" "}
        <a href={toolkitBrand.coachingHref} className="font-semibold text-[#8cc7b5] underline-offset-2 hover:underline">
          About the 7-Week Money Reset
        </a>
      </div>
    </div>
  );
}

function PrototypeBanner() {
  const { state } = useToolkit();
  return (
    <div className="border-b border-[#b8954a]/30 bg-[#fbf6ea] px-4 py-2 print:hidden text-center text-[12px] leading-snug text-[#5c4a1f]">
      <strong className="font-semibold">Prototype.</strong> {state.mode === "sample" ? "Showing a fictional sample family. " : ""}Everything is saved only in this browser. Please don&rsquo;t enter account numbers or other sensitive details.{" "}
      <a href="#/data" className="font-semibold underline underline-offset-2">Manage data</a>
    </div>
  );
}

function Shell() {
  const { state, update } = useToolkit();
  const view = useView();
  const [open, setOpen] = useState(false);

  // Day 1 of the 30-Day Reset starts the first time the dashboard is used, with today's numbers as the baseline.
  useEffect(() => {
    if (state.onboarded && !state.reset.startedAt) update((s) => (s.reset.startedAt ? s : startReset(s)));
  }, [state.onboarded, state.reset.startedAt, update]);

  useEffect(() => {
    if (!state.onboarded && view !== "welcome") go("welcome");
  }, [state.onboarded, view]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (view === "welcome") return <Onboarding />;

  const page = (() => {
    switch (view) {
      case "paycheck": return <PaycheckPlanner />;
      case "debt": return <DebtTracker />;
      case "emergency": return <EmergencyFund />;
      case "investing": return <InvestingCalculator />;
      case "benefits": return <BenefitsChecklist />;
      case "reset": return <MoneyReset />;
      case "net-worth": return <NetWorthTracker />;
      case "data": return <DataSettings />;
      case "results": return <Results />;
      default: return <Dashboard />;
    }
  })();

  return (
    <div className="min-h-dvh bg-[#f4f6f9] text-[#0b1f3a]">
      <a href="#toolkit-main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">Skip to content</a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] print:!hidden flex-col justify-between bg-[#0b1f3a] px-4 py-6 lg:flex">
        <div className="space-y-8">
          <div className="px-3"><Wordmark /></div>
          <NavList view={view} />
        </div>
        <SidebarFooter />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-[#0b1f3a] px-4 py-3 print:hidden lg:hidden">
        <Wordmark />
        <button type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl text-white hover:bg-white/10">
          <Menu className="size-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-[#0b1f3a]/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[84%] max-w-xs flex-col justify-between overflow-y-auto bg-[#0b1f3a] px-4 py-5">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-3">
                <Wordmark />
                <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-lg text-white hover:bg-white/10">
                  <X className="size-5" />
                </button>
              </div>
              <NavList view={view} onPick={() => setOpen(false)} />
            </div>
            <SidebarFooter onPick={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-[264px] print:pl-0">
        <PrototypeBanner />
        <main id="toolkit-main" className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pb-16 lg:pt-10">
          {page}
          <footer className="mt-12 border-t border-[#e3e8ef] pt-6 text-[12px] leading-relaxed text-[#5f6f86]">
            <p>{DISCLAIMER_SHORT} <a href="/disclaimer" className="underline underline-offset-2">Full disclaimer</a></p>
            <p className="mt-2">&copy; {new Date().getFullYear()} Novus Core Holdings, LLC. Money Coach, founded by Gory H. Bedward.</p>
          </footer>
        </main>
      </div>

      <Celebration />

      {/* Mobile bottom tabs */}
      <nav aria-label="Quick" className="fixed inset-x-0 bottom-0 z-30 print:hidden grid grid-cols-5 border-t border-[#e3e8ef] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {MOBILE_TABS.map((v) => {
          const item = NAV.find((n) => n.view === v)!;
          const Icon = item.icon;
          const active = view === v;
          return (
            <a key={v} href={`#/${v}`} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium text-[#5f6f86]", active && "text-[#0b1f3a]")}>
              <Icon className={cn("size-5", active && "text-[#167d68]")} />
              {v === "dashboard" ? "Home" : item.label.split(" ")[0]}
            </a>
          );
        })}
        <button type="button" onClick={() => setOpen(true)} className="flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium text-[#5f6f86]">
          <Menu className="size-5" /> More
        </button>
      </nav>
    </div>
  );
}

function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#f4f6f9]">
      <div className="text-center">
        <Wordmark light={false} />
        <p className="mt-3 text-sm text-[#5f6f86]">Loading your toolkit&hellip;</p>
      </div>
    </div>
  );
}

export function ToolkitApp() {
  return (
    <ToolkitProvider fallback={<Loading />}>
      <Shell />
    </ToolkitProvider>
  );
}
