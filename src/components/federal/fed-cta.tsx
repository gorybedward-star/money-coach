import { CtaBand } from "@/components/cta-band";

export function FedCtaBand() {
  return (
    <CtaBand
      title="Your federal benefits are part of your wealth."
      intro="Take the free TSP Checkup, or explore the calculators. No account details, ever."
      primary={{ href: "/federal-employees/tsp-checkup", label: "Get My Free TSP Checkup" }}
      secondary={{ href: "/federal-employees/calculators", label: "Explore TSP Calculators" }}
    />
  );
}
