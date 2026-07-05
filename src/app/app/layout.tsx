import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Layout da área autenticada (/app/*): feed, matches, chat, perfil.
// A verificação de login roda aqui (Server Component), nao em Middleware,
// para evitar problemas de compatibilidade do cliente Supabase com o Edge Runtime.
// PRÓXIMA ETAPA: navegação inferior (feed / matches / perfil), estilo Tinder.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <div className="min-h-screen">{children}</div>;
}
