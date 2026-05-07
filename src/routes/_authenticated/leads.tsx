import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useApp } from "../../lib/app-context";
import { useState, useMemo } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { Canal, EstadoLead } from "../../lib/mock-data";

export const Route = createFileRoute("/_authenticated/leads")({
  component: LeadsPage,
});

function LeadsPage() {
  const { leads } = useApp();
  const [search, setSearch] = useState("");
  const [canalFilter, setCanalFilter] = useState<Canal | "todos">("todos");
  const [estadoFilter, setEstadoFilter] = useState<EstadoLead | "todos">("todos");
  const [page, setPage] = useState(0);
  const perPage = 20;

  const filtered = useMemo(() => {
    return leads.filter(l => {
      if (canalFilter !== "todos" && l.canal !== canalFilter) return false;
      if (estadoFilter !== "todos" && l.estado !== estadoFilter) return false;
      if (search && !l.nome.toLowerCase().includes(search.toLowerCase()) && !l.contacto.includes(search)) return false;
      return true;
    });
  }, [leads, search, canalFilter, estadoFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Leads</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Pesquisar por nome ou contacto..."
            className="w-full rounded-xl bg-secondary pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-primary transition-all" />
        </div>
        <select value={canalFilter} onChange={e => { setCanalFilter(e.target.value as Canal | "todos"); setPage(0); }}
          className="rounded-xl bg-secondary px-3 py-2.5 text-sm text-foreground outline-none ring-1 ring-border focus:ring-primary">
          <option value="todos">Todos os canais</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="telegram">Telegram</option>
          <option value="email">Email</option>
        </select>
        <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value as EstadoLead | "todos"); setPage(0); }}
          className="rounded-xl bg-secondary px-3 py-2.5 text-sm text-foreground outline-none ring-1 ring-border focus:ring-primary">
          <option value="todos">Todos os estados</option>
          <option value="novo">Novo</option>
          <option value="a_conversar">A conversar</option>
          <option value="visita_marcada">Visita marcada</option>
          <option value="escalado">Escalado</option>
          <option value="fechado">Fechado</option>
          <option value="perdido">Perdido</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Nome</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Canal</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Última Mensagem</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Entrada</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(lead => {
                const lastMsg = lead.mensagens[lead.mensagens.length - 1];
                return (
                  <tr key={lead.id} className="border-b border-border/50 hover:bg-secondary/30 transition-all">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold shrink-0">{lead.nome[0]}</div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{lead.nome}</div>
                          <div className="text-xs text-muted-foreground md:hidden">{lead.canal}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <CanalBadge canal={lead.canal} />
                    </td>
                    <td className="px-4 py-3"><EstadoBadge estado={lead.estado} /></td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{lastMsg?.texto.slice(0, 60)}...</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{formatDate(lead.dataEntrada)}</td>
                    <td className="px-4 py-3">
                      <Link to="/leads/$id" params={{ id: lead.id }} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">{filtered.length} leads encontrados</span>
          <div className="flex items-center gap-1">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs text-foreground px-2">{page + 1} / {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
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

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
