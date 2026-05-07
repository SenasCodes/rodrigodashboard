import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "../../lib/app-context";
import { UserPlus, MessageCircle, CalendarCheck, AlertTriangle, MessagesSquare, Home, TrendingUp, TrendingDown, Eye, Phone, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import type { Lead, FaseKanban } from "../../lib/mock-data";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const duration = 800;
      const startTime = Date.now();
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(start + (value - start) * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      tick();
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return <span>{display}</span>;
}

function DashboardPage() {
  const { leads, imoveis, moveLead } = useApp();

  const leadsHoje = leads.filter(l => {
    const d = new Date(l.dataEntrada);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;
  const leadsAtivos = leads.filter(l => l.estado === "a_conversar").length;
  const pedidosVisita = leads.filter(l => l.estado === "visita_marcada").length;
  const escalados = leads.filter(l => l.estado === "escalado").length;
  const mensagens24h = leads.reduce((acc, l) => {
    const recent = l.mensagens.filter(m => Date.now() - new Date(m.timestamp).getTime() < 86400000);
    return acc + recent.length;
  }, 0);
  const imoveisMostrados = new Set(leads.flatMap(l => l.imoveisMostrados)).size;

  const metricas = [
    { label: "Leads hoje", valor: leadsHoje, icon: UserPlus, trend: 12, color: "text-primary" },
    { label: "Leads ativos", valor: leadsAtivos, icon: MessageCircle, trend: 8, color: "text-emerald" },
    { label: "Pedidos de visita", valor: pedidosVisita, icon: CalendarCheck, trend: -5, color: "text-cyan" },
    { label: "Escalados", valor: escalados, icon: AlertTriangle, trend: 15, color: "text-amber" },
    { label: "Mensagens 24h", valor: mensagens24h, icon: MessagesSquare, trend: 22, color: "text-violet" },
    { label: "Imóveis mostrados", valor: imoveisMostrados, icon: Home, trend: 3, color: "text-rose" },
  ];

  const recentLeads = [...leads].sort((a, b) => new Date(b.dataEntrada).getTime() - new Date(a.dataEntrada).getTime()).slice(0, 10);

  const fases: { key: FaseKanban; label: string; color: string }[] = [
    { key: "novos", label: "Novos", color: "bg-primary/20 text-primary" },
    { key: "qualificados", label: "Qualificados", color: "bg-amber/20 text-amber" },
    { key: "visita_marcada", label: "Visita Marcada", color: "bg-emerald/20 text-emerald" },
    { key: "encaminhados", label: "Encaminhados", color: "bg-rose/20 text-rose" },
    { key: "fechados", label: "Fechados / Perdidos", color: "bg-violet/20 text-violet" },
  ];

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const fase = result.destination.droppableId as FaseKanban;
    moveLead(result.draggableId, fase);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">Dashboard</h1>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricas.map((m, i) => (
          <div key={m.label} className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between mb-2">
              <m.icon className={`w-5 h-5 ${m.color}`} />
              <div className={`flex items-center gap-0.5 text-xs ${m.trend >= 0 ? "text-emerald" : "text-rose"}`}>
                {m.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(m.trend)}%
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground"><AnimatedNumber value={m.valor} delay={i * 100} /></div>
            <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Leads */}
      <div className="glass-card rounded-2xl p-4 md:p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Leads Recentes</h2>
        <div className="space-y-2">
          {recentLeads.map(lead => (
            <LeadRow key={lead.id} lead={lead} />
          ))}
        </div>
      </div>

      {/* Kanban Pipeline */}
      <div className="glass-card rounded-2xl p-4 md:p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Pipeline</h2>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {fases.map(fase => {
              const faseLeads = leads.filter(l => l.fase === fase.key);
              return (
                <Droppable key={fase.key} droppableId={fase.key}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="min-w-[220px] flex-shrink-0">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${fase.color}`}>{fase.label}</span>
                        <span className="text-xs text-muted-foreground">{faseLeads.length}</span>
                      </div>
                      <div className="space-y-2 min-h-[100px]">
                        {faseLeads.map((lead, index) => (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                className="glass-card rounded-xl p-3 cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform">
                                <div className="flex items-center gap-2 mb-1">
                                  <LeadAvatar nome={lead.nome} size="sm" />
                                  <span className="text-sm font-medium text-foreground truncate">{lead.nome}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <CanalBadge canal={lead.canal} />
                                  <span className="text-[10px] text-muted-foreground">{formatTimestamp(lead.dataEntrada)}</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  const lastMsg = lead.mensagens[lead.mensagens.length - 1];
  const lastAgentMsg = [...lead.mensagens].reverse().find(m => m.de === "agente");

  return (
    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-all group">
      <LeadAvatar nome={lead.nome} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{lead.nome}</span>
          <CanalBadge canal={lead.canal} />
        </div>
        <p className="text-xs text-muted-foreground truncate">{lastMsg?.texto.slice(0, 60)}{(lastMsg?.texto.length ?? 0) > 60 ? "..." : ""}</p>
        {lastAgentMsg && <p className="text-xs text-primary/70 truncate mt-0.5">↳ {lastAgentMsg.texto.slice(0, 50)}...</p>}
      </div>
      <EstadoBadge estado={lead.estado} />
      <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary"><Eye className="w-3.5 h-3.5" /></button>
        <button onClick={() => navigator.clipboard.writeText(lead.contacto)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary"><Copy className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

function LeadAvatar({ nome, size = "md" }: { nome: string; size?: "sm" | "md" }) {
  const colors = ["bg-primary", "bg-emerald", "bg-violet", "bg-amber", "bg-rose", "bg-cyan"];
  const idx = nome.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  const s = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return <div className={`${s} rounded-full ${colors[idx]} flex items-center justify-center text-white font-semibold shrink-0`}>{nome[0]}</div>;
}

function CanalBadge({ canal }: { canal: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    whatsapp: { label: "WhatsApp", cls: "bg-emerald/20 text-emerald" },
    telegram: { label: "Telegram", cls: "bg-primary/20 text-primary" },
    email: { label: "Email", cls: "bg-muted text-muted-foreground" },
  };
  const c = config[canal] || config.email;
  return <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${c.cls}`}>{c.label}</span>;
}

function EstadoBadge({ estado }: { estado: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    novo: { label: "Novo", cls: "bg-primary/20 text-primary" },
    a_conversar: { label: "A conversar", cls: "bg-amber/20 text-amber" },
    visita_marcada: { label: "Visita", cls: "bg-emerald/20 text-emerald" },
    escalado: { label: "Escalado", cls: "bg-rose/20 text-rose" },
    fechado: { label: "Fechado", cls: "bg-violet/20 text-violet" },
    perdido: { label: "Perdido", cls: "bg-muted text-muted-foreground" },
  };
  const c = config[estado] || config.novo;
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.cls} whitespace-nowrap`}>{c.label}</span>;
}

function formatTimestamp(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
