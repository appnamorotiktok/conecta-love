"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Database } from "@/types/database.types";

type ReportInsert = Database["public"]["Tables"]["reports"]["Insert"];

const selectClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const REASONS = [
  "Assédio ou comportamento abusivo",
  "Perfil falso",
  "Spam ou golpe",
  "Conteúdo inadequado",
  "Outro",
];

export function ReportForm({ reportedId }: { reportedId: string }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!reason) {
      setError("Selecione um motivo.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const payload: ReportInsert = {
      reporter_id: user.id,
      reported_id: reportedId,
      reason,
      details: details || null,
    };

    const { error } = await supabase.from("reports").insert(payload);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="mt-8 text-muted-foreground">
        Denúncia enviada. Nossa equipe vai analisar o quanto antes.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reason">Motivo</Label>
        <select
          id="reason"
          required
          className={selectClass}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="" disabled>
            Selecione
          </option>
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="details">Detalhes (opcional)</Label>
        <Textarea
          id="details"
          maxLength={1000}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar denúncia"}
      </Button>
    </form>
  );
}
