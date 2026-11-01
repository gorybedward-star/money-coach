/**
 * MONEY COACH — single source of truth for brand, contact, pricing, and feature flags.
 *
 * Edit this file to change prices, service descriptions, contact details, or to
 * turn on integrations once they are approved and configured.
 */

export const site = {
  name: "MONEY COACH",
  /** Legal entity that owns and operates MONEY COACH. */
  legalName: "Novus Core Holdings, LLC",
  tagline: "Building Wealth. Protecting Families. Creating Legacies.",
  promise:
    "We help families turn income into security, security into wealth, and wealth into legacy.",
  closing:
    "You don't have to be wealthy to start building wealth. You just have to start.",
  description:
    "Practical, affordable financial education for working families. Keep more of what you earn, maximize employer benefits, eliminate costly debt, protect your family, and build wealth that lasts.",
  // Set NEXT_PUBLIC_SITE_URL in your environment for correct SEO URLs.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // Business contact email (can be overridden with NEXT_PUBLIC_CONTACT_EMAIL).
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "bedwardghllc@outlook.com",
  founder: {
    name: "Gory H. Bedward",
    firstName: "Gory",
    title: "Founder, MONEY COACH",
    background: "U.S. Navy veteran",
  },
} as const;

/**
 * Feature flags. Everything that depends on an outside service is OFF until
 * the founder approves it and the integration is configured.
 */
export const features = {
  /** [FOUNDER APPROVAL + EXTERNAL SETUP] Stripe or similar. Keep false until fulfillment is approved. */
  paymentsEnabled: false,
  /** [EXTERNAL SETUP] Set NEXT_PUBLIC_BOOKING_URL to a Cal.com / Calendly link to show a real booking button. */
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? "",
  /** Deliberately disabled. Do not enable without an approved secure document-handling process. */
  documentUploadsEnabled: false,
  /** [FOUNDER APPROVAL] Shown as "proposed launch pricing" until set to true. */
  pricingApproved: false,
  /** [FOUNDER APPROVAL] Shown with a "founder-reported" note until confirmed. */
  milestonesConfirmed: false,
} as const;

export type Offer = {
  id: string;
  name: string;
  price: number; // USD, 0 = free
  cadence: "free" | "one-time" | "month";
  deliverable: string;
  description: string;
  includes: string[];
  bestFor: string;
  featured?: boolean;
  ctaLabel: string;
  href: string;
};

/** [FOUNDER APPROVAL] Proposed launch prices. Edit here; every page reads from this list. */
export const offers: Offer[] = [
  {
    id: "scorecard",
    name: "Free Family Money Scorecard",
    price: 0,
    cadence: "free",
    deliverable: "Assessment and educational action plan",
    description:
      "A 10-question check-up on the habits that build family wealth. Get your score and three next steps instantly.",
    includes: [
      "10 quick Yes / Sometimes / No questions",
      "Instant score and plain-English interpretation",
      "Three recommended educational next steps",
      "No email required to see results",
    ],
    bestFor: "Anyone who wants to know where to start",
    ctaLabel: "Take the free Scorecard",
    href: "/tools/scorecard",
  },
  {
    id: "clarity",
    name: "Money Clarity Session",
    price: 99,
    cadence: "one-time",
    deliverable: "60-minute session and action checklist",
    description:
      "One focused hour to look at your whole money picture, find the leaks, and leave with a clear checklist.",
    includes: [
      "60-minute one-on-one coaching session",
      "Cash flow and pay-yourself-first review",
      "Debt and emergency fund priorities",
      "Personalized educational action checklist",
    ],
    bestFor: "Families who feel stuck or overwhelmed",
    ctaLabel: "Request a Clarity Session",
    href: "/get-started?service=clarity",
  },
  {
    id: "benefits",
    name: "Employee Benefits Checkup",
    price: 149,
    cadence: "one-time",
    deliverable: "Benefits review and opportunity report",
    description:
      "Most working families leave value on the table at work. We walk through your benefits together and map out the questions worth asking.",
    includes: [
      "Guided review of your employer benefits",
      "Retirement match, vesting, and insurance walkthrough",
      "HSA, FSA, and other overlooked benefits",
      "Benefits Opportunity Report with questions for HR",
    ],
    bestFor: "Anyone with workplace benefits, especially before open enrollment",
    featured: true,
    ctaLabel: "Request a Benefits Checkup",
    href: "/get-started?service=benefits",
  },
  {
    id: "roadmap",
    name: "Family Wealth Roadmap",
    price: 299,
    cadence: "one-time",
    deliverable: "Comprehensive review and 90-day educational plan",
    description:
      "A deeper look at your household across all six pillars, with a practical 90-day plan you can actually follow.",
    includes: [
      "Comprehensive review across all six pillars",
      "Includes a Benefits Checkup",
      "Debt payoff and savings strategy education",
      "90-day educational action plan",
    ],
    bestFor: "Families ready for a complete game plan",
    ctaLabel: "Request a Wealth Roadmap",
    href: "/get-started?service=roadmap",
  },
  {
    id: "coaching",
    name: "Ongoing Money Coaching",
    price: 79,
    cadence: "month",
    deliverable: "Monthly coaching, accountability, and education",
    description:
      "Stay consistent with a monthly check-in, accountability, and education as your life and goals change.",
    includes: [
      "Monthly coaching session",
      "Accountability on your action plan",
      "Ongoing education and resources",
      "Cancel anytime",
    ],
    bestFor: "Families who want a partner for the long run",
    ctaLabel: "Ask about coaching",
    href: "/get-started?service=coaching",
  },
];

export function getOffer(id: string) {
  return offers.find((o) => o.id === id);
}

export function formatOfferPrice(offer: Offer) {
  if (offer.price === 0) return "Free";
  return `$${offer.price}`;
}

export function formatOfferCadence(offer: Offer) {
  if (offer.cadence === "free") return "";
  if (offer.cadence === "month") return "/month";
  return "one-time";
}

/** [FOUNDER APPROVAL] Founder-reported milestones. Confirm before publication. */
export const founderMilestones = [
  { value: "18", label: "Age I started investing in stocks" },
  { value: "~$500K", label: "Approximate personal net worth" },
  { value: "~800", label: "Approximate credit score" },
  { value: "Rentals", label: "Owner of rental properties" },
  { value: "Protected", label: "Life insurance in place for my family" },
] as const;

export const mainNav = [
  { href: "/philosophy", label: "Our Philosophy" },
  { href: "/roadmap", label: "Money Roadmap" },
  { href: "/employee-benefits", label: "Employee Benefits" },
  { href: "/tools", label: "Free Tools" },
  { href: "/pricing", label: "Coaching & Pricing" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About Gory" },
] as const;

export const legalNav = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/disclaimer", label: "Financial Education Disclaimer" },
] as const;
