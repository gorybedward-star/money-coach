import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { BudgetTool } from "@/components/tools/budget";
import { Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";

export const metadata: Metadata = {
  title: "Family Budget Builder",
  description: "A simple, friendly monthly budget for working families: income, pay yourself first, essentials, debts, and fun, with a live checkup.",
};

export default function Page() {
  return (
    <>
      <ToolPageHeader
        title="Family Budget Builder"
        intro="Give every dollar a job in five simple steps. Your totals and a friendly budget checkup update as you type."
        related={{ href: "/learn/pay-yourself-first", label: "Read: Why You Should Always Pay Yourself First" }}
      />
      <Section className="!pt-10"><BudgetTool /></Section>
      <CtaBand title="Want help building your budget?" intro="A Money Clarity Session walks through your whole money picture with you and leaves you with a clear action checklist." />
    </>
  );
}
