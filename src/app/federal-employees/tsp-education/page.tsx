import type { Metadata } from "next";
import { Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { FedModuleCard } from "@/components/federal/module-card";
import { FedPageHeader, IndependenceNotice, NoSensitiveInfo } from "@/components/federal/shared";
import { FedCtaBand } from "@/components/federal/fed-cta";
import { fedModules } from "@/content/federal/modules";

export const metadata: Metadata = { title: "TSP Education Center", description: "Eleven short modules on how the Thrift Savings Plan works, from Traditional vs. Roth to withdrawals, with official sources and the risks spelled out." };

export default function Page() {
  const mods = fedModules.filter((m) => m.group === "tsp");
  return (
    <>
      <FedPageHeader title="TSP Education Center" intro="Eleven short modules on how the Thrift Savings Plan works, from Traditional vs. Roth to withdrawals, with official sources and the risks spelled out." />
      <Section>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mods.map((m, i) => (
            <Reveal as="li" key={m.slug} delay={(i % 3) * 60}><FedModuleCard module={m} index={i} /></Reveal>
          ))}
        </ul>
        <p className="mt-10 rounded-2xl border border-gold/50 bg-gold-50 p-5 leading-relaxed"><strong>Remember:</strong> the G Fund is not equivalent to a bank savings account, market-based funds can lose value, and retirement outcomes are not guaranteed.</p>
        <NoSensitiveInfo className="mt-10" />
        <IndependenceNotice className="mt-4" />
      </Section>
      <FedCtaBand />
    </>
  );
}
