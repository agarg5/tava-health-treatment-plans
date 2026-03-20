import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/ai/openai";
import {
  TREATMENT_PLAN_SYSTEM_PROMPT,
  TREATMENT_PLAN_USER_PROMPT,
  SESSION_SUMMARY_SYSTEM_PROMPT,
  SESSION_SUMMARY_USER_PROMPT,
  SAFETY_CHECK_SYSTEM_PROMPT,
  SAFETY_CHECK_USER_PROMPT,
} from "@/lib/ai/prompts";
import {
  parsePlanResponse,
  parseSummaryResponse,
  parseSafetyResponse,
} from "@/lib/ai/parse";

export async function POST(request: Request) {
  try {
    const { sessionId, clientId } = await request.json();

    if (!sessionId || !clientId) {
      return NextResponse.json(
        { error: "sessionId and clientId are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch transcript
    const { data: transcript } = await supabase
      .from("transcripts")
      .select("content")
      .eq("session_id", sessionId)
      .single();

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript not found" },
        { status: 404 }
      );
    }

    // Run all AI calls in parallel
    const [planResult, summaryResult, safetyResult] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: TREATMENT_PLAN_SYSTEM_PROMPT },
          {
            role: "user",
            content: TREATMENT_PLAN_USER_PROMPT(transcript.content),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SESSION_SUMMARY_SYSTEM_PROMPT },
          {
            role: "user",
            content: SESSION_SUMMARY_USER_PROMPT(transcript.content),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SAFETY_CHECK_SYSTEM_PROMPT },
          {
            role: "user",
            content: SAFETY_CHECK_USER_PROMPT(transcript.content),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    ]);

    // Parse responses
    const planData = parsePlanResponse(
      planResult.choices[0].message.content || "{}"
    );
    const summaryData = parseSummaryResponse(
      summaryResult.choices[0].message.content || "{}"
    );
    const safetyFlags = parseSafetyResponse(
      safetyResult.choices[0].message.content || '{"flags":[]}'
    );

    // Check if plan already exists for this client
    const { data: existingPlan } = await supabase
      .from("treatment_plans")
      .select("id")
      .eq("client_id", clientId)
      .single();

    let planId: string;

    if (existingPlan) {
      planId = existingPlan.id;

      // Get current max version number
      const { data: versions } = await supabase
        .from("treatment_plan_versions")
        .select("version_number")
        .eq("plan_id", planId)
        .order("version_number", { ascending: false })
        .limit(1);

      const nextVersion = (versions?.[0]?.version_number ?? 0) + 1;

      // Create new version
      const { data: newVersion } = await supabase
        .from("treatment_plan_versions")
        .insert({
          plan_id: planId,
          version_number: nextVersion,
          session_id: sessionId,
          therapist_view: planData.therapist_view,
          client_view: planData.client_view,
        })
        .select()
        .single();

      // Update plan to point to new version
      await supabase
        .from("treatment_plans")
        .update({
          current_version_id: newVersion!.id,
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", planId);
    } else {
      // Create new plan
      const { data: newPlan } = await supabase
        .from("treatment_plans")
        .insert({
          client_id: clientId,
          therapist_id: user.id,
          status: "active",
        })
        .select()
        .single();

      planId = newPlan!.id;

      // Create first version
      const { data: newVersion } = await supabase
        .from("treatment_plan_versions")
        .insert({
          plan_id: planId,
          version_number: 1,
          session_id: sessionId,
          therapist_view: planData.therapist_view,
          client_view: planData.client_view,
        })
        .select()
        .single();

      // Update plan with current version
      await supabase
        .from("treatment_plans")
        .update({ current_version_id: newVersion!.id })
        .eq("id", planId);
    }

    // Save session summary
    await supabase.from("session_summaries").upsert(
      {
        session_id: sessionId,
        therapist_summary: summaryData.therapist_summary,
        client_summary: summaryData.client_summary,
      },
      { onConflict: "session_id" }
    );

    // Save safety flags
    if (safetyFlags.length > 0) {
      await supabase.from("safety_flags").insert(
        safetyFlags.map((flag) => ({
          session_id: sessionId,
          flag_type: flag.flag_type,
          severity: flag.severity,
          excerpt: flag.excerpt,
        }))
      );
    }

    return NextResponse.json({ planId, success: true });
  } catch (error) {
    console.error("Plan generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate plan",
      },
      { status: 500 }
    );
  }
}
