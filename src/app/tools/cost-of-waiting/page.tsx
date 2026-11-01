import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { CostOfWaitingCalculator } from "@/components/tools/cost-of-waiting";
import { Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";

export const metadata: Metadata = {
  title: "Cost of Waiting Calculator",
  description: "Compare investing now versus waiting a few years, and see how much compound growth time can add in a hypothetical illustration.",
};

export default function Page() {
  return (
    <>
      <ToolPageHeader
        title="Cost of Waiting Calculator"
        intro="Time is a working family's greatest advantage. Compare starting to invest now with waiting a few more years."
        related={{ href: "/learn/cost-of-waiting", label: "Read: The Cost of Waiting to Invest" }}
      />
      <Section className="!pt-10"><CostOfWaitingCalculator /></Section>
      <CtaBand />
    </>
  );
}
