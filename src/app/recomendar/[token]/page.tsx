import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecommendForm } from "./recommend-form";

export default async function RecommendPage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .rpc("get_profile_by_invite_token", { token: params.token })
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold">Você conhece {profile.full_name}?</h1>
      <p className="mt-1 text-muted-foreground">
        Escreva uma recomendação sincera. Ela só aparece no perfil depois que{" "}
        {profile.full_name} aprovar.
      </p>
      <RecommendForm profileId={profile.id} />
    </main>
  );
}
