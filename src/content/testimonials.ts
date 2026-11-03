/**
 * Client testimonials.
 *
 * The Testimonials section stays hidden on every page until at least one quote is added here.
 * Collect quotes with the form at /share-your-story (submissions arrive by email).
 *
 * Before adding a quote:
 * - Only use quotes the client gave written permission to publish (the form asks for it).
 * - Use their words as written. Light trimming is fine; never change the meaning.
 * - Show only the name format they approved (for example "Tanya R.").
 * - Don't publish specific dollar results unless they're typical, or the page says they aren't.
 *
 * Example:
 * { quote: "For the first time, we have a plan we actually follow.", name: "Tanya R.", detail: "7-Week Money Reset client" },
 */
export type Testimonial = {
  quote: string;
  /** Name exactly as the client approved, e.g. first name and last initial. */
  name: string;
  /** Optional short context, e.g. "7-Week Money Reset client" or "Navy spouse". */
  detail?: string;
};

export const testimonials: Testimonial[] = [];
