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

export default async function PlanHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch plan
  const { data: plan } = await supabase
    .from("treatment_plans")
    .select("*")
    .eq("id", id)
    .eq("therapist_id", user!.id)
    .single();

  if (!plan) notFound();

  // Fetch all versions with session info
  const { data: versions } = await supabase
    .from("treatment_plan_versions")
    .select(`
      *,
      session:sessions(session_number, session_date)
    `)
    .eq("plan_id", id)
    .order("version_number", { ascending: false });

  // Get client name
  const { data: client } = await supabase
    .from("client_profiles")
    .select("name")
    .eq("id", plan.client_id)
    .single();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plan History</h1>
          <p className="text-muted-foreground">
            {client?.name} &middot; {versions?.length ?? 0} version
            {(versions?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href={`/therapist/plans/${id}`}>
          <Button variant="outline">Back to Current Plan</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {versions?.map((version) => {
          const isCurrent = version.id === plan.current_version_id;
          const goalCount = version.therapist_view?.goals?.length ?? 0;
          const hasRisks =
            (version.therapist_view?.risk_indicators?.length ?? 0) > 0;

          return (
            <Card
              key={version.id}
              className={isCurrent ? "border-primary" : ""}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Version {version.version_number}
                    {isCurrent && (
                      <Badge className="ml-2" variant="default">
                        Current
                      </Badge>
                    )}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {new Date(version.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <CardDescription>
                  {version.session && (
                    <span>
                      Generated from Session {version.session.session_number} (
                      {new Date(
                        version.session.session_date
                      ).toLocaleDateString()}
                      )
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{goalCount} goals</span>
                  <span>
                    {version.therapist_view?.presenting_concerns?.length ?? 0}{" "}
                    concerns
                  </span>
                  {hasRisks && (
                    <Badge variant="destructive" className="text-xs">
                      Risk flags
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
