import type { Metadata } from "next";
import { Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { FedModuleCard } from "@/components/federal/module-card";
import { FedPageHeader, IndependenceNotice, NoSensitiveInfo } from "@/components/federal/shared";
import { FedCtaBand } from "@/components/federal/fed-cta";
import { fedModules } from "@/content/federal/modules";

export const metadata: Metadata = { title: "Federal Benefits Education", description: "Introductory modules on FERS, Social Security, FEGLI, FEHB, FEDVIP, FSAFEDS, and retirement milestones. Eligibility and coverage depend on applicable rules and your individual circumstances." };

export default function Page() {
  const mods = fedModules.filter((m) => m.group === "benefits");
  return (
    <>
      <FedPageHeader title="Federal Benefits Education" intro="Introductory modules on FERS, Social Security, FEGLI, FEHB, FEDVIP, FSAFEDS, and retirement milestones. Eligibility and coverage depend on applicable rules and your individual circumstances." />
      <Section>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mods.map((m, i) => (
            <Reveal as="li" key={m.slug} delay={(i % 3) * 60}><FedModuleCard module={m} index={i} /></Reveal>
          ))}
        </ul>
        <p className="mt-10 rounded-2xl bg-emerald-50 p-5 leading-relaxed">These modules are introductions. Eligibility, coverage, and costs depend on your appointment, retirement system, service history, and individual circumstances. Confirm details with your agency HR office, OPM, and the program websites linked in each module.</p>
        <NoSensitiveInfo className="mt-10" />
        <IndependenceNotice className="mt-4" />
      </Section>
      <FedCtaBand />
    </>
  );
}
