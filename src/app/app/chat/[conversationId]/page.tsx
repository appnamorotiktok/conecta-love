// PRÓXIMA ETAPA (Fase 1): mensagens em tempo real via Supabase Realtime na
// tabela `messages`, respeitando RLS (só participantes do match veem/enviam).
export default function ChatPage({
  params,
}: {
  params: { conversationId: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">Conversa</h1>
        <p className="mt-2 text-muted-foreground">
          Em construção — próxima etapa do desenvolvimento.
        </p>
      </div>
    </main>
  );
}
