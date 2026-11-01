import type { Metadata } from "next";
import { Section } from "@/components/section";
import { FedPageHeader, IndependenceNotice } from "@/components/federal/shared";
import { FedCtaBand } from "@/components/federal/fed-cta";
import { AgencyMatchCalculator } from "@/components/federal/agency-match-calculator";

export const metadata: Metadata = { title: "TSP Agency Match Calculator", description: "Estimate your contributions, Agency Automatic (1%) Contributions, and FERS matching, and see whether you may be missing any." };

export default function Page() {
  return (
    <>
      <FedPageHeader
        title="TSP Agency Match Calculator"
        intro="Estimate your contributions, Agency Automatic (1%) Contributions, and FERS matching, and see whether you may be missing any."
        back={{ href: "/federal-employees/calculators", label: "All TSP calculators" }}
        related={{ href: "/federal-employees/learn/agency-contributions", label: "Read: Agency automatic and matching contributions" }}
      />
      <Section className="!pt-10">
        <AgencyMatchCalculator />
        <IndependenceNotice className="mt-10" />
      </Section>
      <FedCtaBand />
    </>
  );
}
