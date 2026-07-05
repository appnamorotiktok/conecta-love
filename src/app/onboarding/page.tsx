import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    redirect("/app/feed");
  }

  const refCode = cookies().get("ref_code")?.value;
  let influencerId: string | null = null;
  if (refCode) {
    const { data: influencer } = await supabase
      .from("public_influencer_lookup")
      .select("id")
      .eq("referral_code", refCode)
      .eq("status", "active")
      .maybeSingle();
    influencerId = influencer?.id ?? null;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold">Complete seu perfil</h1>
      <p className="mt-1 text-muted-foreground">
        Isso é o que as outras pessoas vão ver de você.
      </p>
      <OnboardingForm userId={user.id} influencerId={influencerId} />
    </main>
  );
}
