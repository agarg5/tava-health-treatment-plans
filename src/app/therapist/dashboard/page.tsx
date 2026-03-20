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
import { Button } from "@/components/ui/button";

export default async function TherapistDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch therapist's clients
  const { data: clients } = await supabase
    .from("client_profiles")
    .select(`
      *,
      sessions:sessions(id, session_date, session_number),
      treatment_plans:treatment_plans(id, status, updated_at)
    `)
    .eq("therapist_id", user!.id)
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your clients and treatment plans
          </p>
        </div>
      </div>

      {!clients || clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No clients yet. Clients will appear here once they are linked to
              your account.
            </p>
            <p className="text-sm text-muted-foreground">
              Use the demo accounts or register a client to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => {
            const sessionCount = client.sessions?.length ?? 0;
            const latestSession = client.sessions?.sort(
              (a: { session_date: string }, b: { session_date: string }) =>
                new Date(b.session_date).getTime() -
                new Date(a.session_date).getTime()
            )[0];
            const plan = client.treatment_plans?.[0];

            return (
              <Link key={client.id} href={`/therapist/clients/${client.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      {plan && (
                        <Badge
                          variant={
                            plan.status === "active" ? "default" : "secondary"
                          }
                        >
                          {plan.status}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {sessionCount} session{sessionCount !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {latestSession ? (
                        <span>
                          Last session:{" "}
                          {new Date(
                            latestSession.session_date
                          ).toLocaleDateString()}
                        </span>
                      ) : (
                        <span>No sessions yet</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
