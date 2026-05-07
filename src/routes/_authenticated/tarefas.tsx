import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "../../lib/app-context";
import { useState } from "react";
import { CheckSquare, Square, Clock, CheckCircle2, ListFilter } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tarefas")({
  component: TarefasPage,
});

function TarefasPage() {
  const { tarefas, toggleTarefa } = useApp();
  const [filter, setFilter] = useState<"todas" | "pendentes" | "concluidas">("pendentes");

  const filtered = tarefas.filter(t => {
    if (filter === "pendentes") return !t.concluida;
    if (filter === "concluidas") return t.concluida;
    return true;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Tarefas</h1>

      <div className="flex gap-2">
        {(["pendentes", "concluidas", "todas"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {f === "pendentes" ? "Pendentes" : f === "concluidas" ? "Concluídas" : "Todas"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {filter === "pendentes" ? "Sem tarefas pendentes 🎉" : "Sem tarefas nesta categoria"}
          </div>
        )}
        {filtered.map((tarefa, i) => (
          <div key={tarefa.id} className="glass-card rounded-xl p-4 flex items-start gap-3 animate-slide-up hover:scale-[1.01] transition-transform" style={{ animationDelay: `${i * 50}ms` }}>
            <button onClick={() => toggleTarefa(tarefa.id)} className="mt-0.5 shrink-0">
              {tarefa.concluida
                ? <CheckCircle2 className="w-5 h-5 text-emerald" />
                : <Square className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${tarefa.concluida ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {tarefa.descricao}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Link to="/leads/$id" params={{ id: tarefa.leadId }} className="text-xs text-primary hover:underline">{tarefa.leadNome}</Link>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(tarefa.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)} dias`;
}
