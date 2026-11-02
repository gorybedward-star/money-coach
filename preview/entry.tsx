import { Component, Suspense, use, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { currentRoute, encode, subscribe } from "./router";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import Home from "@/app/page";
import Philosophy from "@/app/philosophy/page";
import Roadmap from "@/app/roadmap/page";
import Benefits from "@/app/employee-benefits/page";
import Tools from "@/app/tools/page";
import Scorecard from "@/app/tools/scorecard/page";
import PYF from "@/app/tools/pay-yourself-first/page";
import COW from "@/app/tools/cost-of-waiting/page";
import BG from "@/app/tools/budget/page";
import NW from "@/app/tools/net-worth/page";
import CG from "@/app/tools/compound-growth/page";
import EF from "@/app/tools/emergency-fund/page";
import DP from "@/app/tools/debt-payoff/page";
import EM from "@/app/tools/employer-match/page";
import LI from "@/app/tools/life-insurance/page";
import Pricing from "@/app/pricing/page";
import Learn from "@/app/learn/page";
import ArticlePage from "@/app/learn/[slug]/page";
import About from "@/app/about/page";
import GetStarted from "@/app/get-started/page";
import Privacy from "@/app/privacy/page";
import Terms from "@/app/terms/page";
import Disclaimer from "@/app/disclaimer/page";
import NotFound from "@/app/not-found";
import Fed from "@/app/federal-employees/page";
import FedCheckup from "@/app/federal-employees/tsp-checkup/page";
import FedCalcs from "@/app/federal-employees/calculators/page";
import FedMatch from "@/app/federal-employees/calculators/agency-match/page";
import FedGrowth from "@/app/federal-employees/calculators/growth/page";
import FedRoth from "@/app/federal-employees/calculators/roth-vs-traditional/page";
import FedCow from "@/app/federal-employees/calculators/cost-of-waiting/page";
import FedTspEd from "@/app/federal-employees/tsp-education/page";
import FedBenefits from "@/app/federal-employees/benefits/page";
import FedModulePage from "@/app/federal-employees/learn/[slug]/page";

// Forms have no server in the preview: answer like a site with no email tool connected.
const realFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url.includes("/api/lead")) return new Response(JSON.stringify({ ok: true, delivered: false }), { headers: { "Content-Type": "application/json" } });
  return realFetch(input, init);
};

// Route internal links through the hash.
document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest?.("a");
  if (!a || e.defaultPrevented || a.target === "_blank") return;
  const href = a.getAttribute("href");
  if (!href || !(href.startsWith("/") || href.startsWith("#"))) return;
  e.preventDefault();
  const next = encode(href, currentRoute());
  if (next === location.hash) scrollToFragment();
  else location.hash = next;
});

function scrollToFragment() {
  const f = currentRoute().fragment;
  if (f) setTimeout(() => document.getElementById(f)?.scrollIntoView({ behavior: "smooth" }), 60);
  else window.scrollTo(0, 0);
}

const cache = new Map<string, Promise<ReactNode>>();
function Async({ k, make }: { k: string; make: () => Promise<ReactNode> }) {
  if (!cache.has(k)) cache.set(k, make());
  return <>{use(cache.get(k)!)}</>;
}

class Boundary extends Component<{ children: ReactNode; k: string }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  componentDidUpdate(prev: { k: string }) { if (prev.k !== this.props.k && this.state.err) this.setState({ err: false }); }
  render() { return this.state.err ? <NotFound /> : this.props.children; }
}

const routes: Record<string, () => ReactNode> = {
  "/": () => <Home />,
  "/philosophy": () => <Philosophy />,
  "/roadmap": () => <Roadmap />,
  "/employee-benefits": () => <Benefits />,
  "/tools": () => <Tools />,
  "/tools/scorecard": () => <Scorecard />,
  "/tools/pay-yourself-first": () => <PYF />,
  "/tools/cost-of-waiting": () => <COW />,
  "/tools/budget": () => <BG />,
  "/tools/net-worth": () => <NW />,
  "/tools/compound-growth": () => <CG />,
  "/tools/emergency-fund": () => <EF />,
  "/tools/debt-payoff": () => <DP />,
  "/tools/employer-match": () => <EM />,
  "/tools/life-insurance": () => <LI />,
  "/pricing": () => <Pricing />,
  "/learn": () => <Learn />,
  "/about": () => <About />,
  "/privacy": () => <Privacy />,
  "/terms": () => <Terms />,
  "/disclaimer": () => <Disclaimer />,
  "/federal-employees": () => <Fed />,
  "/federal-employees/tsp-checkup": () => <FedCheckup />,
  "/federal-employees/calculators": () => <FedCalcs />,
  "/federal-employees/calculators/agency-match": () => <FedMatch />,
  "/federal-employees/calculators/growth": () => <FedGrowth />,
  "/federal-employees/calculators/roth-vs-traditional": () => <FedRoth />,
  "/federal-employees/calculators/cost-of-waiting": () => <FedCow />,
  "/federal-employees/tsp-education": () => <FedTspEd />,
  "/federal-employees/benefits": () => <FedBenefits />,
};

function App() {
  const hash = useSyncExternalStore(subscribe, () => location.hash, () => "");
  const r = currentRoute();
  useEffect(scrollToFragment, [hash]);
  let page: ReactNode;
  if (routes[r.path]) page = routes[r.path]();
  else if (r.path === "/get-started") page = <Async k={"gs" + r.service} make={() => GetStarted({ searchParams: Promise.resolve({ service: r.service }) })} />;
  else if (r.path.startsWith("/learn/")) {
    const slug = r.path.slice(7);
    page = <Async k={"a" + slug} make={() => ArticlePage({ params: Promise.resolve({ slug }) })} />;
  } else if (r.path.startsWith("/federal-employees/learn/")) {
    const slug = r.path.slice(25);
    page = <Async k={"f" + slug} make={() => FedModulePage({ params: Promise.resolve({ slug }) })} />;
  } else page = <NotFound />;
  return (
    <>
      <div className="bg-navy px-4 py-2 text-center text-xs text-ivory/80">Website preview · forms and booking are not connected</div>
      <SiteHeader />
      <main id="main" key={r.path + (r.service ?? "")}>
        <Boundary k={hash}><Suspense fallback={<div className="min-h-screen" />}>{page}</Suspense></Boundary>
      </main>
      <SiteFooter />
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
