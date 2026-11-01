import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { PayYourselfFirstCalculator } from "@/components/tools/pay-yourself-first";
import { Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";

export const metadata: Metadata = {
  title: "Pay Yourself First Calculator",
  description: "See how much saving a percentage of every paycheck adds up to per paycheck, per month, per year, and over time.",
};

export default function Page() {
  return (
    <>
      <ToolPageHeader
        title="Pay Yourself First Calculator"
        intro="A portion of all you earn is yours to keep. See what setting aside a percentage of every paycheck adds up to."
        related={{ href: "/learn/pay-yourself-first", label: "Read: Why You Should Always Pay Yourself First" }}
      />
      <Section className="!pt-10"><PayYourselfFirstCalculator /></Section>
      <CtaBand />
    </>
  );
}
