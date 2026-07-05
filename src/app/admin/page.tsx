import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { ReportActions } from "@/components/report-actions";

// Admin mínimo da Fase 1: moderação de denúncias (`reports`) e lista de
// usuários. Valores devidos a influenciadores entram quando o Asaas
// estiver integrado (`commissions` ainda não é alimentada).
export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/app/feed");
  }

  const [{ data: reports }, { data: users }, { data: stories }] =
    await Promise.all([
      supabase
        .from("reports")
        .select("id, reporter_id, reported_id, reason, details, status, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, full_name, city, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("success_stories")
        .select("id")
        .eq("status", "ready_to_publish"),
    ]);

  const nameById = new Map((users ?? []).map((u) => [u.id, u.full_name]));

  type ConfirmationRow = {
    success_story_id: string;
    profile_id: string;
    photo_storage_path: string | null;
    testimonial: string | null;
  };

  const storyIds = (stories ?? []).map((s) => s.id);
  let confirmations: ConfirmationRow[] = [];
  if (storyIds.length > 0) {
    const { data } = await supabase
      .from("success_story_confirmations")
      .select("success_story_id, profile_id, photo_storage_path, testimonial")
      .in("success_story_id", storyIds);
    confirmations = data ?? [];
  }

  const confirmationsByStory = new Map<string, ConfirmationRow[]>();
  for (const c of confirmations) {
    const arr = confirmationsByStory.get(c.success_story_id) ?? [];
    arr.push(c);
    confirmationsByStory.set(c.success_story_id, arr);
  }

  const photoUrl = (path: string) =>
    supabase.storage.from("profile-photos").getPublicUrl(path).data.publicUrl;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">Admin</h1>
        <LogoutButton />
      </div>

      <section>
        <h2 className="font-semibold">Denúncias</h2>
        {(reports ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhuma denúncia registrada.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-3">
            {(reports ?? []).map((r) => (
              <div key={r.id} className="rounded-lg border border-border p-3">
                <p className="text-sm">
                  <strong>{nameById.get(r.reporter_id) ?? "Alguém"}</strong>{" "}
                  denunciou{" "}
                  <strong>{nameById.get(r.reported_id) ?? "Alguém"}</strong>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Motivo: {r.reason}
                </p>
                {r.details && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {r.details}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Status: {r.status}
                </p>
                {r.status === "pending" && <ReportActions id={r.id} />}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">
          Histórias de sucesso prontas ({(stories ?? []).length})
        </h2>
        {(stories ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhuma história pronta ainda.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-4">
            {(stories ?? []).map((s) => (
              <div key={s.id} className="rounded-lg border border-border p-3">
                <div className="grid grid-cols-2 gap-3">
                  {(confirmationsByStory.get(s.id) ?? []).map((c) => (
                    <div key={c.profile_id}>
                      {c.photo_storage_path && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photoUrl(c.photo_storage_path)}
                          alt=""
                          className="aspect-square w-full rounded-lg object-cover"
                        />
                      )}
                      <p className="mt-1 text-sm font-medium">
                        {nameById.get(c.profile_id) ?? "Perfil"}
                      </p>
                      {c.testimonial && (
                        <p className="text-sm text-muted-foreground">
                          {c.testimonial}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">Usuários ({(users ?? []).length})</h2>
        <div className="mt-2 flex flex-col gap-2">
          {(users ?? []).map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
            >
              <span>{u.full_name}</span>
              <span className="text-muted-foreground">{u.city}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
