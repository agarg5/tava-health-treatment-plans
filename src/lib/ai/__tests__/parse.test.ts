import { describe, it, expect } from "vitest";
import {
  parsePlanResponse,
  parseSummaryResponse,
  parseSafetyResponse,
} from "../parse";

describe("parsePlanResponse", () => {
  it("should parse a valid plan response", () => {
    const raw = JSON.stringify({
      therapist_view: {
        presenting_concerns: ["Work anxiety", "Sleep issues"],
        clinical_impressions: "Client presents with GAD symptoms",
        goals: [
          {
            description: "Reduce anxiety symptoms",
            type: "short_term",
            interventions: ["CBT", "Breathing exercises"],
            status: "active",
          },
        ],
        homework: ["Thought journal"],
        strengths: ["Self-awareness", "Motivation"],
        risk_indicators: [],
      },
      client_view: {
        summary: "We talked about managing your anxiety.",
        goals: [
          {
            description: "Feel calmer at work",
            why_it_matters: "So you can enjoy your job again",
            action_steps: ["Practice breathing exercises"],
          },
        ],
        homework: [
          {
            task: "Write in your thought journal daily",
            encouragement: "Even a few sentences count!",
          },
        ],
        strengths: ["You're very self-aware"],
        next_steps: ["Continue sessions weekly"],
      },
    });

    const result = parsePlanResponse(raw);
    expect(result.therapist_view.presenting_concerns).toHaveLength(2);
    expect(result.therapist_view.goals[0].type).toBe("short_term");
    expect(result.client_view.summary).toContain("anxiety");
    expect(result.client_view.goals[0].action_steps).toHaveLength(1);
  });

  it("should handle JSON wrapped in markdown code blocks", () => {
    const raw = '```json\n{"therapist_view":{"presenting_concerns":[],"clinical_impressions":null,"goals":[],"homework":[],"strengths":[],"risk_indicators":[]},"client_view":{"summary":"test","goals":[],"homework":[],"strengths":[],"next_steps":[]}}\n```';

    const result = parsePlanResponse(raw);
    expect(result.therapist_view.presenting_concerns).toEqual([]);
    expect(result.client_view.summary).toBe("test");
  });

  it("should fill missing array fields with empty arrays", () => {
    const raw = JSON.stringify({
      therapist_view: { presenting_concerns: ["test"] },
      client_view: { summary: "test" },
    });

    const result = parsePlanResponse(raw);
    expect(result.therapist_view.goals).toEqual([]);
    expect(result.therapist_view.homework).toEqual([]);
    expect(result.therapist_view.strengths).toEqual([]);
    expect(result.therapist_view.risk_indicators).toEqual([]);
    expect(result.client_view.goals).toEqual([]);
    expect(result.client_view.homework).toEqual([]);
    expect(result.client_view.strengths).toEqual([]);
    expect(result.client_view.next_steps).toEqual([]);
  });

  it("should throw on missing top-level keys", () => {
    expect(() => parsePlanResponse('{"therapist_view":{}}')).toThrow(
      "missing therapist_view or client_view"
    );
    expect(() => parsePlanResponse('{"client_view":{}}')).toThrow(
      "missing therapist_view or client_view"
    );
  });

  it("should throw on invalid JSON", () => {
    expect(() => parsePlanResponse("not json")).toThrow();
  });
});

describe("parseSummaryResponse", () => {
  it("should parse a valid summary", () => {
    const raw = JSON.stringify({
      therapist_summary: "Clinical summary here",
      client_summary: "Friendly summary here",
    });

    const result = parseSummaryResponse(raw);
    expect(result.therapist_summary).toBe("Clinical summary here");
    expect(result.client_summary).toBe("Friendly summary here");
  });

  it("should throw on missing fields", () => {
    expect(() =>
      parseSummaryResponse('{"therapist_summary":"test"}')
    ).toThrow("missing client_summary");
  });
});

describe("parseSafetyResponse", () => {
  it("should parse valid safety flags", () => {
    const raw = JSON.stringify({
      flags: [
        {
          flag_type: "self_harm",
          severity: "medium",
          excerpt: "I sometimes think everyone would be better off without me",
        },
      ],
    });

    const result = parseSafetyResponse(raw);
    expect(result).toHaveLength(1);
    expect(result[0].flag_type).toBe("self_harm");
    expect(result[0].severity).toBe("medium");
  });

  it("should return empty array for no flags", () => {
    const raw = JSON.stringify({ flags: [] });
    expect(parseSafetyResponse(raw)).toEqual([]);
  });

  it("should filter out invalid flag types", () => {
    const raw = JSON.stringify({
      flags: [
        { flag_type: "invalid_type", severity: "low", excerpt: "test" },
        { flag_type: "crisis", severity: "high", excerpt: "real concern" },
      ],
    });

    const result = parseSafetyResponse(raw);
    expect(result).toHaveLength(1);
    expect(result[0].flag_type).toBe("crisis");
  });

  it("should filter out flags with empty excerpts", () => {
    const raw = JSON.stringify({
      flags: [{ flag_type: "crisis", severity: "high", excerpt: "" }],
    });

    expect(parseSafetyResponse(raw)).toEqual([]);
  });

  it("should handle missing flags array gracefully", () => {
    expect(parseSafetyResponse("{}")).toEqual([]);
  });
});
