import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useApp } from "../lib/app-context";
import { LayoutDashboard, Users, Home, CheckSquare, Settings, Zap, LogOut, Bell, X } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/leads", icon: Users, label: "Leads" },
  { to: "/imoveis", icon: Home, label: "Imóveis" },
  { to: "/tarefas", icon: CheckSquare, label: "Tarefas" },
  { to: "/definicoes", icon: Settings, label: "Definições" },
] as const;

function AuthenticatedLayout() {
  const { isAuthenticated, logout, notificacoes, naoLidas, markNotificacaoLida, markAllNotificacoesLidas } = useApp();
  const navigate = useNavigate();
  const currentPath = useRouterState({ select: s => s.location.pathname });
  const [showNotif, setShowNotif] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const iv = setInterval(() => setLastUpdated(p => p + 30), 30000);
    return () => clearInterval(iv);
  }, []);

  if (!isAuthenticated) return null;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-r border-border transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-56"}`}>
        <div className="p-4 flex items-center gap-2 border-b border-border">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </button>
          {!sidebarCollapsed && <span className="font-bold text-foreground tracking-tight">LeadFlow</span>}
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => (
            <Link key={item.to} to={item.to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive(item.to) ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              <item.icon className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm text-foreground">LeadFlow</span>
          </div>
          <span className="hidden md:block text-sm text-muted-foreground">Olá, <span className="text-foreground font-medium">Rodrigo</span></span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)} className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                <Bell className="w-5 h-5" />
                {naoLidas > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">{naoLidas}</span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 top-11 w-80 max-h-96 overflow-y-auto glass-card rounded-xl shadow-2xl z-50">
                  <div className="flex items-center justify-between p-3 border-b border-border">
                    <span className="text-sm font-semibold text-foreground">Notificações</span>
                    <div className="flex items-center gap-2">
                      {naoLidas > 0 && <button onClick={markAllNotificacoesLidas} className="text-xs text-primary hover:underline">Marcar todas como lidas</button>}
                      <button onClick={() => setShowNotif(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                    </div>
                  </div>
                  {notificacoes.map(n => (
                    <button key={n.id} onClick={() => { markNotificacaoLida(n.id); setShowNotif(false); navigate({ to: "/leads/$id", params: { id: n.leadId } }); }}
                      className={`w-full text-left p-3 border-b border-border/50 hover:bg-secondary/50 transition-all ${!n.lida ? "bg-primary/5" : ""}`}>
                      <p className="text-sm text-foreground">{n.tipo === "lead_quente" ? "🔥" : n.tipo === "visita" ? "📅" : "⚠️"} {n.mensagem}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatTimestamp(n.timestamp)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={logout} className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-secondary transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>

        {lastUpdated > 0 && (
          <div className="hidden md:block fixed bottom-2 right-4 text-xs text-muted-foreground">Atualizado há {lastUpdated}s</div>
        )}
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around h-16 border-t border-border bg-background/90 backdrop-blur-xl">
        {navItems.map(item => (
          <Link key={item.to} to={item.to} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${isActive(item.to) ? "text-primary" : "text-muted-foreground"}`}>
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function formatTimestamp(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)} dias`;
}
