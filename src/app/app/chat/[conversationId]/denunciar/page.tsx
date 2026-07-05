import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReportForm } from "./report-form";

export default async function DenunciarPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, match_id")
    .eq("id", params.conversationId)
    .maybeSingle();

  if (!conversation) {
    redirect("/app/matches");
  }

  const { data: match } = await supabase
    .from("matches")
    .select("id, user_a, user_b")
    .eq("id", conversation.match_id)
    .maybeSingle();

  if (!match || (match.user_a !== user.id && match.user_b !== user.id)) {
    redirect("/app/matches");
  }

  const otherUserId = match.user_a === user.id ? match.user_b : match.user_a;

  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", otherUserId)
    .maybeSingle();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-6">
      <Link
        href={`/app/chat/${params.conversationId}`}
        className="mb-2 text-sm text-muted-foreground"
      >
        ← Voltar para a conversa
      </Link>
      <h1 className="text-lg font-bold text-primary">
        Denunciar {otherProfile?.full_name ?? "perfil"}
      </h1>
      <ReportForm reportedId={otherUserId} />
    </main>
  );
}
