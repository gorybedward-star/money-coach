import type { Metadata } from "next";
import { Section } from "@/components/section";
import { FedPageHeader, IndependenceNotice } from "@/components/federal/shared";
import { FedCtaBand } from "@/components/federal/fed-cta";
import { RothVsTraditionalCalculator } from "@/components/federal/roth-calculator";

export const metadata: Metadata = { title: "Traditional vs. Roth Education Calculator", description: "See how the timing of income tax changes after-tax results, using illustrative tax assumptions you choose. Neither option is universally better." };

export default function Page() {
  return (
    <>
      <FedPageHeader
        title="Traditional vs. Roth Education Calculator"
        intro="See how the timing of income tax changes after-tax results, using illustrative tax assumptions you choose. Neither option is universally better."
        back={{ href: "/federal-employees/calculators", label: "All TSP calculators" }}
        related={{ href: "/learn/traditional-vs-roth-tsp", label: "Read: Traditional vs. Roth TSP" }}
      />
      <Section className="!pt-10">
        <RothVsTraditionalCalculator />
        <IndependenceNotice className="mt-10" />
      </Section>
      <FedCtaBand />
    </>
  );
}
