"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Database } from "@/types/database.types";

const CONSENT_VERSION = "v1-2026-07-05";
const CONSENT_TEXT =
  "Autorizo o uso da minha foto e do meu depoimento para divulgação do ConectaLove e de comunidades parceiras (redes sociais, como TikTok e Instagram). Sei que posso revogar essa autorização a qualquer momento, mas isso não remove o que já tiver sido publicado antes da revogação.";

type StoryInsert = Database["public"]["Tables"]["success_stories"]["Insert"];
type ConfirmationInsert =
  Database["public"]["Tables"]["success_story_confirmations"]["Insert"];

export function HistoriaForm({
  matchId,
  userId,
  alreadyConfirmed,
  storyStatus,
}: {
  matchId: string;
  userId: string;
  alreadyConfirmed: boolean;
  storyStatus: "awaiting_confirmation" | "ready_to_publish" | "published" | null;
}) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [testimonial, setTestimonial] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyConfirmed);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!photo) {
      setError("Adicione uma foto.");
      return;
    }
    if (!consent) {
      setError("Você precisa marcar que autoriza o uso da foto e depoimento.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const storyPayload: StoryInsert = { match_id: matchId };
    await supabase
      .from("success_stories")
      .upsert(storyPayload, { onConflict: "match_id", ignoreDuplicates: true });

    const { data: story, error: storyError } = await supabase
      .from("success_stories")
      .select("id")
      .eq("match_id", matchId)
      .single();

    if (storyError || !story) {
      setLoading(false);
      setError(storyError?.message ?? "Não foi possível continuar.");
      return;
    }

    const path = `${userId}/success-story-${crypto.randomUUID()}-${photo.name}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(path, photo);

    if (uploadError) {
      setLoading(false);
      setError(uploadError.message);
      return;
    }

    const confirmationPayload: ConfirmationInsert = {
      success_story_id: story.id,
      profile_id: userId,
      photo_storage_path: path,
      testimonial,
      consent_given: true,
      consent_text_version: CONSENT_VERSION,
      consented_at: new Date().toISOString(),
    };

    const { error: confirmError } = await supabase
      .from("success_story_confirmations")
      .insert(confirmationPayload);

    setLoading(false);

    if (confirmError) {
      setError(confirmError.message);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="mt-8 text-muted-foreground">
        {storyStatus === "ready_to_publish"
          ? "Vocês dois confirmaram! Sua história já está pronta para divulgação."
          : "Recebemos sua confirmação. Assim que a outra pessoa também confirmar, a história fica pronta."}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Essa foto e depoimento podem ser publicados publicamente (TikTok/Instagram).
        Tem certeza?
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="photo">Sua foto</Label>
        <input
          id="photo"
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="testimonial">Seu depoimento</Label>
        <Textarea
          id="testimonial"
          maxLength={500}
          value={testimonial}
          onChange={(e) => setTestimonial(e.target.value)}
          placeholder="Como vocês se conheceram, o que você quer contar..."
        />
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1"
        />
        <span>{CONSENT_TEXT}</span>
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Confirmar"}
      </Button>
    </form>
  );
}
