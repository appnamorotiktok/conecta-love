"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const MAX_PHOTOS = 4;
const selectClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function maxBirthDateFor18YearsOld() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split("T")[0];
}

export function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [orientation, setOrientation] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [city, setCity] = useState("");
  const [profession, setProfession] = useState("");
  const [bio, setBio] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPhotos((prev) => [...prev, ...files].slice(0, MAX_PHOTOS));
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (photos.length === 0) {
      setError("Adicione pelo menos 1 foto.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: fullName,
      birth_date: birthDate,
      gender: gender as "masculino" | "feminino" | "outro",
      orientation,
      looking_for: lookingFor,
      city,
      profession: profession || null,
      bio: bio || null,
    });

    if (profileError) {
      setLoading(false);
      setError(profileError.message);
      return;
    }

    for (let i = 0; i < photos.length; i++) {
      const file = photos[i];
      const path = `${userId}/${crypto.randomUUID()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(path, file);

      if (uploadError) {
        setLoading(false);
        setError(uploadError.message);
        return;
      }

      const { error: photoRowError } = await supabase
        .from("profile_photos")
        .insert({
          profile_id: userId,
          storage_path: path,
          position: i + 1,
          is_primary: i === 0,
        });

      if (photoRowError) {
        setLoading(false);
        setError(photoRowError.message);
        return;
      }
    }

    router.push("/app/feed");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input
          id="fullName"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="birthDate">Data de nascimento</Label>
        <Input
          id="birthDate"
          type="date"
          required
          max={maxBirthDateFor18YearsOld()}
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="gender">Sexo</Label>
        <select
          id="gender"
          required
          className={selectClass}
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="" disabled>
            Selecione
          </option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="outro">Outro</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="orientation">Orientação</Label>
        <select
          id="orientation"
          required
          className={selectClass}
          value={orientation}
          onChange={(e) => setOrientation(e.target.value)}
        >
          <option value="" disabled>
            Selecione
          </option>
          <option value="Heterossexual">Heterossexual</option>
          <option value="Homossexual">Homossexual</option>
          <option value="Bissexual">Bissexual</option>
          <option value="Outro">Outro</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lookingFor">O que você busca</Label>
        <select
          id="lookingFor"
          required
          className={selectClass}
          value={lookingFor}
          onChange={(e) => setLookingFor(e.target.value)}
        >
          <option value="" disabled>
            Selecione
          </option>
          <option value="Relacionamento sério">Relacionamento sério</option>
          <option value="Conhecer pessoas">Conhecer pessoas</option>
          <option value="Ainda não sei">Ainda não sei</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="city">Cidade</Label>
        <Input
          id="city"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profession">Profissão</Label>
        <Input
          id="profession"
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          maxLength={500}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Fotos (1 a {MAX_PHOTOS} — escolha as que mostram melhor quem você é)</Label>
        <div className="grid grid-cols-4 gap-2">
          {photos.map((file, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-lg border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-2xl text-muted-foreground">
              +
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Concluir perfil"}
      </Button>
    </form>
  );
}
