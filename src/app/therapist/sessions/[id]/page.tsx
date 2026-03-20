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
import { GeneratePlanButton } from "@/components/session/generate-plan-button";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch session with transcript
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .eq("therapist_id", user!.id)
    .single();

  if (!session) notFound();

  const { data: transcript } = await supabase
    .from("transcripts")
    .select("*")
    .eq("session_id", id)
    .single();

  const { data: safetyFlags } = await supabase
    .from("safety_flags")
    .select("*")
    .eq("session_id", id)
    .order("created_at");

  const { data: summary } = await supabase
    .from("session_summaries")
    .select("*")
    .eq("session_id", id)
    .single();

  // Check if there's a treatment plan for this client
  const { data: plan } = await supabase
    .from("treatment_plans")
    .select("id")
    .eq("client_id", session.client_id)
    .single();

  // Get client name
  const { data: client } = await supabase
    .from("client_profiles")
    .select("name")
    .eq("id", session.client_id)
    .single();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Session {session.session_number}
          </h1>
          <p className="text-muted-foreground">
            {client?.name} &middot;{" "}
            {new Date(session.session_date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/therapist/clients/${session.client_id}`}>
            <Button variant="outline">Back to Client</Button>
          </Link>
          {plan && (
            <Link href={`/therapist/plans/${plan.id}`}>
              <Button variant="outline">View Plan</Button>
            </Link>
          )}
        </div>
      </div>

      {session.notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Session Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{session.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Safety Flags */}
      {safetyFlags && safetyFlags.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-destructive">
              Safety Flags
            </CardTitle>
            <CardDescription>
              The following concerns were detected in this transcript
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {safetyFlags.map((flag) => (
              <div
                key={flag.id}
                className="flex items-start gap-3 rounded-md bg-destructive/5 p-3"
              >
                <Badge
                  variant="destructive"
                  className="shrink-0 mt-0.5"
                >
                  {flag.severity}
                </Badge>
                <div>
                  <p className="text-sm font-medium capitalize">
                    {flag.flag_type.replace("_", " ")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">
                    &ldquo;{flag.excerpt}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Session Summary */}
      {summary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Session Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {summary.therapist_summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Generate Plan Button */}
      {transcript && (
        <GeneratePlanButton
          sessionId={id}
          clientId={session.client_id}
          hasPlan={!!plan}
        />
      )}

      {/* Transcript */}
      {transcript ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Transcript</CardTitle>
              <Badge variant="secondary" className="capitalize">
                {transcript.source}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto rounded-md bg-muted/50 p-4">
              <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {transcript.content}
              </pre>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No transcript available for this session.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
