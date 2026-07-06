import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatClient, type ChatMessage } from "./chat-client";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, match_id")
    .eq("id", conversationId)
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

  const [{ data: otherProfile }, { data: otherPhoto }, { data: messages }] =
    await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", otherUserId).maybeSingle(),
      supabase
        .from("profile_photos")
        .select("storage_path")
        .eq("profile_id", otherUserId)
        .eq("is_primary", true)
        .maybeSingle(),
      supabase
        .from("messages")
        .select("id, conversation_id, sender_id, content, read_at, created_at")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true }),
    ]);

  const otherPhotoUrl = otherPhoto
    ? supabase.storage.from("profile-photos").getPublicUrl(otherPhoto.storage_path)
        .data.publicUrl
    : null;

  return (
    <ChatClient
      conversationId={conversation.id}
      currentUserId={user.id}
      otherUserId={otherUserId}
      otherUserName={otherProfile?.full_name ?? "Perfil"}
      otherUserPhotoUrl={otherPhotoUrl}
      initialMessages={(messages ?? []) as ChatMessage[]}
    />
  );
}
