export type UserRole = "therapist" | "client";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  created_at: string;
}

export interface TherapistProfile {
  id: string;
  user_id: string;
  license_type: string | null;
  specializations: string[];
}

export interface ClientProfile {
  id: string;
  user_id: string;
  therapist_id: string;
  name: string;
}

export interface Session {
  id: string;
  client_id: string;
  therapist_id: string;
  session_date: string;
  session_number: number;
  notes: string | null;
  created_at: string;
}

export interface Transcript {
  id: string;
  session_id: string;
  content: string;
  source: "upload" | "paste";
  created_at: string;
}

export interface TreatmentPlan {
  id: string;
  client_id: string;
  therapist_id: string;
  status: "draft" | "active" | "archived";
  current_version_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TherapistGoal {
  description: string;
  type: "short_term" | "long_term";
  interventions: string[];
  status: "active" | "achieved" | "modified";
}

export interface TherapistView {
  presenting_concerns: string[];
  clinical_impressions: string | null;
  goals: TherapistGoal[];
  homework: string[];
  strengths: string[];
  risk_indicators: string[];
}

export interface ClientGoal {
  description: string;
  why_it_matters: string;
  action_steps: string[];
}

export interface ClientHomework {
  task: string;
  encouragement: string;
}

export interface ClientView {
  summary: string;
  goals: ClientGoal[];
  homework: ClientHomework[];
  strengths: string[];
  next_steps: string[];
}

export interface TreatmentPlanVersion {
  id: string;
  plan_id: string;
  version_number: number;
  session_id: string | null;
  therapist_view: TherapistView;
  client_view: ClientView;
  created_at: string;
}

export type SafetyFlagType = "crisis" | "self_harm" | "harm_to_others";
export type SafetySeverity = "low" | "medium" | "high";

export interface SafetyFlag {
  id: string;
  session_id: string;
  plan_version_id: string | null;
  flag_type: SafetyFlagType;
  severity: SafetySeverity;
  excerpt: string;
  created_at: string;
}

export interface SessionSummary {
  id: string;
  session_id: string;
  therapist_summary: string;
  client_summary: string;
  created_at: string;
}

// Extended types with relations
export interface SessionWithTranscript extends Session {
  transcript: Transcript | null;
  safety_flags: SafetyFlag[];
  summary: SessionSummary | null;
}

export interface ClientWithSessions extends ClientProfile {
  sessions: Session[];
  treatment_plan: TreatmentPlan | null;
}

export interface PlanWithVersions extends TreatmentPlan {
  versions: TreatmentPlanVersion[];
  current_version: TreatmentPlanVersion | null;
}
