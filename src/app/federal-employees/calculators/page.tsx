import type { Metadata } from "next";
import { Section } from "@/components/section";
import { ToolCard } from "@/components/tool-card";
import { Reveal } from "@/components/reveal";
import { FedPageHeader, IndependenceNotice, NoSensitiveInfo } from "@/components/federal/shared";
import { FedCtaBand } from "@/components/federal/fed-cta";
import { fedTools } from "@/content/federal/tools";

export const metadata: Metadata = {
  title: "TSP Calculators",
  description: "Free educational TSP calculators for federal employees: agency match, growth, Traditional vs. Roth, and the cost of waiting. Assumptions disclosed.",
};

export default function Page() {
  return (
    <>
      <FedPageHeader title="TSP Calculators" intro="Educational tools that show their math and their assumptions. Results are hypothetical illustrations, not predictions or advice." />
      <Section>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fedTools.map((t, i) => (
            <Reveal as="li" key={t.href} delay={(i % 3) * 60}><ToolCard tool={t} /></Reveal>
          ))}
        </ul>
        <NoSensitiveInfo className="mt-8" />
        <IndependenceNotice className="mt-6" />
      </Section>
      <FedCtaBand />
    </>
  );
}
