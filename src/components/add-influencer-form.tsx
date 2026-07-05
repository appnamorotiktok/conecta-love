"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/types/database.types";

type InfluencerInsert = Database["public"]["Tables"]["influencers"]["Insert"];

export function AddInfluencerForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [rate, setRate] = useState("20");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const payload: InfluencerInsert = {
      name,
      referral_code: code.trim().toLowerCase().replace(/\s+/g, "-"),
      commission_rate: Number(rate) / 100,
    };

    const { error } = await supabase.from("influencers").insert(payload);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setName("");
    setCode("");
    setRate("20");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 flex flex-col gap-3 rounded-lg border border-border p-3"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="inf-name">Nome do influenciador</Label>
        <Input
          id="inf-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="inf-code">Código do link (ex: maria)</Label>
        <Input
          id="inf-code"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="inf-rate">Comissão (%)</Label>
        <Input
          id="inf-rate"
          type="number"
          min={0}
          max={100}
          required
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Adicionando..." : "Adicionar influenciador"}
      </Button>
    </form>
  );
}
