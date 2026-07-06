import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Layout da área autenticada (/app/*): feed, matches, chat, perfil.
// A verificação de login roda aqui (Server Component), nao em Middleware,
// para evitar problemas de compatibilidade do cliente Supabase com o Edge Runtime.
// O menu de navegação inferior fica no layout do grupo (main), não aqui,
// porque a tela de chat não deve ter o menu cobrindo o campo de mensagem.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <div className="min-h-screen">{children}</div>;
}
