import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ClientSessionPage({
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

  // Fetch session
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .eq("client_id", clientProfile.id)
    .single();

  if (!session) notFound();

  // Fetch client-facing summary
  const { data: summary } = await supabase
    .from("session_summaries")
    .select("client_summary")
    .eq("session_id", id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Session {session.session_number}</h1>
        <p className="text-muted-foreground">
          {new Date(session.session_date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {summary ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Summary</CardTitle>
            <CardDescription>
              Here&apos;s what we worked on together
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{summary.client_summary}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Your session summary is being prepared. Check back soon.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
