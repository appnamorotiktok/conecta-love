import { AppNav } from "@/components/app-nav";

// Layout compartilhado das telas com menu inferior (Descobrir / Matches / Perfil).
// O chat fica fora desse grupo de propósito, para o menu não cobrir o campo de mensagem.
export default function MainTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-16">
      {children}
      <AppNav />
    </div>
  );
}
