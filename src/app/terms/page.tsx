import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Terms of Use", robots: { index: false } };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="[DATE]">
      <p>This website is operated by {site.legalName}, doing business as {site.name} (&ldquo;we,&rdquo; &ldquo;us&rdquo;). By using this website, you agree to these Terms of Use. If you do not agree, please do not use the site.</p>
      <h2>Educational purpose</h2>
      <p>{site.name} provides general financial education and coaching. Content, calculators, the Scorecard, and coaching sessions are educational and are not individualized investment, insurance, legal, tax, or financial planning advice. Please read our <Link href="/disclaimer">Financial Education Disclaimer</Link>.</p>
      <h2>No professional relationship</h2>
      <p>Using this site or purchasing coaching does not create an investment adviser, fiduciary, attorney-client, accountant-client, or insurance agency relationship.</p>
      <h2>Tools and calculators</h2>
      <p>Tools provide hypothetical illustrations based on the information you enter and stated assumptions. They are not guarantees or predictions of future results. You are responsible for decisions you make.</p>
      <h2>Coaching services</h2>
      <p>Service descriptions and prices may change. Specific terms for scheduling, payment, cancellations, and refunds will be provided before any purchase. [TO BE COMPLETED WHEN SERVICES AND PAYMENT PROCESS ARE APPROVED.]</p>
      <h2>Your responsibilities</h2>
      <p>Please don&rsquo;t submit sensitive information such as Social Security numbers, account credentials, or medical details, and don&rsquo;t misuse the site or attempt to disrupt it.</p>
      <h2>Intellectual property</h2>
      <p>All content on this site is owned by {site.legalName} or used with permission and may not be copied or redistributed without written consent, except for personal, non-commercial use.</p>
      <h2>Disclaimer of warranties and limitation of liability</h2>
      <p>The site is provided &ldquo;as is.&rdquo; To the fullest extent permitted by law, {site.name} disclaims all warranties and is not liable for losses arising from use of the site or reliance on its content. [ATTORNEY TO DRAFT FINAL LANGUAGE.]</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of [STATE]. [ATTORNEY TO CONFIRM.]</p>
      <h2>Contact</h2>
      <p><a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a></p>
    </LegalPage>
  );
}
