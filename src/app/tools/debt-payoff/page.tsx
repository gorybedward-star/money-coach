import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { DebtPayoffCalculator } from "@/components/tools/debt-payoff";
import { Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";

export const metadata: Metadata = {
  title: "Debt Payoff Calculator",
  description: "Compare the debt snowball and debt avalanche methods for paying off credit cards and personal loans.",
};

export default function Page() {
  return (
    <>
      <ToolPageHeader
        title="Debt Payoff Calculator"
        intro="Compare the snowball and avalanche methods and see when you could be debt-free."
        related={{ href: "/learn/eliminating-credit-card-debt", label: "Read: Eliminating Credit Card and Personal Debt" }}
      />
      <Section className="!pt-10"><DebtPayoffCalculator /></Section>
      <CtaBand />
    </>
  );
}
