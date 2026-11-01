import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Privacy Policy", robots: { index: false } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="[DATE]">
      <p>This Privacy Policy explains how {site.legalName}, doing business as {site.name} (&ldquo;we,&rdquo; &ldquo;us&rdquo;), collects, uses, and protects information when you use this website.</p>
      <h2>Information we collect</h2>
      <ul>
        <li><strong>Information you choose to give us:</strong> your first name (optional), email address, the service you&rsquo;re interested in, and any message you send through a form.</li>
        <li><strong>Limited tool context:</strong> if you choose to email your Scorecard or Benefits Checklist results, we receive a summary such as your score or the number of items reviewed.</li>
        <li><strong>Technical information:</strong> our hosting provider may automatically log standard information like IP address, browser type, and pages visited for security and reliability.</li>
      </ul>
      <h2>What we do not collect</h2>
      <p>We do not ask for, and you should not send us, Social Security numbers, financial account numbers or passwords, medical information, or benefits documents. Our calculators and Scorecard run in your browser; your inputs are not sent to us unless you choose to submit a form.</p>
      <h2>How we use information</h2>
      <ul>
        <li>To respond to your request and provide the services you ask for.</li>
        <li>To send marketing emails only if you checked the separate consent box. You can unsubscribe at any time.</li>
        <li>To operate, secure, and improve the website.</li>
      </ul>
      <h2>Sharing</h2>
      <p>We do not sell your personal information. We may share it with service providers who help us operate the site and send email [LIST PROVIDERS ONCE SELECTED], who may only use it on our behalf, or when required by law.</p>
      <h2>Cookies and analytics</h2>
      <p>[TO BE COMPLETED once analytics or other tracking tools are selected. As built, the site does not set advertising or analytics cookies.]</p>
      <h2>Data retention</h2>
      <p>We keep information only as long as needed for the purposes above or as required by law. [SPECIFY RETENTION PERIOD.]</p>
      <h2>Your choices and rights</h2>
      <p>You may ask to access, correct, or delete your personal information, and you may opt out of marketing emails at any time. Depending on where you live, you may have additional rights under state law. [CONFIRM APPLICABLE STATE LAWS.]</p>
      <h2>Children</h2>
      <p>This site is intended for adults. We do not knowingly collect personal information from children under 13.</p>
      <h2>Contact</h2>
      <p>Questions about privacy: <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>. [ADD BUSINESS MAILING ADDRESS.]</p>
    </LegalPage>
  );
}
