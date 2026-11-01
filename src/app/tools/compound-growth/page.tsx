import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { CompoundGrowthCalculator } from "@/components/tools/compound-growth";
import { Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";

export const metadata: Metadata = {
  title: "Compound Growth Calculator",
  description: "Project how a starting balance and monthly contributions could grow over time with a hypothetical return.",
};

export default function Page() {
  return (
    <>
      <ToolPageHeader
        title="Compound Growth Calculator"
        intro="See how time, consistency, and growth on top of growth work together."
        related={{ href: "/learn/compound-interest", label: "Read: How Compound Interest Builds Wealth" }}
      />
      <Section className="!pt-10"><CompoundGrowthCalculator /></Section>
      <CtaBand />
    </>
  );
}
