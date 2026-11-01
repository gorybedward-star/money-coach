export type ClientStatus = "invited" | "active" | "paused" | "graduated" | "withdrawn";
export type CommitmentStatus = "not_started" | "in_progress" | "completed" | "needs_review";

export type Client = {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: ClientStatus;
  current_week: number;
  preferred_contact: "email" | "phone" | "text";
  email_opt_in: boolean;
  automation_paused: boolean;
  enrolled_at: string;
  onboarded_at: string | null;
};

export type CurriculumWeek = {
  week_number: number;
  title: string;
  theme: string;
  psychology_principle: string;
  coaching_question: string;
  lesson: string;
  baby_step: string;
  baby_step_note: string;
  objective: string;
  prep_assignment: string;
  deliverable: string;
  success_measure: string;
  published: boolean;
};

export type CurriculumItem = {
  id: string;
  week_number: number;
  audience: "coach" | "client";
  position: number;
  label: string;
};

export type Session = {
  id: string;
  client_id: string;
  week_number: number;
  scheduled_at: string | null;
  duration_minutes: number;
  meeting_details: string | null;
  status: "scheduled" | "completed" | "canceled";
  completed_at: string | null;
};

export type Commitment = {
  id: string;
  client_id: string;
  week_number: number;
  objective: string;
  action: string;
  deadline: string | null;
  success_criteria: string;
  session_summary: string | null;
  status: CommitmentStatus;
  client_update: string | null;
  coach_feedback: string | null;
  approved_at: string | null;
  completed_at: string | null;
  updated_at: string;
};

export type Intake = {
  client_id: string;
  phone: string | null;
  best_time: string | null;
  preferred_contact: "email" | "phone" | "text";
  primary_goals: string;
  concerns: string | null;
  money_story: string | null;
  habit_to_change: string | null;
  monthly_income: number | null;
  monthly_expenses: number | null;
  emergency_savings: number | null;
  consumer_debt: number | null;
  debt_notes: string | null;
  retirement_overview: string | null;
  retirement_contribution_pct: number | null;
  employee_benefits: string | null;
  insurance_coverage: string | null;
  consent_privacy: boolean;
  consent_coaching_comms: boolean;
  submitted_at: string;
};

export type ProgressSnapshot = {
  id: string;
  client_id: string;
  recorded_at: string;
  emergency_savings: number | null;
  consumer_debt: number | null;
  monthly_cash_flow: number | null;
  retirement_contribution_pct: number | null;
  employer_benefits_reviewed: boolean | null;
  source: "self_reported" | "verified";
  note: string | null;
};

export type EmailLogRow = {
  id: string;
  client_id: string | null;
  template_key: string;
  dedupe_key: string;
  to_email: string;
  status: "pending" | "sent" | "failed" | "skipped";
  detail: string | null;
  attempts: number;
  created_at: string;
  updated_at: string;
};

export const commitmentStatusLabel: Record<CommitmentStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  needs_review: "Needs Review",
};

export const clientStatusLabel: Record<ClientStatus, string> = {
  invited: "Invited",
  active: "Active",
  paused: "Paused",
  graduated: "Graduated",
  withdrawn: "Withdrawn",
};

export const TOTAL_WEEKS = 7;
