import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { LifeInsuranceEstimator } from "@/components/tools/life-insurance";
import { Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";

export const metadata: Metadata = {
  title: "Life Insurance Needs Estimator",
  description: "An educational estimate of how much life insurance coverage a family might need, with assumptions and limitations.",
};

export default function Page() {
  return (
    <>
      <ToolPageHeader
        title="Life Insurance Needs Estimator"
        intro="An educational starting point for thinking about how to protect your family."
        related={{ href: "/learn/term-vs-permanent-life-insurance", label: "Read: Term vs. Permanent Life Insurance" }}
      />
      <Section className="!pt-10"><LifeInsuranceEstimator /></Section>
      <CtaBand />
    </>
  );
}
