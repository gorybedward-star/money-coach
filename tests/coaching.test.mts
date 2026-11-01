// Client Success System: pure logic. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { isReminderDue } from "../src/lib/coaching/reminder-rules.ts";
import { renderEmail, fillText } from "../src/lib/email/render.ts";
import { localInputToUtc, utcToLocalInput, formatDate, daysBetween } from "../src/lib/coaching/time.ts";

const now = new Date("2026-11-10T15:00:00Z");
const base = { approvedAt: "2026-11-03T20:00:00Z", status: "in_progress" as const, deadline: null, nextSessionAt: null, today: "2026-11-10", now };

test("reminder: due when the deadline is within two days", () => {
  assert.equal(isReminderDue({ ...base, deadline: "2026-11-12" }).due, true);
  assert.equal(isReminderDue({ ...base, deadline: "2026-11-10" }).due, true);
  assert.equal(isReminderDue({ ...base, deadline: "2026-11-13" }).due, false);
  assert.equal(isReminderDue({ ...base, deadline: "2026-11-09" }).due, false, "past deadlines are left to the coach");
});

test("reminder: due when the next session is within 48 hours, and follows a reschedule", () => {
  assert.equal(isReminderDue({ ...base, nextSessionAt: "2026-11-11T18:00:00Z" }).due, true);
  // Session rescheduled a week later: no longer due.
  assert.equal(isReminderDue({ ...base, nextSessionAt: "2026-11-18T18:00:00Z" }).due, false);
  assert.equal(isReminderDue({ ...base, nextSessionAt: "2026-11-09T18:00:00Z" }).due, false);
});

test("reminder: never for unapproved, completed, or just-approved commitments", () => {
  assert.equal(isReminderDue({ ...base, approvedAt: null, deadline: "2026-11-11" }).due, false);
  assert.equal(isReminderDue({ ...base, status: "completed", deadline: "2026-11-11" }).due, false);
  assert.equal(isReminderDue({ ...base, approvedAt: "2026-11-10T10:00:00Z", deadline: "2026-11-11" }).due, false);
});

test("email: placeholders are filled and HTML is escaped", () => {
  const out = renderEmail("Hi {{first_name}}", "Hello {{first_name}},\n\nLine two\n\n[button:Go]({{link}})", {
    first_name: "<Sam>",
    link: "https://example.com/onboard/abc",
  });
  assert.equal(out.subject, "Hi <Sam>");
  assert.match(out.html, /Hello &lt;Sam&gt;,/);
  assert.ok(!out.html.includes("<Sam>"));
  assert.match(out.html, /href="https:\/\/example.com\/onboard\/abc"/);
  assert.match(out.text, /Go: https:\/\/example.com\/onboard\/abc/);
});

test("email: unsafe button links are dropped and unknown placeholders are blank", () => {
  const out = renderEmail("S", "[button:Bad](javascript:alert(1))", {});
  assert.ok(!/href="javascript/i.test(out.html));
  assert.ok(!/href="javascript/i.test(renderEmail("S", "[button:Bad](javascript:void)", {}).html));
  assert.equal(fillText("A {{nope}} B", {}), "A  B");
});

test("time: coach-zone appointment round-trips through UTC across DST", () => {
  assert.equal(localInputToUtc("2026-11-05T18:30", "America/New_York"), "2026-11-05T23:30:00.000Z"); // EST
  assert.equal(localInputToUtc("2026-10-29T18:30", "America/New_York"), "2026-10-29T22:30:00.000Z"); // EDT
  assert.equal(utcToLocalInput("2026-11-05T23:30:00.000Z", "America/New_York"), "2026-11-05T18:30");
  assert.equal(localInputToUtc("not a date"), null);
  assert.equal(formatDate("2026-11-12"), "Thursday, November 12");
  assert.equal(daysBetween("2026-11-10", "2026-11-12"), 2);
});
