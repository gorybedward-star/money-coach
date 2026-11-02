import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { NetWorthTool } from "@/components/tools/net-worth";
import { Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";

export const metadata: Metadata = {
  title: "Family Net Worth Tracker",
  description: "See what you own, what you owe, and your next move on the Money Roadmap. Save snapshots and watch your net worth grow. Free, private, no email required.",
};

export default function Page() {
  return (
    <>
      <ToolPageHeader
        title="Family Net Worth Tracker"
        intro="Your money starting line in one number: what you own minus what you owe. See your next move on the Money Roadmap, then save a snapshot each month and watch it climb."
        related={{ href: "/roadmap", label: "See the six-stage Money Roadmap" }}
      />
      <Section className="!pt-10"><NetWorthTool /></Section>
      <CtaBand title="Want a coach to help you grow this number?" primary={{ href: "/money-reset", label: "See the 7-Week Money Reset" }} intro="The 7-Week Money Reset turns your snapshot into a step-by-step plan: a safety net, a debt payoff plan, a protection review, and a path to investing." />
    </>
  );
}
