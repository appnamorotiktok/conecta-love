// Layout da área autenticada (/app/*): feed, matches, chat, perfil.
// PRÓXIMA ETAPA: navegação inferior (feed / matches / perfil), estilo Tinder.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
