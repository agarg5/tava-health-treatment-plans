import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ClientView } from "@/lib/types";

export default async function ClientPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get client profile
  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  if (!clientProfile) notFound();

  // Fetch plan with current version
  const { data: plan } = await supabase
    .from("treatment_plans")
    .select("*")
    .eq("id", id)
    .eq("client_id", clientProfile.id)
    .single();

  if (!plan) notFound();

  const { data: currentVersion } = plan.current_version_id
    ? await supabase
        .from("treatment_plan_versions")
        .select("*")
        .eq("id", plan.current_version_id)
        .single()
    : { data: null };

  const cv: ClientView | null = currentVersion?.client_view ?? null;

  if (!cv) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Your Treatment Plan</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Your treatment plan is being prepared. Check back soon.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Treatment Plan</h1>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-base leading-relaxed">{cv.summary}</p>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Goals</CardTitle>
          <CardDescription>What we&apos;re working toward together</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cv.goals.map((goal, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-2">
              <h3 className="font-medium">{goal.description}</h3>
              <p className="text-sm text-muted-foreground">
                {goal.why_it_matters}
              </p>
              <div className="space-y-1 pt-1">
                {goal.action_steps.map((step, j) => (
                  <div key={j} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">&#x2713;</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Homework */}
      {cv.homework.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Between Sessions</CardTitle>
            <CardDescription>Things to try before our next session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cv.homework.map((hw, i) => (
              <div key={i} className="rounded-lg bg-muted/50 p-4 space-y-1">
                <p className="font-medium text-sm">{hw.task}</p>
                <p className="text-sm text-muted-foreground italic">
                  {hw.encouragement}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      {cv.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {cv.strengths.map((s, i) => (
                <Badge key={i} variant="secondary" className="text-sm">
                  {s}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {cv.next_steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {cv.next_steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-bold">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Last updated:{" "}
        {new Date(plan.updated_at).toLocaleString("en-US", {
          dateStyle: "long",
          timeStyle: "short",
        })}
      </p>
    </div>
  );
}
