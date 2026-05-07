import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "../../lib/app-context";
import { UserPlus, MessageCircle, CalendarCheck, AlertTriangle, MessagesSquare, Home, TrendingUp, TrendingDown, Eye, Phone, Copy, X, ArrowLeft, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import type { Lead, FaseKanban } from "../../lib/supabase";

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
  const [filter, setFilter] = useState<string | null>(null);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);

  const leadsHoje = leads.filter(l => {
    const d = new Date(l.dataEntrada);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const leadsAtivos = leads.filter(l => l.estado === "a_conversar");
  const pedidosVisita = leads.filter(l => l.estado === "visita_marcada");
  const escalados = leads.filter(l => l.estado === "escalado");
  const mensagens24h = leads.reduce((acc, l) => {
    const recent = l.mensagens.filter(m => Date.now() - new Date(m.timestamp).getTime() < 86400000);
    return acc + recent.length;
  }, 0);
  const imoveisMostrados = new Set(leads.flatMap(l => l.imoveisMostrados)).size;

  const metricas = [
    { label: "Leads hoje", valor: leadsHoje.length, icon: UserPlus, color: "text-primary", filterKey: "hoje" },
    { label: "Leads ativos", valor: leadsAtivos.length, icon: MessageCircle, color: "text-emerald", filterKey: "ativos" },
    { label: "Pedidos de visita", valor: pedidosVisita.length, icon: CalendarCheck, color: "text-cyan", filterKey: "visita" },
    { label: "Escalados", valor: escalados.length, icon: AlertTriangle, color: "text-amber", filterKey: "escalados" },
    { label: "Mensagens 24h", valor: mensagens24h, icon: MessagesSquare, color: "text-violet", filterKey: null },
    { label: "Imóveis mostrados", valor: imoveisMostrados, icon: Home, color: "text-rose", filterKey: null },
  ];

  const getFilteredLeads = (): Lead[] => {
    switch (filter) {
      case "hoje": return leadsHoje;
      case "ativos": return leadsAtivos;
      case "visita": return pedidosVisita;
      case "escalados": return escalados;
      default: return [];
    }
  };

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
          <div key={m.label}
            onClick={() => m.filterKey && setFilter(m.filterKey)}
            className={`glass-card rounded-2xl p-4 animate-slide-up transition-all ${m.filterKey ? "cursor-pointer hover:scale-[1.03] hover:shadow-lg" : ""}`}
            style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between mb-2">
              <m.icon className={`w-5 h-5 ${m.color}`} />
              <div className={`flex items-center gap-0.5 text-xs text-emerald`}>
                <TrendingUp className="w-3 h-3" />-
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
            <LeadRow key={lead.id} lead={lead} onClick={() => setDetailLead(lead)} />
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
                                onClick={() => setDetailLead(lead)}
                                className="glass-card rounded-xl p-3 cursor-pointer hover:scale-[1.02] transition-transform">
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

      {/* Metric Filter Modal */}
      {filter && (
        <Modal onClose={() => setFilter(null)} title={metricas.find(m => m.filterKey === filter)?.label || ""}>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {getFilteredLeads().length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum lead nesta categoria.</p>
            ) : getFilteredLeads().map(lead => (
              <div key={lead.id} onClick={() => { setDetailLead(lead); setFilter(null); }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-all cursor-pointer">
                <LeadAvatar nome={lead.nome} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{lead.nome}</span>
                    <CanalBadge canal={lead.canal} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{lead.contacto}</p>
                </div>
                <EstadoBadge estado={lead.estado} />
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Lead Detail Modal */}
      {detailLead && (
        <LeadDetailModal lead={detailLead} onClose={() => setDetailLead(null)} />
      )}
    </div>
  );
}

// ─── Lead Detail Modal ───
function LeadDetailModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const last20 = lead.mensagens.slice(-20);

  return (
    <Modal onClose={onClose} title={lead.nome}>
      <div className="space-y-4">
        {/* Lead Info */}
        <div className="flex items-center gap-3 flex-wrap">
          <LeadAvatar nome={lead.nome} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{lead.nome}</span>
              <CanalBadge canal={lead.canal} />
            </div>
            <p className="text-xs text-muted-foreground">{lead.contacto}</p>
          </div>
          <div className="ml-auto">
            <EstadoBadge estado={lead.estado} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-secondary/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{lead.mensagens.length}</p>
            <p className="text-[10px] text-muted-foreground">Mensagens</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{lead.imoveisMostrados.length}</p>
            <p className="text-[10px] text-muted-foreground">Imóveis vistos</p>
          </div>
        </div>

        {/* Last 20 Messages */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Últimas mensagens</h3>
          <div className="space-y-2 max-h-[40vh] overflow-y-auto">
            {last20.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sem mensagens.</p>
            ) : last20.map((msg, i) => (
              <div key={i} className={`flex ${msg.de === "cliente" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${msg.de === "cliente" ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"}`}>
                  <p className="text-xs">{msg.texto}</p>
                  <p className="text-[9px] opacity-60 mt-1">{new Date(msg.timestamp).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notas / Profile Summary */}
        {lead.notas && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Perfil</h3>
            <p className="text-xs text-muted-foreground bg-secondary/30 rounded-xl p-2">{lead.notas}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Reusable Modal ───
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card rounded-2xl p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── LeadRow ───
function LeadRow({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const lastMsg = lead.mensagens[lead.mensagens.length - 1];
  const lastAgentMsg = [...lead.mensagens].reverse().find(m => m.de === "agente");

  return (
    <div onClick={onClick} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-all group cursor-pointer">
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
      <div className="hidden md:flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary"><Eye className="w-3.5 h-3.5" /></button>
        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(lead.contacto); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary"><Copy className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

// ─── Shared components ───
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
