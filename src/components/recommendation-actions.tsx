"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function RecommendationActions({
  id,
  name,
  years,
  message,
}: {
  id: string;
  name: string;
  years: number | null;
  message: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: "approved" | "rejected") {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("recommendations")
      .update({
        status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-sm font-medium">
          {name}
          {years ? ` · amigos há ${years} anos` : ""}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        <div className="mt-2 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => updateStatus("rejected")}
          >
            Rejeitar
          </Button>
          <Button size="sm" disabled={loading} onClick={() => updateStatus("approved")}>
            Aprovar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
