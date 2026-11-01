# Money Coach — 7-Week Client Success System

**Status:** Phase 1 (foundation) and the Week 1 pilot are built and tested. Weeks 2–7 are waiting for founder approval.

One Week. One Objective. One Money Move. Measurable Progress.

## What's in this release

| Area | Where |
|---|---|
| Coach login, client login, password reset | `/login`, `/forgot-password`, `/reset-password` |
| Coach dashboard ("Who needs my attention", client list) | `/coach` |
| Enroll a client (creates login, assigns Week 1, sends welcome email) | `/coach/clients/new` |
| Client profile (intake, 7-week plan, progress, settings, email history) | `/coach/clients/[id]` |
| Weekly coaching workspace (objective, principle, Baby Step, 50-minute guide, checklists, private notes, One Money Move) | `/coach/clients/[id]/week/[n]` |
| Editable email templates with live preview | `/coach/templates` |
| Secure onboarding link (works once, expires in 14 days) | `/onboard/[token]` |
| Client portal: My Money Coach Journey | `/portal` |
| Confidential intake with privacy notice and consent | `/portal/intake` |
| Daily accountability reminders | `/api/cron/reminders` (scheduled in `vercel.json`, 14:00 UTC) |
| Database, security rules, Week 1 content, email templates | `supabase/migrations/` |
| Security tests | `supabase/tests/rls.test.sql` |

The public website is unchanged except for a **Client login** link in the footer.

## The coaching framework

Every call follows five standards: one clear objective, one financial principle, one practical action, one measurable result, and one deliverable. Each week also has a coaching question, and every call ends with: "What's the one money move you will make this week that your future self will thank you for?" The answer becomes the commitment card (This week's priority, My commitment, How we'll measure success, deadline). Public description: `/money-reset` (copy in `src/content/money-reset.ts`).

## How security works

1. **Login:** Supabase Auth, email and password. Public sign-up is turned off; only the coach creates client accounts.
2. **Server checks:** every `/coach` page and action calls `requireCoach()`; every `/portal` page calls `requireClient()`.
3. **Database rules:** row-level security is on for every table. A client can read only their own rows. `coach_notes`, `email_log`, `email_templates`, `audit_log` and `client_invites` have no client rule, so they can never reach the portal. Clients change their commitment only through `client_update_commitment()`, which allows a status (In Progress / Completed) and a short note.
4. **Secrets:** `SUPABASE_SERVICE_ROLE_KEY` is used only on the server, for enrollment, onboarding links and the email log.
5. **Onboarding links:** only a SHA-256 hash of the token is stored. Each link works once.
6. **Audit log:** a database trigger records who created, changed or deleted clients, intakes, sessions, commitments, notes and progress. It stores no financial values.
7. **Email:** no intake figures or coach notes are ever placed in an email. The session summary is written by the coach and labeled "no confidential details".

## Business rules built in

- Weeks advance **only** when the coach completes a session. A session can't be completed without a One Money Move (action, deadline, success criteria).
- Pressing **Approve and complete session** approves the commitment, completes the session, advances the week, and sends the post-session email. The client sees the commitment only after approval.
- Session completion and financial milestones are separate. Nothing marks a Baby Step as achieved.
- Every progress figure is labeled **Self-reported** or **Verified by coach**. The intake creates the self-reported starting point.
- Emails are never sent twice (unique key per email plus Resend's idempotency key). Failed or skipped emails can be retried.
- Coaching emails respect **Pause coaching emails** and the client's email opt-in; skips are logged with the reason. The welcome email always sends because it carries the login link.
- Reminders are calculated each day from the *current* deadline and appointment, so rescheduling a session moves the reminder automatically.

## Going live: one-time setup

### 1. Supabase (database and logins)

1. Create a project at supabase.com named `money-coach` (US East). Save the database password.
2. **Authentication → Sign In / Providers → Email:** turn **off** "Allow new users to sign up".
3. **Authentication → URL Configuration:** Site URL = your live address; add `https://YOUR-DOMAIN/**` to Redirect URLs.
4. **SQL Editor:** paste and run `supabase/migrations/20261101000000_client_success_foundation.sql`.
5. **Authentication → Users → Add user:** your email, a strong password, tick "Auto confirm user".
6. **SQL Editor:** make that account the coach (use your email):
   ```sql
   insert into public.profiles (id, role, full_name)
   select id, 'coach', 'Gory H. Bedward' from auth.users where email = 'YOUR-EMAIL';
   ```
7. **Project Settings → API Keys:** copy the Project URL, the anon key, and the service_role key.
8. Recommended: **Authentication → Emails → SMTP Settings**, add Resend's SMTP details so password-reset emails come from your domain (Supabase's built-in sender is limited to a few emails an hour).
9. Before real client data: upgrade to **Pro** (daily backups kept 7 days).

### 2. Resend (email)

1. Sign up at resend.com. **Domains → Add Domain**, add the DNS records at your registrar, wait for "Verified".
2. **API Keys → Create API Key** (Sending access).

### 3. Vercel environment variables

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (**secret**) |
| `RESEND_API_KEY` | Resend API key (**secret**) |
| `EMAIL_FROM` | e.g. `Gory H. Bedward <coach@yourdomain.com>` |
| `CRON_SECRET` | any long random string (**secret**) |
| `NEXT_PUBLIC_SITE_URL` | your live address, e.g. `https://yourdomain.com` |
| `COACH_TIMEZONE` | optional, default `America/New_York` |

Redeploy after adding them. Until the Supabase variables exist, `/login`, `/coach` and `/portal` show a friendly "almost ready" page and the public site works exactly as before.

## How to test the complete Week 1 experience

Use two browsers (or one normal window and one private window): one for you as coach, one as the client. Use a real email inbox you can open for the client, such as a second personal address.

1. **Enroll client.** Sign in at `/login` as the coach. Click **Enroll client**. Enter a first name, your test email, and a first session time. Click **Enroll and send welcome email**. You should see "Welcome email sent". (If email isn't set up yet, you'll see a link to copy instead.)
2. **Welcome email.** Open the test inbox. Subject: "Welcome to Money Coach — Your 7-Week Money Reset", greeting with the first name, and a **Start my secure intake** button.
3. **Intake.** In the private window, click the button. Create a password. You land on the intake. Fill it in (rough numbers), tick both consent boxes, submit. You land on My Money Coach Journey with Week 1.
4. **Week 1 checklist.** In the portal, tick "Identify one spending habit to change". Refresh: it stays ticked. As coach, open the client and the **Week 1 workspace**: the same ticks show under the client's checklist.
5. **Coaching session.** In the workspace, follow the 50-minute guide, tick coach checklist items, and add a private note. Confirm the note never appears in the client's portal.
6. **One Money Move.** Fill in the action, deadline (2 days out), success criteria, and an optional summary. Click **Save draft**: the client still sees nothing. Click **Approve and complete session**: you'll see "Post-session email sent", the client receives "Your One Money Move for Week 1", and the portal shows the commitment. The client is now on Week 2 (with a note that the lesson is coming).
7. **Accountability reminder.** On the client's profile, click **Send accountability reminder now**; the client receives "A quick check-in on your One Money Move". The automatic version runs daily and sends one reminder per commitment, 2 days before the deadline or within 48 hours of the next session (never within 12 hours of approval). As the client, update progress to In Progress or Completed and add a note; the coach sees it in the workspace and can add feedback.

Also worth trying: tick **Pause coaching emails** and send a reminder (it's skipped and logged), then untick it and send again; and enroll a client with a mistyped email to see the failure logged in **Email history** and flagged on the dashboard.

## Automated tests

```bash
npm test                     # unit tests incl. reminder timing, email rendering, time zones
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.test.sql   # 37 security checks, rolls back
```

The security test signs in as a coach and two clients and proves: clients see only their own records; no client can read coach notes, the email log, templates or the audit log; clients can't edit another client, change their own week, make themselves coach, tick coach checklist items, rewrite a commitment, or complete a session; drafts stay hidden until approved; signed-out visitors can read nothing.

## Data retention (proposed, needs founder approval)

- Active and graduated clients: keep records for 3 years after the last session, then delete.
- On request, delete a client's records within 30 days (deleting the client row removes their intake, sessions, commitments, notes, progress and email history).
- Email log and audit log: keep 3 years.
- Backups: Supabase Pro daily backups, kept 7 days.

## Next phases (not built yet)

3. Weeks 2–7 content, checklists and deliverables.
4. Weekly preparation email, graduation email, reschedule notices.
5. Client progress dashboard, graduation scorecard, 90-day plan, 12-month roadmap.
6. Production test pass and launch.
