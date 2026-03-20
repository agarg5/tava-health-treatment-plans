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
import { TranscriptUpload } from "@/components/session/transcript-upload";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch client
  const { data: client } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("id", id)
    .eq("therapist_id", user!.id)
    .single();

  if (!client) notFound();

  // Fetch sessions with transcripts
  const { data: sessions } = await supabase
    .from("sessions")
    .select(`
      *,
      transcripts:transcripts(id, source, created_at),
      safety_flags:safety_flags(id, flag_type, severity)
    `)
    .eq("client_id", id)
    .order("session_date", { ascending: false });

  // Fetch treatment plan
  const { data: plan } = await supabase
    .from("treatment_plans")
    .select("*")
    .eq("client_id", id)
    .single();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          <p className="text-muted-foreground">
            {sessions?.length ?? 0} session
            {(sessions?.length ?? 0) !== 1 ? "s" : ""}
            {plan && (
              <>
                {" "}
                &middot; Plan:{" "}
                <Badge variant={plan.status === "active" ? "default" : "secondary"}>
                  {plan.status}
                </Badge>
              </>
            )}
          </p>
        </div>
        {plan && (
          <Link href={`/therapist/plans/${plan.id}`}>
            <Button variant="outline">View Treatment Plan</Button>
          </Link>
        )}
      </div>

      {/* Upload Transcript Section */}
      <TranscriptUpload clientId={id} therapistId={user!.id} sessionCount={sessions?.length ?? 0} />

      {/* Sessions List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Sessions</h2>
        {!sessions || sessions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No sessions yet. Upload a transcript to create the first session.
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => {
            const hasTranscript = session.transcripts && session.transcripts.length > 0;
            const hasFlags = session.safety_flags && session.safety_flags.length > 0;

            return (
              <Link
                key={session.id}
                href={`/therapist/sessions/${session.id}`}
              >
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Session {session.session_number}
                      </CardTitle>
                      <div className="flex gap-2">
                        {hasFlags && (
                          <Badge variant="destructive">
                            {session.safety_flags.length} flag
                            {session.safety_flags.length !== 1 ? "s" : ""}
                          </Badge>
                        )}
                        {hasTranscript && (
                          <Badge variant="secondary">Transcript</Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {new Date(session.session_date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                      {session.notes && ` — ${session.notes}`}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
