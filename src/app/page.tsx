import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 text-sm font-medium text-primary">ConectaLove</span>
      <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
        Conexões reais, apresentadas por quem te conhece.
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Menos swipe infinito, mais confiança. Faça parte de uma comunidade e
        conheça pessoas com quem você tem tudo a ver.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild size="lg">
          <Link href="/login">Entrar</Link>
        </Button>
      </div>
    </main>
  );
}
