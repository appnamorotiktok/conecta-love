import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Troca o codigo do OAuth/magic link por uma sessao e redireciona.
// Chamado pelo Google apos o login (redirectTo) e pelo link de confirmacao de email.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
