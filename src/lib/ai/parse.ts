import type {
  TherapistView,
  ClientView,
  SafetyFlagType,
  SafetySeverity,
} from "@/lib/types";

interface RawPlanResponse {
  therapist_view: TherapistView;
  client_view: ClientView;
}

interface RawSummaryResponse {
  therapist_summary: string;
  client_summary: string;
}

interface RawSafetyFlag {
  flag_type: string;
  severity: string;
  excerpt: string;
}

interface RawSafetyResponse {
  flags: RawSafetyFlag[];
}

export function parsePlanResponse(raw: string): RawPlanResponse {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (!parsed.therapist_view || !parsed.client_view) {
    throw new Error("Invalid plan response: missing therapist_view or client_view");
  }

  // Validate therapist_view required fields
  const tv = parsed.therapist_view;
  if (!Array.isArray(tv.presenting_concerns)) tv.presenting_concerns = [];
  if (!Array.isArray(tv.goals)) tv.goals = [];
  if (!Array.isArray(tv.homework)) tv.homework = [];
  if (!Array.isArray(tv.strengths)) tv.strengths = [];
  if (!Array.isArray(tv.risk_indicators)) tv.risk_indicators = [];
  if (typeof tv.clinical_impressions !== "string") tv.clinical_impressions = null;

  // Validate client_view required fields
  const cv = parsed.client_view;
  if (typeof cv.summary !== "string") cv.summary = "";
  if (!Array.isArray(cv.goals)) cv.goals = [];
  if (!Array.isArray(cv.homework)) cv.homework = [];
  if (!Array.isArray(cv.strengths)) cv.strengths = [];
  if (!Array.isArray(cv.next_steps)) cv.next_steps = [];

  return parsed as RawPlanResponse;
}

export function parseSummaryResponse(raw: string): RawSummaryResponse {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (typeof parsed.therapist_summary !== "string") {
    throw new Error("Invalid summary response: missing therapist_summary");
  }
  if (typeof parsed.client_summary !== "string") {
    throw new Error("Invalid summary response: missing client_summary");
  }

  return parsed as RawSummaryResponse;
}

const VALID_FLAG_TYPES: SafetyFlagType[] = ["crisis", "self_harm", "harm_to_others"];
const VALID_SEVERITIES: SafetySeverity[] = ["low", "medium", "high"];

export function parseSafetyResponse(
  raw: string
): { flag_type: SafetyFlagType; severity: SafetySeverity; excerpt: string }[] {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned) as RawSafetyResponse;

  if (!Array.isArray(parsed.flags)) return [];

  return parsed.flags
    .filter(
      (f) =>
        VALID_FLAG_TYPES.includes(f.flag_type as SafetyFlagType) &&
        VALID_SEVERITIES.includes(f.severity as SafetySeverity) &&
        typeof f.excerpt === "string" &&
        f.excerpt.length > 0
    )
    .map((f) => ({
      flag_type: f.flag_type as SafetyFlagType,
      severity: f.severity as SafetySeverity,
      excerpt: f.excerpt,
    }));
}
