import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SetReferralCookie } from "./set-referral-cookie";

export default async function ReferralLandingPage({
  params,
}: {
  params: { code: string };
}) {
  const supabase = createClient();

  const { data: influencer } = await supabase
    .from("public_influencer_lookup")
    .select("id, name")
    .eq("referral_code", params.code)
    .eq("status", "active")
    .maybeSingle();

  if (!influencer) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <SetReferralCookie code={params.code} />
      <span className="text-sm font-medium text-primary">ConectaLove</span>
      <h1 className="mt-2 text-2xl font-bold">
        Você foi convidado(a) por {influencer.name}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Crie sua conta para fazer parte dessa comunidade.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href="/login">Continuar</Link>
      </Button>
    </main>
  );
}
