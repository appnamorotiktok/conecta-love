import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { FeedClient, type Candidate } from "./feed-client";

function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age--;
  return age;
}

export default async function FeedPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: myLikes }, { data: blockedByMe }, { data: blockedMe }] =
    await Promise.all([
      supabase.from("likes").select("liked_id").eq("liker_id", user.id),
      supabase.from("blocked_users").select("blocked_id").eq("blocker_id", user.id),
      supabase.from("blocked_users").select("blocker_id").eq("blocked_id", user.id),
    ]);

  const excludeIds = new Set<string>([
    user.id,
    ...(myLikes ?? []).map((l) => l.liked_id),
    ...(blockedByMe ?? []).map((b) => b.blocked_id),
    ...(blockedMe ?? []).map((b) => b.blocker_id),
  ]);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, birth_date, city, bio, profession")
    .limit(50);

  const candidateProfiles = (profiles ?? []).filter((p) => !excludeIds.has(p.id));
  const candidateIds = candidateProfiles.map((p) => p.id);

  const { data: photos } =
    candidateIds.length > 0
      ? await supabase
          .from("profile_photos")
          .select("profile_id, storage_path")
          .in("profile_id", candidateIds)
          .eq("is_primary", true)
      : { data: [] };

  const photoByProfile = new Map(
    (photos ?? []).map((p) => [
      p.profile_id,
      supabase.storage.from("profile-photos").getPublicUrl(p.storage_path).data
        .publicUrl,
    ])
  );

  const candidates: Candidate[] = candidateProfiles.map((p) => ({
    id: p.id,
    name: p.full_name,
    age: calculateAge(p.birth_date),
    city: p.city,
    bio: p.bio,
    profession: p.profession,
    photoUrl: photoByProfile.get(p.id) ?? null,
  }));

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">ConectaLove</h1>
        <LogoutButton />
      </div>
      <FeedClient candidates={candidates} />
    </main>
  );
}
