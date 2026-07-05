"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Tem certeza que quer excluir sua conta? Essa ação não pode ser desfeita — seu perfil, fotos, matches e mensagens serão apagados para sempre."
    );
    if (!confirmed) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_own_account");

    if (error) {
      setLoading(false);
      alert("Não foi possível excluir a conta: " + error.message);
      return;
    }

    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="destructive"
      className="w-full"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? "Excluindo..." : "Excluir minha conta"}
    </Button>
  );
}
