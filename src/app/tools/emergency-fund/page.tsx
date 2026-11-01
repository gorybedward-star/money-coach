import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { EmergencyFundCalculator } from "@/components/tools/emergency-fund";
import { Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";

export const metadata: Metadata = {
  title: "Emergency Fund Calculator",
  description: "Find your emergency fund target, your savings gap, and how long it could take to get there.",
};

export default function Page() {
  return (
    <>
      <ToolPageHeader
        title="Emergency Fund Calculator"
        intro="Find your reserve target, your savings gap, and a realistic timeline."
        related={{ href: "/learn/building-an-emergency-fund", label: "Read: Building an Emergency Fund" }}
      />
      <Section className="!pt-10"><EmergencyFundCalculator /></Section>
      <CtaBand />
    </>
  );
}
