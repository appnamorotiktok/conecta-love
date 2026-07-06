import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { CopyLinkButton } from "@/components/copy-link-button";

// Painel do influenciador. Mostra os cadastros atribuídos ao link dele
// (dado real, já funcionando). Assinantes pagantes e comissão aparecem
// quando a assinatura Premium via Asaas estiver integrada — por enquanto
// as tabelas `subscriptions`/`payments`/`commissions` ficam vazias.
export default async function InfluencerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: influencer } = await supabase
    .from("influencers")
    .select("id, name, referral_code, commission_rate")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!influencer) {
    redirect("/app/feed");
  }

  const { data: referrals } = await supabase
    .from("profiles")
    .select("id, full_name, city, created_at")
    .eq("referred_by_influencer_id", influencer.id)
    .order("created_at", { ascending: false });

  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL}/r/${influencer.referral_code}`;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">Painel — {influencer.name}</h1>
        <LogoutButton />
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">Seu link de convite</p>
        <p className="mt-1 break-all font-mono text-sm">{referralLink}</p>
        <CopyLinkButton url={referralLink} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-bold">{(referrals ?? []).length}</p>
          <p className="text-xs text-muted-foreground">Cadastros pelo seu link</p>
        </div>
        <div className="rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-bold">
            {(influencer.commission_rate * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground">Sua comissão</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Assinantes pagantes e comissão a receber aparecem aqui assim que a
        assinatura Premium estiver ativa.
      </div>

      <div className="mt-6">
        <h2 className="font-semibold">Pessoas cadastradas pelo seu link</h2>
        {(referrals ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Ninguém se cadastrou pelo seu link ainda.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {(referrals ?? []).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
              >
                <span>{r.full_name}</span>
                <span className="text-muted-foreground">{r.city}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
