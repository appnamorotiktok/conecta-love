import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { CopyLinkButton } from "@/components/copy-link-button";
import { RecommendationActions } from "@/components/recommendation-actions";

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

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: photos }, { data: recommendations }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("profile_photos")
        .select("storage_path, position")
        .eq("profile_id", user.id)
        .order("position"),
      supabase
        .from("recommendations")
        .select("id, recommender_name, friendship_years, message, status")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  if (!profile) return null;

  const photoUrls = (photos ?? []).map(
    (p) =>
      supabase.storage.from("profile-photos").getPublicUrl(p.storage_path).data
        .publicUrl
  );

  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/recomendar/${profile.invite_token}`;

  const pending = (recommendations ?? []).filter((r) => r.status === "pending");
  const approved = (recommendations ?? []).filter((r) => r.status === "approved");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">Meu perfil</h1>
        <LogoutButton />
      </div>

      {photoUrls.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {photoUrls.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=""
              className="aspect-square w-full rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      <h2 className="text-xl font-bold">
        {profile.full_name}, {calculateAge(profile.birth_date)}
      </h2>
      <p className="text-sm text-muted-foreground">
        {profile.city}
        {profile.profession ? ` · ${profile.profession}` : ""}
      </p>
      {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}

      <div className="mt-6 rounded-lg border border-border p-4">
        <h3 className="font-semibold">Convide um amigo pra recomendar você</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Quem conhece você de verdade pode escrever uma recomendação que
          aparece no seu perfil, depois que você aprovar.
        </p>
        <CopyLinkButton url={inviteUrl} />
      </div>

      {pending.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold">Recomendações pendentes de aprovação</h3>
          <div className="mt-2 flex flex-col gap-2">
            {pending.map((r) => (
              <RecommendationActions
                key={r.id}
                id={r.id}
                name={r.recommender_name}
                years={r.friendship_years}
                message={r.message}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-semibold">Pessoas que recomendam este perfil</h3>
        {approved.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Ainda ninguém recomendou você.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-3">
            {approved.map((r) => (
              <div key={r.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium">
                  {r.recommender_name}
                  {r.friendship_years
                    ? ` · amigos há ${r.friendship_years} anos`
                    : ""}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{r.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
