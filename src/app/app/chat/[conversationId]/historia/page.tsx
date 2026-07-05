import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HistoriaForm } from "./historia-form";

export default async function HistoriaPage({
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

  const { data: story } = await supabase
    .from("success_stories")
    .select("id, status")
    .eq("match_id", match.id)
    .maybeSingle();

  let alreadyConfirmed = false;
  if (story) {
    const { data: confirmation } = await supabase
      .from("success_story_confirmations")
      .select("id")
      .eq("success_story_id", story.id)
      .eq("profile_id", user.id)
      .maybeSingle();
    alreadyConfirmed = !!confirmation;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-6">
      <h1 className="text-lg font-bold text-primary">Somos um casal 💍</h1>
      <HistoriaForm
        matchId={match.id}
        userId={user.id}
        alreadyConfirmed={alreadyConfirmed}
        storyStatus={story?.status ?? null}
      />
    </main>
  );
}
