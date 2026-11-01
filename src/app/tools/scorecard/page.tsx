import type { Metadata } from "next";
import { Scorecard } from "@/components/tools/scorecard";

export const metadata: Metadata = {
  title: "Free Family Money Scorecard",
  description: "Ten quick questions to see how strong your family's financial foundation is. Get your score and three next steps instantly, no email required.",
};

export default function ScorecardPage() {
  return (
    <section className="bg-ivory-200 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">Free · 3 minutes · No email needed</p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Family Money Scorecard</h1>
          <p className="mt-4 text-lg text-slate-600">Answer honestly. There are no wrong answers, only a starting point.</p>
        </div>
        <Scorecard />
      </div>
    </section>
  );
}
