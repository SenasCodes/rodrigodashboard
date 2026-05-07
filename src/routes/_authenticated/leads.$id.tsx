import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useApp } from "../../lib/app-context";
import { ArrowLeft, Copy, ExternalLink, Phone, MessageSquare } from "lucide-react";
import { useState } from "react";
import type { EstadoLead } from "../../lib/mock-data";

export const Route = createFileRoute("/_authenticated/leads/$id")({
  component: LeadDetailPage,
});

function LeadDetailPage() {
  const { id } = Route.useParams();
  const { leads, imoveis, updateLead } = useApp();
  const navigate = useNavigate();
  const lead = leads.find(l => l.id === id);
  const [notas, setNotas] = useState(lead?.notas ?? "");

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground mb-4">Lead não encontrado</p>
        <Link to="/leads" className="text-primary text-sm hover:underline">Voltar aos leads</Link>
      </div>
    );
  }

  const leadImoveis = imoveis.filter(im => lead.imoveisMostrados.includes(im.id));

  const changeEstado = (estado: EstadoLead) => {
    const faseMap: Record<EstadoLead, string> = {
      novo: "novos", a_conversar: "qualificados", visita_marcada: "visita_marcada",
      escalado: "encaminhados", fechado: "fechados", perdido: "fechados",
    };
    updateLead(lead.id, { estado, fase: faseMap[estado] as any });
  };

  const saveNotas = () => updateLead(lead.id, { notas });

  const waLink = lead.canal === "whatsapp" ? `https://wa.me/${lead.contacto.replace(/\+/g, "")}` : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate({ to: "/leads" })} className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">{lead.nome}</h1>
          <p className="text-xs text-muted-foreground">{lead.contacto} · {lead.canal}</p>
        </div>
        <select value={lead.estado} onChange={e => changeEstado(e.target.value as EstadoLead)}
          className="rounded-xl bg-secondary px-3 py-2 text-xs text-foreground outline-none ring-1 ring-border focus:ring-primary">
          <option value="novo">Novo</option>
          <option value="a_conversar">A conversar</option>
          <option value="visita_marcada">Visita marcada</option>
          <option value="escalado">Escalado</option>
          <option value="fechado">Fechado</option>
          <option value="perdido">Perdido</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => changeEstado("escalado")} className="rounded-xl bg-rose/20 text-rose px-3 py-2 text-xs font-medium hover:bg-rose/30 transition-all">Assumir lead</button>
        <button onClick={() => changeEstado("visita_marcada")} className="rounded-xl bg-emerald/20 text-emerald px-3 py-2 text-xs font-medium hover:bg-emerald/30 transition-all">Confirmar visita</button>
        <button onClick={() => changeEstado("fechado")} className="rounded-xl bg-violet/20 text-violet px-3 py-2 text-xs font-medium hover:bg-violet/30 transition-all">Marcar fechado</button>
        <button onClick={() => changeEstado("perdido")} className="rounded-xl bg-muted text-muted-foreground px-3 py-2 text-xs font-medium hover:bg-muted/80 transition-all">Marcar perdido</button>
        <button onClick={() => navigator.clipboard.writeText(lead.contacto)} className="rounded-xl bg-secondary text-foreground px-3 py-2 text-xs font-medium hover:bg-secondary/80 transition-all flex items-center gap-1"><Copy className="w-3 h-3" /> Copiar contacto</button>
        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-emerald/20 text-emerald px-3 py-2 text-xs font-medium hover:bg-emerald/30 transition-all flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Enviar mensagem</a>
        )}
      </div>

      {/* Conversation */}
      <div className="glass-card rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Conversa</h2>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {lead.mensagens.map(msg => (
            <div key={msg.id} className={`flex ${msg.de === "cliente" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.de === "cliente" ? "bg-secondary text-foreground rounded-bl-sm" : "bg-primary/20 text-foreground rounded-br-sm"}`}>
                <p className="text-sm">{msg.texto}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{formatTime(msg.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shown Properties */}
      {leadImoveis.length > 0 && (
        <div className="glass-card rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Imóveis Mostrados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {leadImoveis.map(im => (
              <div key={im.id} className="flex gap-3 rounded-xl bg-secondary/50 p-3">
                <img src={im.imagem} alt={im.titulo} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{im.titulo}</p>
                  <p className="text-xs text-primary font-semibold">{im.preco.toLocaleString("pt-PT")}€</p>
                  <p className="text-xs text-muted-foreground">{im.localizacao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="glass-card rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Notas</h2>
        <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Adicionar observações internas..."
          className="w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-primary min-h-[100px] resize-y" />
        <button onClick={saveNotas} className="mt-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:opacity-90 transition-all">Guardar notas</button>
      </div>
    </div>
  );
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
