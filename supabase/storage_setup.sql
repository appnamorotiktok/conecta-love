-- ============================================================
-- ConectaLove — Bucket de fotos de perfil
-- ============================================================
-- Rode isso no SQL Editor do Supabase depois do schema.sql.
-- Cria o "bucket" (pasta de armazenamento) onde as fotos de
-- perfil ficam guardadas, e as regras de quem pode subir/ver.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

-- bucket publico: qualquer um com o link ve a foto (necessario pro feed)
create policy "profile_photos_public_read"
on storage.objects for select
using (bucket_id = 'profile-photos');

-- so o dono pode subir foto na propria pasta (nome da pasta = seu user id)
create policy "profile_photos_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- so o dono pode apagar a propria foto
create policy "profile_photos_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
