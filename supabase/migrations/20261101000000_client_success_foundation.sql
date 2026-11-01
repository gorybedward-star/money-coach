-- =============================================================================
-- Money Coach — 7-Week Client Success System
-- Phase 1 (foundation) + Week 1 pilot
--
-- One centralized database. Row-level security (RLS) is enabled on EVERY table.
--   * The coach (profiles.role = 'coach') can read and manage all client records.
--   * A client can only ever read their own records.
--   * coach_notes, email_log, email_templates, audit_log and client_invites have
--     no client policy at all, so they can never reach the client portal.
--
-- Run once in the Supabase SQL Editor (or `supabase db push`).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('coach', 'client');
create type public.client_status as enum ('invited', 'active', 'paused', 'graduated', 'withdrawn');
create type public.session_status as enum ('scheduled', 'completed', 'canceled');
create type public.commitment_status as enum ('not_started', 'in_progress', 'completed', 'needs_review');
create type public.email_status as enum ('pending', 'sent', 'failed', 'skipped');
create type public.data_source as enum ('self_reported', 'verified');
create type public.checklist_audience as enum ('coach', 'client');

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Profiles: one row per login, holds the role. No one can change roles through
-- the API (no insert/update policies). The coach row is created once in SQL.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null,
  full_name text,
  created_at timestamptz not null default now()
);

create or replace function public.is_coach()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'coach');
$$;

-- ---------------------------------------------------------------------------
-- Clients
-- ---------------------------------------------------------------------------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  first_name text not null check (char_length(first_name) between 1 and 80),
  last_name text not null default '' check (char_length(last_name) <= 80),
  email text not null unique check (email = lower(email) and email like '%_@_%'),
  phone text check (char_length(phone) <= 40),
  status public.client_status not null default 'invited',
  -- The coaching week the client is on. 8 = all seven weeks completed.
  current_week int not null default 1 check (current_week between 1 and 8),
  preferred_contact text not null default 'email' check (preferred_contact in ('email', 'phone', 'text')),
  email_opt_in boolean not null default true,
  automation_paused boolean not null default false,
  enrolled_at timestamptz not null default now(),
  onboarded_at timestamptz,
  created_by uuid references auth.users (id),
  updated_at timestamptz not null default now()
);
create trigger clients_touch before update on public.clients
  for each row execute function public.touch_updated_at();

create or replace function public.my_client_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select id from public.clients where user_id = auth.uid();
$$;

-- One-time onboarding links. Only a SHA-256 hash of the token is stored.
create table public.client_invites (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.client_invites (client_id);

-- ---------------------------------------------------------------------------
-- Shared curriculum (one copy for every client)
-- ---------------------------------------------------------------------------
create table public.curriculum_weeks (
  week_number int primary key check (week_number between 1 and 7),
  title text not null,
  -- Journey theme shown on the tracker (Awareness, Clarity, ...).
  theme text not null default '',
  psychology_principle text not null,
  coaching_question text not null default '',
  lesson text not null default '',
  baby_step text not null,
  baby_step_note text not null default '',
  objective text not null default '',
  prep_assignment text not null default '',
  deliverable text not null default '',
  success_measure text not null default '',
  -- Weeks are published one phase at a time.
  published boolean not null default false
);

create table public.curriculum_items (
  id uuid primary key default gen_random_uuid(),
  week_number int not null references public.curriculum_weeks (week_number) on delete cascade,
  audience public.checklist_audience not null,
  position int not null,
  label text not null,
  unique (week_number, audience, position)
);

-- ---------------------------------------------------------------------------
-- Intake (only what coaching needs: no SSNs, account numbers or passwords)
-- ---------------------------------------------------------------------------
create table public.intakes (
  client_id uuid primary key references public.clients (id) on delete cascade,
  phone text check (char_length(phone) <= 40),
  best_time text check (char_length(best_time) <= 200),
  preferred_contact text not null default 'email' check (preferred_contact in ('email', 'phone', 'text')),
  primary_goals text not null check (char_length(primary_goals) between 1 and 2000),
  concerns text check (char_length(concerns) <= 2000),
  money_story text check (char_length(money_story) <= 2000),
  habit_to_change text check (char_length(habit_to_change) <= 1000),
  monthly_income numeric(12, 2) check (monthly_income between 0 and 10000000),
  monthly_expenses numeric(12, 2) check (monthly_expenses between 0 and 10000000),
  emergency_savings numeric(12, 2) check (emergency_savings between 0 and 100000000),
  consumer_debt numeric(12, 2) check (consumer_debt between 0 and 100000000),
  debt_notes text check (char_length(debt_notes) <= 2000),
  retirement_overview text check (char_length(retirement_overview) <= 2000),
  retirement_contribution_pct numeric(5, 2) check (retirement_contribution_pct between 0 and 100),
  employee_benefits text check (char_length(employee_benefits) <= 2000),
  insurance_coverage text check (char_length(insurance_coverage) <= 2000),
  consent_privacy boolean not null check (consent_privacy),
  consent_coaching_comms boolean not null check (consent_coaching_comms),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger intakes_touch before update on public.intakes
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Coaching sessions (one per client per week; rescheduling updates scheduled_at)
-- ---------------------------------------------------------------------------
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  week_number int not null check (week_number between 1 and 7),
  scheduled_at timestamptz,
  duration_minutes int not null default 50 check (duration_minutes between 15 and 180),
  meeting_details text check (char_length(meeting_details) <= 500),
  status public.session_status not null default 'scheduled',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, week_number)
);
create trigger sessions_touch before update on public.sessions
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Checklist completion (per client, per curriculum item)
-- ---------------------------------------------------------------------------
create table public.checklist_progress (
  client_id uuid not null references public.clients (id) on delete cascade,
  item_id uuid not null references public.curriculum_items (id) on delete cascade,
  completed_at timestamptz not null default now(),
  completed_by uuid references auth.users (id) default auth.uid(),
  primary key (client_id, item_id)
);

-- ---------------------------------------------------------------------------
-- My One Money Move (one commitment per client per week)
-- ---------------------------------------------------------------------------
create table public.commitments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  week_number int not null check (week_number between 1 and 7),
  objective text not null default '' check (char_length(objective) <= 500),
  action text not null default '' check (char_length(action) <= 500),
  deadline date,
  success_criteria text not null default '' check (char_length(success_criteria) <= 500),
  -- Short, non-confidential recap that goes into the post-session email.
  session_summary text check (char_length(session_summary) <= 1000),
  status public.commitment_status not null default 'not_started',
  client_update text check (char_length(client_update) <= 1000),
  coach_feedback text check (char_length(coach_feedback) <= 1000),
  approved_at timestamptz,
  approved_by uuid references auth.users (id),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, week_number)
);
create trigger commitments_touch before update on public.commitments
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Financial progress. Every value is labeled self-reported or coach-verified.
-- ---------------------------------------------------------------------------
create table public.progress_snapshots (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  recorded_at timestamptz not null default now(),
  emergency_savings numeric(12, 2) check (emergency_savings >= 0),
  consumer_debt numeric(12, 2) check (consumer_debt >= 0),
  monthly_cash_flow numeric(12, 2),
  retirement_contribution_pct numeric(5, 2) check (retirement_contribution_pct between 0 and 100),
  employer_benefits_reviewed boolean,
  source public.data_source not null,
  note text check (char_length(note) <= 1000),
  recorded_by uuid references auth.users (id) default auth.uid()
);
create index on public.progress_snapshots (client_id, recorded_at);

-- ---------------------------------------------------------------------------
-- Coach-only private notes. No client policy exists for this table.
-- ---------------------------------------------------------------------------
create table public.coach_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  week_number int check (week_number between 1 and 7),
  body text not null check (char_length(body) between 1 and 10000),
  created_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now()
);
create index on public.coach_notes (client_id, created_at);

-- ---------------------------------------------------------------------------
-- Email templates (editable by the coach) and the delivery log
-- ---------------------------------------------------------------------------
create table public.email_templates (
  key text primary key,
  name text not null,
  subject text not null check (char_length(subject) between 1 and 200),
  body text not null check (char_length(body) between 1 and 10000),
  updated_at timestamptz not null default now()
);
create trigger email_templates_touch before update on public.email_templates
  for each row execute function public.touch_updated_at();

create table public.email_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients (id) on delete cascade,
  template_key text not null,
  -- Unique key per logical email (e.g. "reminder:<commitment id>") prevents duplicates.
  dedupe_key text not null unique,
  to_email text not null,
  status public.email_status not null default 'pending',
  provider_message_id text,
  detail text,
  attempts int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.email_log (client_id, created_at);
create trigger email_log_touch before update on public.email_log
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Audit log: who changed which record, never the financial values themselves.
-- ---------------------------------------------------------------------------
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  table_name text not null,
  record_id text,
  client_id uuid,
  created_at timestamptz not null default now()
);
create index on public.audit_log (client_id, created_at);

create or replace function public.write_audit()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
begin
  insert into public.audit_log (actor, action, table_name, record_id, client_id)
  values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    coalesce(rec ->> 'id', rec ->> 'client_id'),
    case when tg_table_name = 'clients' then (rec ->> 'id')::uuid else (rec ->> 'client_id')::uuid end
  );
  return coalesce(new, old);
end $$;

create trigger audit_clients after insert or update or delete on public.clients
  for each row execute function public.write_audit();
create trigger audit_intakes after insert or update or delete on public.intakes
  for each row execute function public.write_audit();
create trigger audit_sessions after insert or update or delete on public.sessions
  for each row execute function public.write_audit();
create trigger audit_commitments after insert or update or delete on public.commitments
  for each row execute function public.write_audit();
create trigger audit_coach_notes after insert or update or delete on public.coach_notes
  for each row execute function public.write_audit();
create trigger audit_progress after insert or update or delete on public.progress_snapshots
  for each row execute function public.write_audit();

-- ---------------------------------------------------------------------------
-- When a client submits the intake: activate them and record the starting
-- (self-reported) financial snapshot. Runs once, on first submission.
-- ---------------------------------------------------------------------------
create or replace function public.on_intake_submitted()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.clients
     set status = case when status = 'invited' then 'active'::public.client_status else status end,
         onboarded_at = coalesce(onboarded_at, now()),
         preferred_contact = new.preferred_contact,
         phone = coalesce(nullif(new.phone, ''), phone)
   where id = new.client_id;

  insert into public.progress_snapshots
    (client_id, emergency_savings, consumer_debt, monthly_cash_flow, retirement_contribution_pct, source, note, recorded_by)
  values
    (new.client_id, new.emergency_savings, new.consumer_debt,
     case when new.monthly_income is not null and new.monthly_expenses is not null
          then new.monthly_income - new.monthly_expenses end,
     new.retirement_contribution_pct, 'self_reported', 'Starting point from intake', auth.uid());
  return new;
end $$;
create trigger intake_submitted after insert on public.intakes
  for each row execute function public.on_intake_submitted();

-- ---------------------------------------------------------------------------
-- Client-side commitment update. Clients cannot edit the commitment itself,
-- only report progress (In Progress / Completed) and a short note.
-- ---------------------------------------------------------------------------
create or replace function public.client_update_commitment(p_commitment_id uuid, p_status public.commitment_status, p_note text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  cid uuid := public.my_client_id();
begin
  if cid is null then raise exception 'Not a client' using errcode = '42501'; end if;
  if p_status not in ('in_progress', 'completed') then raise exception 'Invalid status' using errcode = '22023'; end if;
  update public.commitments
     set status = p_status,
         client_update = left(nullif(trim(p_note), ''), 1000),
         completed_at = case when p_status = 'completed' then coalesce(completed_at, now()) else null end
   where id = p_commitment_id and client_id = cid and approved_at is not null;
  if not found then raise exception 'Commitment not found' using errcode = 'P0002'; end if;
end $$;

-- ---------------------------------------------------------------------------
-- Coach completes a session. A session cannot be completed without an agreed
-- One Money Move (action, deadline and success criteria). Completing it:
-- approves the commitment, marks the session completed, and advances the client
-- to the next week. Week advancement depends on completed sessions only, never
-- on financial milestones or calendar dates.
-- ---------------------------------------------------------------------------
create or replace function public.coach_complete_session(p_client_id uuid, p_week int)
returns void language plpgsql security definer set search_path = '' as $$
declare
  c public.commitments;
begin
  if not public.is_coach() then raise exception 'Coach only' using errcode = '42501'; end if;

  select * into c from public.commitments where client_id = p_client_id and week_number = p_week;
  if c.id is null or trim(c.action) = '' or c.deadline is null or trim(c.success_criteria) = '' then
    raise exception 'Record the One Money Move (action, deadline and success criteria) before completing the session'
      using errcode = '23514';
  end if;

  update public.commitments
     set approved_at = coalesce(approved_at, now()), approved_by = coalesce(approved_by, auth.uid())
   where id = c.id;

  insert into public.sessions (client_id, week_number, status, completed_at)
  values (p_client_id, p_week, 'completed', now())
  on conflict (client_id, week_number)
  do update set status = 'completed', completed_at = coalesce(public.sessions.completed_at, now());

  update public.clients
     set current_week = greatest(current_week, least(p_week + 1, 8)),
         status = case when p_week = 7 then 'graduated'::public.client_status else status end
   where id = p_client_id;
end $$;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_invites enable row level security;
alter table public.curriculum_weeks enable row level security;
alter table public.curriculum_items enable row level security;
alter table public.intakes enable row level security;
alter table public.sessions enable row level security;
alter table public.checklist_progress enable row level security;
alter table public.commitments enable row level security;
alter table public.progress_snapshots enable row level security;
alter table public.coach_notes enable row level security;
alter table public.email_templates enable row level security;
alter table public.email_log enable row level security;
alter table public.audit_log enable row level security;

-- profiles: read your own; coach reads all. No writes through the API.
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_coach());

-- clients
create policy clients_coach on public.clients for all to authenticated
  using (public.is_coach()) with check (public.is_coach());
create policy clients_self_read on public.clients for select to authenticated
  using (user_id = auth.uid());

-- client_invites: no policies (server-only via the service role).

-- curriculum: readable by any signed-in user (week titles drive the progress
-- tracker; unpublished weeks carry no lesson content yet).
create policy weeks_read on public.curriculum_weeks for select to authenticated
  using (true);
create policy weeks_coach on public.curriculum_weeks for all to authenticated
  using (public.is_coach()) with check (public.is_coach());
create policy items_read on public.curriculum_items for select to authenticated
  using (true);
create policy items_coach on public.curriculum_items for all to authenticated
  using (public.is_coach()) with check (public.is_coach());

-- intakes
create policy intakes_coach on public.intakes for all to authenticated
  using (public.is_coach()) with check (public.is_coach());
create policy intakes_self_read on public.intakes for select to authenticated
  using (client_id = public.my_client_id());
create policy intakes_self_insert on public.intakes for insert to authenticated
  with check (client_id = public.my_client_id());
create policy intakes_self_update on public.intakes for update to authenticated
  using (client_id = public.my_client_id()) with check (client_id = public.my_client_id());

-- sessions
create policy sessions_coach on public.sessions for all to authenticated
  using (public.is_coach()) with check (public.is_coach());
create policy sessions_self_read on public.sessions for select to authenticated
  using (client_id = public.my_client_id());

-- checklist progress: clients tick only their own CLIENT checklist items.
create policy checklist_coach on public.checklist_progress for all to authenticated
  using (public.is_coach()) with check (public.is_coach());
create policy checklist_self_read on public.checklist_progress for select to authenticated
  using (client_id = public.my_client_id());
create policy checklist_self_insert on public.checklist_progress for insert to authenticated
  with check (
    client_id = public.my_client_id()
    and exists (select 1 from public.curriculum_items i where i.id = item_id and i.audience = 'client')
  );
create policy checklist_self_delete on public.checklist_progress for delete to authenticated
  using (
    client_id = public.my_client_id()
    and exists (select 1 from public.curriculum_items i where i.id = item_id and i.audience = 'client')
  );

-- commitments: clients see their own only after the coach approves them.
create policy commitments_coach on public.commitments for all to authenticated
  using (public.is_coach()) with check (public.is_coach());
create policy commitments_self_read on public.commitments for select to authenticated
  using (client_id = public.my_client_id() and approved_at is not null);

-- progress snapshots
create policy progress_coach on public.progress_snapshots for all to authenticated
  using (public.is_coach()) with check (public.is_coach());
create policy progress_self_read on public.progress_snapshots for select to authenticated
  using (client_id = public.my_client_id());

-- coach-only tables
create policy coach_notes_coach on public.coach_notes for all to authenticated
  using (public.is_coach()) with check (public.is_coach());
create policy templates_coach on public.email_templates for all to authenticated
  using (public.is_coach()) with check (public.is_coach());
create policy email_log_coach_read on public.email_log for select to authenticated
  using (public.is_coach());
create policy audit_coach_read on public.audit_log for select to authenticated
  using (public.is_coach());

-- Signed-out visitors get nothing.
revoke all on all tables in schema public from anon;
revoke execute on all functions in schema public from anon, public;
grant execute on function public.is_coach() to authenticated;
grant execute on function public.my_client_id() to authenticated;
grant execute on function public.client_update_commitment(uuid, public.commitment_status, text) to authenticated;
grant execute on function public.coach_complete_session(uuid, int) to authenticated;
-- Clients may only change their own row through the policies above; nobody
-- may rewrite the audit log, even the coach.
revoke insert, update, delete on public.audit_log from authenticated;
revoke insert, update, delete on public.email_log from authenticated;
revoke all on public.client_invites from authenticated;

-- =============================================================================
-- Seed: curriculum (Week 1 full content; Weeks 2–7 titles only until Phase 3)
-- Original Money Coach wording. Money Coach is independent and is not
-- affiliated with or endorsed by Morgan Housel, Dave Ramsey or Ramsey Solutions.
-- =============================================================================
insert into public.curriculum_weeks
  (week_number, title, theme, psychology_principle, coaching_question, lesson, baby_step, baby_step_note, objective, prep_assignment, deliverable, success_measure, published)
values
  (1, 'Understand Your Money Story', 'Awareness',
   'Your personal experiences influence how you handle money.',
   'What is one thing you do with money that you know isn''t helping your future?',
   E'Everyone carries a money story. It comes from the home you grew up in, the first paycheck you earned, the times money felt tight, and the people you watched handle it. None of that makes you good or bad with money. It simply explains why some choices feel automatic.\n\nThis week is about noticing your story without judging it. When you can name the moments that trigger spending, or the beliefs that make saving feel hard, you get to choose a different response.\n\nWe will also start a small cushion of savings. A starter emergency fund turns a surprise expense into an inconvenience instead of a new debt. The amount matters less than the habit of protecting it.',
   'Baby Step 1: Save a $1,000 starter emergency fund.',
   'Use this as a guide, not a test. If $1,000 is not realistic yet, we will set a first target that is, and build from there.',
   'Identify one spending habit to change and set an achievable first savings target.',
   'Complete your confidential intake questionnaire and notice one spending habit you would like to change.',
   'Money Commitment + Starter Savings Plan',
   'Intake completed and first savings action documented.',
   true),
  (2, 'Take Control of Your Money', 'Clarity',
   'Building wealth depends on the gap between what you earn and what you spend.',
   'If we could free up $200 a month without changing your income, where would it come from?',
   '', 'Prepare for Baby Step 2: Pay off all non-mortgage debt using the debt snowball.', '',
   'Create a monthly spending plan and list every debt from smallest balance to largest.', '',
   'Monthly Money Plan + Debt Inventory', 'Cash-flow position calculated and one expense improvement selected.', false),
  (3, 'Break the Debt Cycle', 'Control',
   'True financial progress requires controlling lifestyle inflation and debt.',
   'What would your life look like without credit-card payments?',
   '', 'Baby Step 2: Pay off all non-mortgage debt.', '',
   'Select the first debt to attack and establish a realistic extra-payment amount.', '',
   'Personal Debt Freedom Roadmap', 'Priority debt identified and repayment action scheduled or completed.', false),
  (4, 'Create Financial Security', 'Resilience',
   'Having a margin of safety protects you from uncertainty.',
   'If you couldn''t work for six months, or weren''t here tomorrow, would your family be protected?',
   '', 'Baby Step 3: Save 3–6 months of expenses in a fully funded emergency fund.', 'Protection is part of financial security: review life, disability and health coverage and beneficiaries. Education only; refer to a licensed insurance professional before buying.',
   'Calculate the emergency fund target, establish an automatic savings plan, and review insurance coverage and beneficiaries.', '',
   'Financial Security & Protection Blueprint', 'Emergency savings target and contribution schedule documented; life, disability and health coverage and beneficiaries reviewed.', false),
  (5, 'Start Building Wealth', 'Growth',
   'Compounding is powerful when you give it time.',
   'What could consistently investing a manageable amount every payday mean for your future?',
   '', 'Baby Step 4: Invest 15% of household gross income for retirement.', '',
   'Review retirement accounts and establish a contribution target consistent with financial readiness.', '',
   'Retirement & Investing Plan', 'Current contribution rate calculated and next action identified.', false),
  (6, 'Maximize Your Financial Opportunities', 'Optimization',
   'Long-term wealth comes from consistent, intentional decisions.',
   'Are you leaving valuable employer benefits unused?',
   '', 'Baby Step 5: Save for children''s college. Baby Step 6: Pay off your home early.', '',
   'Choose the most relevant goal: education savings, mortgage planning, or maximizing employer benefits.', '',
   'Benefits & Long-Term Goals Review', 'One valuable opportunity verified and an action completed or scheduled.', false),
  (7, 'Build Your Financial Freedom Plan', 'Independence',
   'The greatest benefit of money is freedom and control over your time.',
   'What would financial freedom allow you to do that you cannot comfortably do today?',
   '', 'Baby Step 7: Build wealth and give generously.', '',
   'Commit to one 90-day priority and build a 12-month financial roadmap.', '',
   'Personal Financial Freedom Roadmap', 'Completed 90-day priority and 12-month action plan.', false);

insert into public.curriculum_items (week_number, audience, position, label) values
  (1, 'coach', 1, 'Complete the initial financial intake.'),
  (1, 'coach', 2, 'Review the client''s financial goals and concerns.'),
  (1, 'coach', 3, 'Discuss money upbringing, beliefs, and spending triggers.'),
  (1, 'coach', 4, 'Identify one financial behavior to improve.'),
  (1, 'coach', 5, 'Review existing emergency savings.'),
  (1, 'coach', 6, 'Establish a realistic starter savings target.'),
  (1, 'coach', 7, 'Record the client''s One Money Move.'),
  (1, 'client', 1, 'Complete the financial intake questionnaire.'),
  (1, 'client', 2, 'Identify one spending habit to change.'),
  (1, 'client', 3, 'Review current savings.'),
  (1, 'client', 4, 'Choose a dedicated emergency savings account.'),
  (1, 'client', 5, 'Make or schedule an affordable initial savings contribution.');

-- Email templates. Placeholders: {{first_name}}, {{link}}, {{portal_link}},
-- {{week_number}}, {{week_title}}, {{objective}}, {{action}}, {{deadline}}, {{success_criteria}},
-- {{session_summary}}, {{appointment}}, {{coach_name}}.
insert into public.email_templates (key, name, subject, body) values
  ('welcome', 'Welcome email',
   'Welcome to Money Coach — Your 7-Week Money Reset',
   E'Hi {{first_name}},\n\nWelcome to Money Coach!\n\nI''m excited to work with you over the next seven weeks.\n\nI believe building wealth starts with something simple: making better financial decisions consistently over time.\n\nOur coaching approach draws inspiration from two powerful financial philosophies:\n\nThe Psychology of Money — understanding how our experiences, habits, and emotions influence financial decisions.\n\nThe Seven Baby Steps — using practical, structured actions to reduce debt, build financial security, and work toward financial independence.\n\nBut here''s what makes our program different:\n\nWe''re going to focus on one thing at a time.\n\nEach week, we''ll work together on one financial objective, identify one action you can take, and measure your progress.\n\nOver seven weeks, we''ll cover your money story, cash flow, debt, financial security, investing, financial opportunities, and long-term freedom goals.\n\nYou don''t need to have everything figured out before we start.\n\nYou simply need to be willing to learn, participate, and take action.\n\nYour first step: Complete your confidential Money Coach intake questionnaire before our first session.\n\n[button:Start my secure intake]({{link}})\n\nThis personal link works once and expires in 14 days.\n\nI look forward to helping you build a stronger financial future.\n\n{{coach_name}}\nMoney Coach\nOne Week. One Objective. One Money Move.'),
  ('post_session', 'Post-session commitment',
   'Your One Money Move for Week {{week_number}}',
   E'Hi {{first_name}},\n\nThank you for today''s session on Week {{week_number}}: {{week_title}}.\n\n{{session_summary}}\n\nHere is your weekly commitment card:\n\nMY ONE MONEY MOVE\nThis week''s priority: {{objective}}\nMy commitment: {{action}}\nDeadline: {{deadline}}\nHow we''ll measure success: {{success_criteria}}\n\nOne action. One deadline. One measurable result.\n\nYou can see your checklist and update your progress anytime in your secure portal.\n\n[button:Open my Money Coach portal]({{portal_link}})\n\n{{coach_name}}\nMoney Coach\nOne Week. One Objective. One Money Move.'),
  ('reminder', 'Accountability reminder',
   'A quick check-in on your One Money Move',
   E'Hi {{first_name}},\n\nJust a friendly reminder about the One Money Move you committed to:\n\n{{action}}\nDeadline: {{deadline}}\n\n{{appointment}}\n\nHow is it going? Whether you''ve finished, made a start, or hit a snag, take a moment to update your progress. Every step counts, and we''ll talk it through together.\n\n[button:Update my progress]({{portal_link}})\n\n{{coach_name}}\nMoney Coach');
