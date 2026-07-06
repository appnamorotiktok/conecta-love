import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export default async function MatchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: matches }, { data: blockedByMe }, { data: blockedMe }] =
    await Promise.all([
      supabase
        .from("matches")
        .select("id, user_a, user_b")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
      supabase.from("blocked_users").select("blocked_id").eq("blocker_id", user.id),
      supabase.from("blocked_users").select("blocker_id").eq("blocked_id", user.id),
    ]);

  const blockedIds = new Set<string>([
    ...(blockedByMe ?? []).map((b) => b.blocked_id),
    ...(blockedMe ?? []).map((b) => b.blocker_id),
  ]);

  const matchList = (matches ?? []).filter((m) => {
    const otherId = m.user_a === user.id ? m.user_b : m.user_a;
    return !blockedIds.has(otherId);
  });
  const otherUserIds = matchList.map((m) =>
    m.user_a === user.id ? m.user_b : m.user_a
  );

  const [{ data: profiles }, { data: photos }, { data: conversations }] =
    await Promise.all([
      otherUserIds.length > 0
        ? supabase.from("profiles").select("id, full_name").in("id", otherUserIds)
        : Promise.resolve({ data: [] }),
      otherUserIds.length > 0
        ? supabase
            .from("profile_photos")
            .select("profile_id, storage_path")
            .in("profile_id", otherUserIds)
            .eq("is_primary", true)
        : Promise.resolve({ data: [] }),
      matchList.length > 0
        ? supabase
            .from("conversations")
            .select("id, match_id")
            .in(
              "match_id",
              matchList.map((m) => m.id)
            )
        : Promise.resolve({ data: [] }),
    ]);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  const photoById = new Map(
    (photos ?? []).map((p) => [
      p.profile_id,
      supabase.storage.from("profile-photos").getPublicUrl(p.storage_path).data
        .publicUrl,
    ])
  );
  const conversationByMatch = new Map(
    (conversations ?? []).map((c) => [c.match_id, c.id])
  );

  const rows = matchList
    .map((m) => {
      const otherId = m.user_a === user.id ? m.user_b : m.user_a;
      const conversationId = conversationByMatch.get(m.id);
      if (!conversationId) return null;
      return {
        conversationId,
        name: nameById.get(otherId) ?? "Perfil",
        photoUrl: photoById.get(otherId) ?? null,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">Seus matches</h1>
        <LogoutButton />
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          Você ainda não deu nenhum match. Vá em "Descobrir pessoas" para começar.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <Link key={row.conversationId} href={`/app/chat/${row.conversationId}`}>
              <Card className="flex items-center gap-3 p-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={row.photoUrl ?? undefined} alt={row.name} />
                  <AvatarFallback>{row.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{row.name}</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
