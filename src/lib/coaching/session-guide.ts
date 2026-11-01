/** The standard 50-minute Money Coach session. Same structure every week. */
export const sessionGuide = [
  { minutes: 5, title: "Check in", detail: "Review last week's commitment and how it went." },
  { minutes: 10, title: "Mindset", detail: "Discuss this week's financial mindset or behavior." },
  { minutes: 20, title: "Real numbers", detail: "Review the client's actual financial situation." },
  { minutes: 10, title: "One action", detail: "Agree on one specific financial action." },
  { minutes: 5, title: "Lock it in", detail: "Confirm the deadline, how it will be measured, and accountability." },
] as const;

export const SESSION_MINUTES = sessionGuide.reduce((sum, s) => sum + s.minutes, 0);
