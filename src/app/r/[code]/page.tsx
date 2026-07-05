// Página de destino do link de referência de cada influenciador
// (ex: conectalove.com/r/maria). PRÓXIMA ETAPA: gravar o `referral_code` em
// cookie/localStorage e, no cadastro, resolver para `influencers.id` e gravar
// permanentemente em `profiles.referred_by_influencer_id`.
export default function ReferralLandingPage({
  params,
}: {
  params: { code: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">
          Você foi convidado(a) por {params.code}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Em construção — próxima etapa do desenvolvimento.
        </p>
      </div>
    </main>
  );
}
