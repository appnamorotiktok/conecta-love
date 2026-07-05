import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Admin mínimo da Fase 1: moderação de denúncias (`reports`), lista de
// usuários e valores devidos a influenciadores (`commissions`).
export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="mt-2 text-muted-foreground">
          Em construção — próxima etapa do desenvolvimento.
        </p>
      </div>
    </main>
  );
}
