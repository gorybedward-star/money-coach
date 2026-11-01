import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Financial Education Disclaimer" };

export default function DisclaimerPage() {
  return (
    <LegalPage title="Financial Education Disclaimer" updated="[DATE]">
      <p>{site.name}, owned and operated by {site.legalName}, is an education-first business. Everything on this website and in our coaching is provided for general educational and informational purposes only.</p>
      <h2>Not professional advice</h2>
      <p>{site.name} and its founder, {site.founder.name}, are not registered investment advisers, broker-dealers, licensed insurance agents, certified financial planners, attorneys, CPAs, or fiduciaries. We do not provide individualized investment recommendations, sell insurance or investment products, or give legal or tax advice. Consider consulting appropriately licensed professionals before making financial decisions.</p>
      <h2>Investing involves risk</h2>
      <p>All investing involves risk, including the possible loss of principal. Discussion of diversified, low-cost ETFs reflects a general educational principle and the founder&rsquo;s personal views. It is not a guarantee or a recommendation suitable for everyone. Past performance does not guarantee future results.</p>
      <h2>Hypothetical illustrations</h2>
      <p>Calculators and examples use hypothetical rates of return and simplified assumptions. They do not represent any specific investment, do not account for all taxes, fees, or inflation, and are not predictions of actual results.</p>
      <h2>Insurance</h2>
      <p>Life and disability insurance are important protection considerations, but appropriate coverage depends on individual circumstances. Speak with a licensed insurance professional about your needs.</p>
      <h2>Employee benefits</h2>
      <p>Benefit availability, eligibility, and rules vary by employer. Your employer&rsquo;s plan documents and plan administrators determine actual coverage and eligibility. We do not guarantee eligibility or savings.</p>
      <h2>Founder milestones</h2>
      <p>Personal financial milestones described on this site are founder-reported, shared to illustrate principles, and are not typical or guaranteed. Individual results vary.</p>
      <h2>No testimonials or guarantees</h2>
      <p>We do not promise any specific financial outcome from using our content, tools, or services.</p>
    </LegalPage>
  );
}
