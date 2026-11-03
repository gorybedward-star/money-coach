import type { Metadata } from "next";
import { PageHero, Section } from "@/components/section";
import { TestimonialForm } from "@/components/testimonial-form";

export const metadata: Metadata = {
  title: "Share Your Story",
  description: "Worked with MONEY COACH? Share a few words about your experience.",
  robots: { index: false },
};

export default function ShareYourStoryPage() {
  return (
    <>
      <PageHero
        eyebrow="Share your story"
        title="Did coaching help your family?"
        intro="Your words can help another family take their first step. It takes about two minutes."
      />
      <Section>
        <div className="mx-auto max-w-2xl">
          <TestimonialForm />
          <p className="mt-6 text-xs leading-relaxed text-slate-600">
            We only publish stories with your permission, and we never change their meaning. We never share your email. See our{" "}
            <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>.
          </p>
        </div>
      </Section>
    </>
  );
}
