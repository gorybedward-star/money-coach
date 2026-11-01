-- =============================================================================
-- Row-level security tests: coach vs client permissions and cross-client
-- isolation. Runs inside a transaction and rolls back, so it leaves no data.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.test.sql
--
-- Any failed check raises an exception and stops the script.
-- =============================================================================
begin;

-- Test identities -------------------------------------------------------------
insert into auth.users (id, email, aud, role) values
  ('00000000-0000-0000-0000-00000000c0ac', 'coach@test.local', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000a1', 'alice@test.local', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000b2', 'bob@test.local', 'authenticated', 'authenticated');
insert into public.profiles (id, role, full_name) values
  ('00000000-0000-0000-0000-00000000c0ac', 'coach', 'Test Coach'),
  ('00000000-0000-0000-0000-0000000000a1', 'client', 'Alice'),
  ('00000000-0000-0000-0000-0000000000b2', 'client', 'Bob');
insert into public.clients (id, user_id, first_name, email) values
  ('10000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a1', 'Alice', 'alice@test.local'),
  ('10000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000b2', 'Bob', 'bob@test.local');

create or replace function pg_temp.act_as(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
end $$;
create or replace function pg_temp.check(ok boolean, msg text) returns void language plpgsql as $$
begin
  if not coalesce(ok, false) then raise exception 'FAIL: %', msg; end if;
  raise notice 'ok - %', msg;
end $$;

-- Coach sets up data for both clients ------------------------------------------
select pg_temp.act_as('00000000-0000-0000-0000-00000000c0ac');
select pg_temp.check((select count(*) from public.clients) = 2, 'coach sees all clients');
insert into public.coach_notes (client_id, week_number, body) values
  ('10000000-0000-0000-0000-0000000000a1', 1, 'Private note about Alice'),
  ('10000000-0000-0000-0000-0000000000b2', 1, 'Private note about Bob');
insert into public.commitments (client_id, week_number, objective, action, deadline, success_criteria) values
  ('10000000-0000-0000-0000-0000000000a1', 1, 'Starter savings', 'Open a savings account and move $50', current_date + 7, 'Account open, $50 moved'),
  ('10000000-0000-0000-0000-0000000000b2', 1, 'Starter savings', 'Draft commitment for Bob', current_date + 7, 'Done');
insert into public.sessions (client_id, week_number, scheduled_at) values
  ('10000000-0000-0000-0000-0000000000a1', 1, now() + interval '1 day'),
  ('10000000-0000-0000-0000-0000000000b2', 1, now() + interval '2 days');

-- Session cannot be completed without a full commitment
do $$ begin
  insert into public.clients (id, first_name, email) values ('10000000-0000-0000-0000-0000000000c3', 'Cara', 'cara@test.local');
  begin
    perform public.coach_complete_session('10000000-0000-0000-0000-0000000000c3', 1);
    raise exception 'FAIL: session completed without a commitment';
  exception when check_violation then raise notice 'ok - session requires a One Money Move';
  end;
end $$;

select public.coach_complete_session('10000000-0000-0000-0000-0000000000a1', 1);
select pg_temp.check((select current_week from public.clients where id = '10000000-0000-0000-0000-0000000000a1') = 2,
  'completing the session advances Alice to week 2');
select pg_temp.check((select approved_at is not null from public.commitments where client_id = '10000000-0000-0000-0000-0000000000a1'),
  'completing the session approves the commitment');

-- Alice: sees only her own data ------------------------------------------------
select pg_temp.act_as('00000000-0000-0000-0000-0000000000a1');
select pg_temp.check((select count(*) from public.clients) = 1, 'Alice sees exactly one client row');
select pg_temp.check((select first_name from public.clients) = 'Alice', 'that row is her own');
select pg_temp.check((select count(*) from public.coach_notes) = 0, 'Alice cannot read any coach notes (not even her own)');
select pg_temp.check((select count(*) from public.sessions) = 1, 'Alice sees only her own session');
select pg_temp.check((select count(*) from public.commitments) = 1, 'Alice sees her approved commitment');
select pg_temp.check((select count(*) from public.email_log) = 0, 'Alice cannot read the email log');
select pg_temp.check((select count(*) from public.audit_log) = 0, 'Alice cannot read the audit log');
select pg_temp.check((select count(*) from public.email_templates) = 0, 'Alice cannot read email templates');
select pg_temp.check((select count(*) from public.profiles) = 1, 'Alice sees only her own profile');
select pg_temp.check((select count(*) from public.curriculum_weeks) = 7, 'Alice can read the shared curriculum');

-- Alice cannot write to another client or escalate
update public.clients set first_name = 'Hacked' where id = '10000000-0000-0000-0000-0000000000b2';
update public.clients set current_week = 7 where id = '10000000-0000-0000-0000-0000000000a1';
select pg_temp.act_as('00000000-0000-0000-0000-00000000c0ac');
select pg_temp.check((select first_name from public.clients where id = '10000000-0000-0000-0000-0000000000b2') = 'Bob', 'Alice cannot rename Bob');
select pg_temp.check((select current_week from public.clients where id = '10000000-0000-0000-0000-0000000000a1') = 2, 'Alice cannot change her own week');
select pg_temp.act_as('00000000-0000-0000-0000-0000000000a1');

do $$ begin
  insert into public.coach_notes (client_id, body) values ('10000000-0000-0000-0000-0000000000a1', 'fake');
  raise exception 'FAIL: client wrote a coach note';
exception when insufficient_privilege then raise notice 'ok - client cannot write coach notes';
end $$;

do $$ begin
  update public.profiles set role = 'coach' where id = auth.uid();
  if public.is_coach() then raise exception 'FAIL: client escalated to coach'; end if;
  raise notice 'ok - client cannot make herself coach';
end $$;

do $$ begin
  insert into public.intakes (client_id, primary_goals, consent_privacy, consent_coaching_comms)
  values ('10000000-0000-0000-0000-0000000000b2', 'pretend to be Bob', true, true);
  raise exception 'FAIL: Alice wrote Bob''s intake';
exception when insufficient_privilege then raise notice 'ok - Alice cannot submit Bob''s intake';
end $$;

insert into public.intakes (client_id, primary_goals, emergency_savings, consumer_debt, monthly_income, monthly_expenses, consent_privacy, consent_coaching_comms)
values ('10000000-0000-0000-0000-0000000000a1', 'Build a cushion', 200, 4500, 4200, 3900, true, true);
select pg_temp.check((select count(*) from public.progress_snapshots where source = 'self_reported') = 1, 'intake creates a self-reported starting snapshot');
select pg_temp.check((select monthly_cash_flow from public.progress_snapshots) = 300, 'starting cash flow = income - expenses');

-- Client checklist: own client items only
insert into public.checklist_progress (client_id, item_id)
  select '10000000-0000-0000-0000-0000000000a1', id from public.curriculum_items where week_number = 1 and audience = 'client' and position = 2;
select pg_temp.check((select count(*) from public.checklist_progress) = 1, 'Alice can tick her own client checklist item');
do $$ begin
  insert into public.checklist_progress (client_id, item_id)
    select '10000000-0000-0000-0000-0000000000a1', id from public.curriculum_items where week_number = 1 and audience = 'coach' and position = 1;
  raise exception 'FAIL: client ticked a coach checklist item';
exception when insufficient_privilege then raise notice 'ok - Alice cannot tick coach checklist items';
end $$;
do $$ begin
  insert into public.checklist_progress (client_id, item_id)
    select '10000000-0000-0000-0000-0000000000b2', id from public.curriculum_items where week_number = 1 and audience = 'client' and position = 1;
  raise exception 'FAIL: Alice ticked Bob''s checklist';
exception when insufficient_privilege then raise notice 'ok - Alice cannot tick Bob''s checklist';
end $$;

-- Commitment progress through the RPC only
select public.client_update_commitment((select id from public.commitments), 'completed', 'Moved $50 on Friday');
select pg_temp.check((select status = 'completed' and completed_at is not null from public.commitments), 'Alice can report her commitment completed');
update public.commitments set action = 'changed by client';
select pg_temp.check((select action from public.commitments) = 'Open a savings account and move $50', 'Alice cannot rewrite the commitment itself');

select set_config('test.alice_commitment', (select id::text from public.commitments), true);

-- Bob: cannot see Alice, and cannot see his unapproved draft ---------------------
select pg_temp.act_as('00000000-0000-0000-0000-0000000000b2');
select pg_temp.check((select count(*) from public.clients where first_name = 'Alice') = 0, 'Bob cannot see Alice');
select pg_temp.check((select count(*) from public.intakes) = 0, 'Bob cannot see Alice''s intake');
select pg_temp.check((select count(*) from public.progress_snapshots) = 0, 'Bob cannot see Alice''s progress');
select pg_temp.check((select count(*) from public.checklist_progress) = 0, 'Bob cannot see Alice''s checklist');
select pg_temp.check((select count(*) from public.commitments) = 0, 'Bob does not see an unapproved draft commitment');
do $$ begin
  perform public.client_update_commitment(current_setting('test.alice_commitment')::uuid, 'in_progress', 'x');
  raise exception 'FAIL: Bob updated a commitment';
exception when no_data_found then raise notice 'ok - Bob cannot update Alice''s commitment';
end $$;
do $$ begin
  perform public.coach_complete_session('10000000-0000-0000-0000-0000000000b2', 1);
  raise exception 'FAIL: client completed a session';
exception when insufficient_privilege then raise notice 'ok - clients cannot complete sessions';
end $$;

-- Signed-out visitor sees nothing ------------------------------------------------
reset role;
select set_config('request.jwt.claims', '', true);
set local role anon;
do $$ begin
  perform count(*) from public.clients;
  raise exception 'FAIL: anon read clients';
exception when insufficient_privilege then raise notice 'ok - signed-out visitors cannot read clients';
end $$;
do $$ begin
  perform count(*) from public.curriculum_weeks;
  raise exception 'FAIL: anon read curriculum';
exception when insufficient_privilege then raise notice 'ok - signed-out visitors cannot read curriculum';
end $$;

reset role;
-- Audit trail recorded the coach's work without storing values
select pg_temp.check((select count(*) from public.audit_log where table_name = 'coach_notes') = 2, 'audit log records coach note creation');

select 'ALL RLS TESTS PASSED' as result;
rollback;
