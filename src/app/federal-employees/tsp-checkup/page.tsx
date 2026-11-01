import type { Metadata } from "next";
import { Section } from "@/components/section";
import { FedPageHeader, IndependenceNotice } from "@/components/federal/shared";
import { TspCheckup } from "@/components/federal/tsp-checkup";

export const metadata: Metadata = {
  title: "Free TSP Checkup",
  description: "A free 10-question educational TSP self-assessment for federal employees. Get an education score, learning modules, and three follow-up actions. No account details required.",
};

export default function Page() {
  return (
    <>
      <FedPageHeader
        title="Free TSP Checkup"
        intro="Ten quick questions about how well you know your Thrift Savings Plan. Answer Yes, Somewhat, or No. You'll get an education score, learning modules matched to your answers, and three follow-up actions."
        related={{ href: "/federal-employees/tsp-education", label: "Browse the TSP Education Center" }}
      />
      <Section className="!pt-10">
        <TspCheckup />
        <IndependenceNotice className="mx-auto mt-10 max-w-4xl" />
      </Section>
    </>
  );
}
