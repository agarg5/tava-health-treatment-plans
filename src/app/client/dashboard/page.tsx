import Link from "next/link";
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

export default async function ClientDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get client profile
  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  if (!clientProfile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Your therapist hasn&apos;t linked your account yet. Please contact
              your therapist to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get treatment plan with current version
  const { data: plan } = await supabase
    .from("treatment_plans")
    .select(`
      *,
      current_version:treatment_plan_versions!treatment_plans_current_version_id_fkey(*)
    `)
    .eq("client_id", clientProfile.id)
    .single();

  const clientView: ClientView | null = plan?.current_version?.client_view ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome, {clientProfile.name}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s your treatment plan overview
        </p>
      </div>

      {!clientView ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              Your treatment plan is being prepared.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back after your next session with your therapist.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Your Plan</CardTitle>
              <CardDescription>{clientView.summary}</CardDescription>
            </CardHeader>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Goals</CardTitle>
              <CardDescription>
                What we&apos;re working toward together
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {clientView.goals.map((goal, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-2">
                  <h3 className="font-medium">{goal.description}</h3>
                  <p className="text-sm text-muted-foreground">
                    {goal.why_it_matters}
                  </p>
                  <div className="space-y-1">
                    {goal.action_steps.map((step, j) => (
                      <div
                        key={j}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-primary mt-0.5">&#x2022;</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Homework */}
          {clientView.homework.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Between Sessions</CardTitle>
                <CardDescription>
                  Things to try before our next session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {clientView.homework.map((hw, i) => (
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
          {clientView.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Strengths</CardTitle>
                <CardDescription>
                  Qualities that support your growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {clientView.strengths.map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-sm">
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          {clientView.next_steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {clientView.next_steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary font-bold">
                        {i + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
