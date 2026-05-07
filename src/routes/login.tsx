import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "../lib/app-context";
import { Zap } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  if (isAuthenticated) {
    navigate({ to: "/" });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(user, pass);
    if (ok) {
      navigate({ to: "/" });
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, oklch(0.10 0.03 270), oklch(0.15 0.04 250), oklch(0.10 0.02 290))" }}>
      <div className={`w-full max-w-sm ${shaking ? "animate-shake" : ""}`}>
        <div className="glass-card rounded-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">LeadFlow</h1>
            </div>
            <p className="text-sm text-muted-foreground">Gestão inteligente de leads imobiliários</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Utilizador"
                value={user}
                onChange={e => { setUser(e.target.value); setError(false); }}
                className="w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-primary transition-all"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Palavra-passe"
                value={pass}
                onChange={e => { setPass(e.target.value); setError(false); }}
                className="w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-primary transition-all"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">Credenciais inválidas. Tenta novamente.</p>
            )}
            <button
              type="submit"
              className="w-full rounded-xl py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, oklch(0.62 0.19 250), oklch(0.55 0.2 270))" }}
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
