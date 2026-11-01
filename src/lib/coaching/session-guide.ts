/** The standard 50-minute Money Coach session. Same structure every week. */
export const sessionGuide = [
  { minutes: 5, title: "Check in", detail: "Check in and celebrate progress on last week's commitment." },
  { minutes: 10, title: "Mindset", detail: "Explore this week's financial behavior and mindset." },
  { minutes: 20, title: "Real numbers", detail: "Work through the client's real numbers and situation." },
  { minutes: 10, title: "One action", detail: "Agree on one specific action." },
  { minutes: 5, title: "Lock it in", detail: "Confirm the commitment, deadline, and accountability." },
] as const;

export const SESSION_MINUTES = sessionGuide.reduce((sum, s) => sum + s.minutes, 0);

/** The question every coaching call ends on. */
export const closingQuestion = "What's the one money move you will make this week that your future self will thank you for?";

/** The client's answer must cover these three things. */
export const closingChecks = [
  "What am I changing?",
  "What exactly will I do before our next call?",
  "How will we know I completed it?",
] as const;
