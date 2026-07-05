"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Database } from "@/types/database.types";

export type Candidate = {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string | null;
  profession: string | null;
  photoUrl: string | null;
};

type LikeInsert = Database["public"]["Tables"]["likes"]["Insert"];

export function FeedClient({ candidates }: { candidates: Candidate[] }) {
  const [index, setIndex] = useState(0);
  const [matchedWith, setMatchedWith] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);

  const current = candidates[index];

  async function handleLike() {
    if (!current || loading) return;
    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const likePayload: LikeInsert = {
      liker_id: user.id,
      liked_id: current.id,
    };

    await supabase.from("likes").insert(likePayload);

    const [a, b] = [user.id, current.id].sort();
    const { data: match } = await supabase
      .from("matches")
      .select("id")
      .eq("user_a", a)
      .eq("user_b", b)
      .maybeSingle();

    setLoading(false);

    if (match) {
      setMatchedWith(current);
    } else {
      setIndex((i) => i + 1);
    }
  }

  function handleSkip() {
    setIndex((i) => i + 1);
  }

  function closeMatchModal() {
    setMatchedWith(null);
    setIndex((i) => i + 1);
  }

  if (matchedWith) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold text-primary">Deu match! 🎉</h2>
        <p className="text-muted-foreground">
          Você e {matchedWith.name} curtiram um ao outro.
        </p>
        <Button onClick={closeMatchModal}>Continuar</Button>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex flex-1 items-center justify-center text-center text-muted-foreground">
        Não há mais perfis por enquanto. Volte mais tarde!
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="aspect-[3/4] w-full bg-muted">
          {current.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.photoUrl}
              alt={current.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Sem foto
            </div>
          )}
        </div>
        <CardContent className="flex flex-col gap-1 pt-4">
          <h2 className="text-xl font-bold">
            {current.name}, {current.age}
          </h2>
          <p className="text-sm text-muted-foreground">
            {current.city}
            {current.profession ? ` · ${current.profession}` : ""}
          </p>
          {current.bio && <p className="mt-2 text-sm">{current.bio}</p>}
        </CardContent>
      </Card>

      <div className="flex gap-3 pb-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleSkip}
          disabled={loading}
        >
          ✕ Passar
        </Button>
        <Button className="flex-1" onClick={handleLike} disabled={loading}>
          ❤ Curtir
        </Button>
      </div>
    </div>
  );
}
