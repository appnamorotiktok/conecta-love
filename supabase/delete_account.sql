-- ============================================================
-- ConectaLove — Excluir a propria conta
-- ============================================================
-- Rode isso no SQL Editor do Supabase.
--
-- Cria uma funcao que o proprio usuario pode chamar pra apagar a
-- conta dele (nunca a de outra pessoa — ela so mexe em auth.uid()).
-- E "security definer" porque apagar de auth.users exige privilegio
-- que o usuario comum nao tem, mas a logica dentro da funcao garante
-- que so apaga o proprio registro.
--
-- Todo o resto (perfil, fotos, recomendacoes, likes, matches,
-- conversas, mensagens, denuncias, historias de sucesso etc.) some
-- sozinho, porque todas as tabelas ja foram criadas com
-- "on delete cascade" ligadas em auth.users/profiles.
-- ============================================================

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
