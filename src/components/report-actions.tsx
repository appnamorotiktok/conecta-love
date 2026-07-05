"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function ReportActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: "reviewed" | "dismissed") {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("reports").update({ status }).eq("id", id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-2 flex gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={loading}
        onClick={() => updateStatus("dismissed")}
      >
        Descartar
      </Button>
      <Button size="sm" disabled={loading} onClick={() => updateStatus("reviewed")}>
        Marcar como revisada
      </Button>
    </div>
  );
}
