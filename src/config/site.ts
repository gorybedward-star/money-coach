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

/**
 * The one next step every page ends with. Opens an email to the founder until
 * NEXT_PUBLIC_BOOKING_URL (for example a Cal.com link) is set, then opens that instead.
 */
const bookCallSubject = "Free 15-minute call request";
const bookCallBody =
  "Hi Gory,\n\nI'd like to book a free 15-minute call.\n\nMy name:\nBest days and times to reach me:\nWhat I'd most like help with:\n\nThank you!";
export const bookCall = {
  label: "Book your free 15-minute call",
  href:
    features.bookingUrl ||
    `mailto:${site.contactEmail}?subject=${encodeURIComponent(bookCallSubject)}&body=${encodeURIComponent(bookCallBody)}`,
  isExternal: Boolean(features.bookingUrl),
} as const;

/**
 * [FOUNDER APPROVAL] Money-back guarantee on the 7-Week Money Reset.
 * Edit the wording here; the Reset page, pricing ladder, Scorecard results and Terms read from it.
 * It refunds the coaching fee only. It never promises a financial result.
 */
export const resetGuarantee = {
  title: "Two-week money-back guarantee",
  short: "Do the first two weeks. If it isn't worth it, you get every dollar back.",
  detail:
    "Attend your first two sessions and complete your first two One Money Moves. If you don't feel the Money Reset is worth what you paid, tell us before your Week 3 session and we'll refund 100% of your program fee. No forms and no hard feelings.",
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
      "A 10-question check-up on the habits that build family wealth. See your score and your next money move instantly.",
    includes: [
      "10 quick Yes / Sometimes / No questions",
      "Instant score and plain-English interpretation",
      "Your #1 next money move, free with no email",
      "Full 3-step plan and the free \"Your First $100,000\" guide by email",
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
      "Insurance protection check: life, disability, and health",
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
      "Retirement match, vesting, and workplace insurance walkthrough",
      "Protection gap check: life, disability, and health coverage",
      "HSA, FSA, and other overlooked benefits",
      "Benefits Opportunity Report with questions for HR",
    ],
    bestFor: "Anyone with workplace benefits, especially before open enrollment",
    featured: true,
    ctaLabel: "Request a Benefits Checkup",
    href: "/get-started?service=benefits",
  },
  {
    id: "reset",
    name: "The 7-Week Money Reset",
    price: 497,
    cadence: "one-time",
    deliverable: "Seven one-on-one sessions and a personal financial roadmap",
    description:
      "Our flagship coaching program. One week, one objective, one money move, with a coach keeping you accountable the whole way.",
    includes: [
      "Seven 50-minute one-on-one coaching sessions",
      "Your own private client portal with weekly checklists",
      "A clear One Money Move every week, with reminders",
      "Insurance protection review: life, disability, health, and beneficiaries",
      "Graduation scorecard, 90-day plan, and 12-month roadmap",
    ],
    bestFor: "Families ready to change their money habits for good",
    ctaLabel: "See the 7-week program",
    href: "/money-reset",
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
      "Yearly insurance and beneficiary review",
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
  { value: "5", label: "Residential properties" },
  { value: "300+", label: "Apartment units in a syndication I invested in" },
  { value: "Protected", label: "Life insurance in place for my family" },
] as const;

export const mainNav = [
  { href: "/philosophy", label: "Our Philosophy" },
  { href: "/roadmap", label: "Money Roadmap" },
  { href: "/tools", label: "Free Tools" },
  { href: "/employee-benefits", label: "Employee Benefits" },
  { href: "/federal-employees", label: "Federal Employees" },
  { href: "/pricing", label: "Coaching & Pricing" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About Gory" },
] as const;

export const legalNav = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/disclaimer", label: "Financial Education Disclaimer" },
] as const;
