import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { EmployerMatchCalculator } from "@/components/tools/employer-match";
import { Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";

export const metadata: Metadata = {
  title: "Employer Retirement Match Calculator",
  description: "See your contributions, your potential employer match, and whether you may be leaving match money on the table.",
};

export default function Page() {
  return (
    <>
      <ToolPageHeader
        title="Employer Retirement Match Calculator"
        intro="Your match is part of your pay. See what you could be receiving."
        related={{ href: "/learn/employer-retirement-matching", label: "Read: Understanding Employer Retirement Matching" }}
      />
      <Section className="!pt-10"><EmployerMatchCalculator /></Section>
      <CtaBand />
    </>
  );
}
