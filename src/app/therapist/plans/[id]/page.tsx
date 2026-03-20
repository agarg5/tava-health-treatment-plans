import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EditPlanField } from "@/components/treatment-plan/edit-plan-field";
import type { TherapistView } from "@/lib/types";

export default async function TherapistPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch plan with current version
  const { data: plan } = await supabase
    .from("treatment_plans")
    .select("*")
    .eq("id", id)
    .eq("therapist_id", user!.id)
    .single();

  if (!plan) notFound();

  // Fetch current version
  const { data: currentVersion } = plan.current_version_id
    ? await supabase
        .from("treatment_plan_versions")
        .select("*")
        .eq("id", plan.current_version_id)
        .single()
    : { data: null };

  // Get client name
  const { data: client } = await supabase
    .from("client_profiles")
    .select("name")
    .eq("id", plan.client_id)
    .single();

  // Get version count for history link
  const { count: versionCount } = await supabase
    .from("treatment_plan_versions")
    .select("*", { count: "exact", head: true })
    .eq("plan_id", id);

  const tv: TherapistView | null = currentVersion?.therapist_view ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Treatment Plan</h1>
          <p className="text-muted-foreground">
            {client?.name} &middot;{" "}
            <Badge variant={plan.status === "active" ? "default" : "secondary"}>
              {plan.status}
            </Badge>
            {currentVersion && (
              <span className="ml-2">
                Version {currentVersion.version_number}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/therapist/clients/${plan.client_id}`}>
            <Button variant="outline">Back to Client</Button>
          </Link>
          {(versionCount ?? 0) > 1 && (
            <Link href={`/therapist/plans/${id}/history`}>
              <Button variant="outline">
                History ({versionCount} versions)
              </Button>
            </Link>
          )}
        </div>
      </div>

      {!tv ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No treatment plan generated yet.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Presenting Concerns */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Presenting Concerns</CardTitle>
              {currentVersion && (
                <EditPlanField
                  planId={id}
                  versionId={currentVersion.id}
                  field="presenting_concerns"
                  currentValue={tv.presenting_concerns.join("\n")}
                />
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {tv.presenting_concerns.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground mt-0.5">&#x2022;</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Clinical Impressions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Clinical Impressions</CardTitle>
              {currentVersion && (
                <EditPlanField
                  planId={id}
                  versionId={currentVersion.id}
                  field="clinical_impressions"
                  currentValue={tv.clinical_impressions || ""}
                />
              )}
            </CardHeader>
            {tv.clinical_impressions && (
              <CardContent>
                <p className="text-sm">{tv.clinical_impressions}</p>
              </CardContent>
            )}
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Treatment Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tv.goals.map((goal, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{goal.description}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="capitalize">
                        {goal.type.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant={
                          goal.status === "active" ? "default" : "secondary"
                        }
                      >
                        {goal.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Interventions
                    </p>
                    <ul className="space-y-1">
                      {goal.interventions.map((int, j) => (
                        <li
                          key={j}
                          className="text-sm flex items-start gap-2"
                        >
                          <span className="text-muted-foreground mt-0.5">
                            &#x2022;
                          </span>
                          <span>{int}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Homework */}
          {tv.homework.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Homework / Between-Session Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tv.homework.map((hw, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="font-mono text-muted-foreground">
                        {i + 1}.
                      </span>
                      <span>{hw}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Strengths */}
          {tv.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Strengths &amp; Protective Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tv.strengths.map((s, i) => (
                    <Badge key={i} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Indicators */}
          {tv.risk_indicators.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-lg text-destructive">
                  Risk Indicators
                </CardTitle>
                <CardDescription>
                  Flagged concerns from transcript analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tv.risk_indicators.map((risk, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-destructive"
                    >
                      <span className="mt-0.5">&#x26A0;</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Separator />

          <p className="text-xs text-muted-foreground text-center">
            Last updated:{" "}
            {new Date(plan.updated_at).toLocaleString("en-US", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </>
      )}
    </div>
  );
}
