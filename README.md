# ConectaLove — Fase 1

Onboarding (formulário de perfil + upload de fotos) implementado.

Esqueleto do projeto (Next.js + TypeScript + Tailwind + shadcn/ui + Supabase),
schema do banco de dados e login funcionando. As demais telas estão como
placeholder "Em construção", uma etapa por vez, conforme combinado.

## O que já está pronto

- Projeto Next.js (App Router) configurado com TypeScript e Tailwind
- Componentes de UI base (Button, Input, Textarea, Label, Card, Avatar, Badge)
- Cliente Supabase (browser + servidor) e middleware que protege as rotas
  `/app`, `/influencer` e `/admin` (redireciona pra `/login` se não estiver logado)
- Login funcional: Google (OAuth) + email/senha, com cadastro
- Schema completo do banco de dados da Fase 1 em [`supabase/schema.sql`](supabase/schema.sql)
- Estrutura de pastas de todas as telas da Fase 1 (como placeholder, prontas
  para receber a implementação de cada uma)

## O que falta (próximas etapas, uma de cada vez)

1. Onboarding — formulário de criação de perfil + upload de 3-4 fotos
2. Feed de swipe (like/dislike) + matches automáticos
3. Chat em tempo real
4. Seção de recomendações de amigos + link de convite
5. Link de referência do influenciador (`/r/[code]`) + atribuição no cadastro
6. Assinatura Premium via Asaas (Supabase Edge Function, igual ao padrão
   já usado no projeto Régua) + painel do influenciador
7. Fluxo de "somos casal" + autorização de imagem (histórias de sucesso)
8. Admin mínimo (denúncias, usuários, comissões)

## Como colocar no ar

1. **Suba este projeto pro seu GitHub** (do jeito que você já faz).
2. **Crie um projeto no Supabase** (se ainda não tiver um pra este app —
   é diferente do projeto do Régua).
3. No painel do Supabase, vá em **SQL Editor > New query**, cole o conteúdo
   de `supabase/schema.sql` e rode. Isso cria todas as tabelas e as regras
   de segurança (RLS).
4. Em **Authentication > Providers**, habilite **Google** (e configure as
   credenciais OAuth do Google Cloud Console) e confirme que **Email** já
   está habilitado.
5. Em **Authentication > URL Configuration**, adicione a URL do seu site
   (e `http://localhost:3000` se for testar local) na lista de **Redirect URLs**,
   incluindo `/auth/callback` (ex: `https://seusite.vercel.app/auth/callback`).
6. Pegue a **Project URL** e a **anon public key** em
   **Project Settings > API** e configure na Vercel (ou no seu `.env.local`
   se for rodar localmente) usando os nomes de `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (a URL final do site, ex: `https://conectalove.vercel.app`)
7. **Importe o projeto na Vercel** apontando pro seu repositório do GitHub —
   ela detecta Next.js automaticamente e builda sozinha a cada push.

Qualquer dúvida em algum desses passos (tela do Supabase, da Vercel ou do
Google Cloud), me manda um print que eu te guio clique a clique.
