import type { Metadata } from "next";
import { Section } from "@/components/section";
import { FedPageHeader, IndependenceNotice } from "@/components/federal/shared";
import { FedCtaBand } from "@/components/federal/fed-cta";
import { FedCostOfWaitingCalculator } from "@/components/federal/fed-cost-of-waiting";

export const metadata: Metadata = { title: "Cost of Waiting: Federal Edition", description: "Compare hypothetical outcomes from starting TSP contributions now versus later, with contributions and modeled growth kept separate." };

export default function Page() {
  return (
    <>
      <FedPageHeader
        title="Cost of Waiting: Federal Edition"
        intro="Compare hypothetical outcomes from starting TSP contributions now versus later, with contributions and modeled growth kept separate."
        back={{ href: "/federal-employees/calculators", label: "All TSP calculators" }}
        related={{ href: "/learn/cost-of-waiting-tsp", label: "Read: The Cost of Waiting to Contribute to Your TSP" }}
      />
      <Section className="!pt-10">
        <FedCostOfWaitingCalculator />
        <IndependenceNotice className="mt-10" />
      </Section>
      <FedCtaBand />
    </>
  );
}
