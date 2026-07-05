-- ============================================================
-- ConectaLove — Correcao do Medio 7 da auditoria de seguranca
-- ============================================================
-- Rode isso no SQL Editor do Supabase.
--
-- Problema: o bucket "profile-photos" nao tinha nenhum limite de
-- tipo de arquivo ou tamanho configurado no proprio Storage — a
-- validacao existia só no navegador (accept="image/*"), fácil de
-- contornar enviando a requisicao direto pra API.
--
-- Correcao: configura o bucket pra recusar, no proprio servidor,
-- qualquer arquivo que nao seja imagem (jpeg/png/webp/heic) ou que
-- passe de 8MB. Isso vale pra fotos de perfil e de historia de
-- sucesso, que usam o mesmo bucket.
-- ============================================================

update storage.buckets
set
  file_size_limit = 8388608, -- 8 MB
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
where id = 'profile-photos';
