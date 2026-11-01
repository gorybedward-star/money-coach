import type { Metadata } from "next";
import { Section } from "@/components/section";
import { FedPageHeader, IndependenceNotice } from "@/components/federal/shared";
import { FedCtaBand } from "@/components/federal/fed-cta";
import { TspGrowthCalculator } from "@/components/federal/growth-calculator";

export const metadata: Metadata = { title: "TSP Growth Calculator", description: "Illustrate how a TSP balance could grow, with your contributions, agency contributions, and modeled growth shown separately." };

export default function Page() {
  return (
    <>
      <FedPageHeader
        title="TSP Growth Calculator"
        intro="Illustrate how a TSP balance could grow, with your contributions, agency contributions, and modeled growth shown separately."
        back={{ href: "/federal-employees/calculators", label: "All TSP calculators" }}
        related={{ href: "/federal-employees/learn/how-compound-growth-works", label: "Read: How compound growth works in your TSP" }}
      />
      <Section className="!pt-10">
        <TspGrowthCalculator />
        <IndependenceNotice className="mt-10" />
      </Section>
      <FedCtaBand />
    </>
  );
}
