import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/_authenticated/definicoes")({
  component: DefinicoesPage,
});

function DefinicoesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Definições</h1>
      <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <Settings className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-sm font-semibold text-foreground mb-1">Em breve</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          Aqui poderás configurar as preferências da tua conta, mensagens automáticas, integrações com WhatsApp e Telegram, e muito mais.
        </p>
      </div>
    </div>
  );
}
