"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Database } from "@/types/database.types";

type RecommendationInsert = Database["public"]["Tables"]["recommendations"]["Insert"];

export function RecommendForm({ profileId }: { profileId: string }) {
  const [name, setName] = useState("");
  const [years, setYears] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const payload: RecommendationInsert = {
      profile_id: profileId,
      recommender_name: name,
      friendship_years: years ? Number(years) : null,
      message,
    };

    const { error } = await supabase.from("recommendations").insert(payload);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="mt-8 text-center text-muted-foreground">
        Obrigado! Sua recomendação foi enviada e está aguardando aprovação.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Seu nome</Label>
        <Input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="years">Há quantos anos vocês se conhecem?</Label>
        <Input
          id="years"
          type="number"
          min={0}
          value={years}
          onChange={(e) => setYears(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Sua recomendação</Label>
        <Textarea
          id="message"
          required
          maxLength={500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar recomendação"}
      </Button>
    </form>
  );
}
