import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { supabase, mapLead, mapImovel, mapMensagem, mapNotificacao, mapTarefa, faseToStatus, type Lead, type Imovel, type Tarefa, type Notificacao, type FaseKanban } from "./supabase";

interface AppState {
  leads: Lead[];
  imoveis: Imovel[];
  tarefas: Tarefa[];
  notificacoes: Notificacao[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AppContextType extends AppState {
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  moveLead: (id: string, fase: FaseKanban) => void;
  addImovel: (imovel: Imovel) => void;
  updateImovel: (id: string, data: Partial<Imovel>) => void;
  removeImovel: (id: string) => void;
  toggleTarefa: (id: string) => void;
  markNotificacaoLida: (id: string) => void;
  markAllNotificacoesLidas: () => void;
  naoLidas: number;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("leadflow_auth") === "true";
    return false;
  });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch leads
      const { data: leadRows, error: leadsErr } = await supabase
        .from("leads")
        .select("*")
        .order("last_activity_at", { ascending: false, nullsFirst: false });

      if (leadsErr) throw leadsErr;

      // 2. Fetch conversations for all leads
      const { data: convRows } = await supabase
        .from("conversations")
        .select("*")
        .order("timestamp", { ascending: true });

      // Group conversations by lead_id
      const convByLead: Record<string, any[]> = {};
      if (convRows) {
        for (const c of convRows) {
          if (!convByLead[c.lead_id]) convByLead[c.lead_id] = [];
          convByLead[c.lead_id].push(c);
        }
      }

      // Build leads with messages
      const mappedLeads = (leadRows || []).map((row) => {
        const mensagens = (convByLead[row.id] || []).map(mapMensagem);
        return mapLead(row, mensagens);
      });
      setLeads(mappedLeads);

      // 3. Fetch properties
      const { data: propRows } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      setImoveis((propRows || []).map(mapImovel));

      // 4. Fetch notifications
      const { data: notifRows } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      setNotificacoes((notifRows || []).map(mapNotificacao));

      // 5. Fetch tasks
      const { data: taskRows } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      const mappedTarefas = (taskRows || []).map((t) => {
        const lead = (leadRows || []).find((l) => l.id === t.lead_id);
        return { ...mapTarefa(t), leadNome: lead?.name || "Desconhecido" };
      });
      setTarefas(mappedTarefas);
    } catch (e: any) {
      console.error("Supabase fetch error:", e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    if (isAuthenticated) fetchAll();
    else setIsLoading(false);
  }, [isAuthenticated, fetchAll]);

  const login = useCallback((user: string, pass: string) => {
    if (user === "rodrigo" && pass === "rodrigo") {
      setIsAuthenticated(true);
      if (typeof window !== "undefined") localStorage.setItem("leadflow_auth", "true");
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") localStorage.removeItem("leadflow_auth");
  }, []);

  const updateLead = useCallback(async (id: string, data: Partial<Lead>) => {
    const updates: any = {};
    if (data.nome !== undefined) updates.name = data.nome;
    if (data.contacto !== undefined) updates.phone = data.contacto;
    if (data.canal !== undefined) updates.channel = data.canal;
    if (data.notas !== undefined) updates.profile_summary = data.notas;
    updates.updated_at = new Date().toISOString();

    await supabase.from("leads").update(updates).eq("id", id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
  }, []);

  const moveLead = useCallback(async (id: string, fase: FaseKanban) => {
    const status = faseToStatus(fase);
    await supabase
      .from("leads")
      .update({ lead_status: status, updated_at: new Date().toISOString() })
      .eq("id", id);

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const estadoMap: Record<string, string> = {
          novo: "novo",
          qualificado: "a_conversar",
          pediu_visita: "visita_marcada",
          encaminhado_rodrigo: "escalado",
          fechado: "fechado",
        };
        return { ...l, fase, estado: estadoMap[status] || "novo" };
      })
    );
  }, []);

  const addImovel = useCallback(async (imovel: Imovel) => {
    const { error } = await supabase.from("properties").insert({
      property_id: imovel.id,
      title: imovel.titulo,
      price: imovel.preco,
      location: imovel.localizacao,
      typology: imovel.tipologia,
      area: imovel.area,
      bedrooms: imovel.quartos,
      bathrooms: imovel.casasBanho,
      description: imovel.descricao,
      images: imovel.imagem,
      status: imovel.ativo ? "Disponivel" : "Reservado",
      assigned_agent: "Rodrigo Cardoso",
    });
    if (error) console.error("Error adding property:", error);
    else setImoveis((prev) => [imovel, ...prev]);
  }, []);

  const updateImovel = useCallback(async (id: string, data: Partial<Imovel>) => {
    const updates: any = {};
    if (data.titulo !== undefined) updates.title = data.titulo;
    if (data.preco !== undefined) updates.price = data.preco;
    if (data.localizacao !== undefined) updates.location = data.localizacao;
    if (data.tipologia !== undefined) updates.typology = data.tipologia;
    if (data.area !== undefined) updates.area = data.area;
    if (data.quartos !== undefined) updates.bedrooms = data.quartos;
    if (data.casasBanho !== undefined) updates.bathrooms = data.casasBanho;
    if (data.descricao !== undefined) updates.description = data.descricao;
    if (data.imagem !== undefined) updates.images = data.imagem;
    if (data.ativo !== undefined) updates.status = data.ativo ? "Disponivel" : "Reservado";

    await supabase.from("properties").update(updates).eq("property_id", id);
    setImoveis((prev) => prev.map((im) => (im.id === id ? { ...im, ...data } : im)));
  }, []);

  const removeImovel = useCallback(async (id: string) => {
    await supabase.from("properties").update({ status: "Vendido" }).eq("property_id", id);
    setImoveis((prev) => prev.filter((im) => im.id !== id));
  }, []);

  const toggleTarefa = useCallback(async (id: string) => {
    const tarefa = tarefas.find((t) => t.id === id);
    if (!tarefa) return;
    const newVal = !tarefa.concluida;
    await supabase.from("tasks").update({ completed: newVal }).eq("id", id);
    setTarefas((prev) => prev.map((t) => (t.id === id ? { ...t, concluida: newVal } : t)));
  }, [tarefas]);

  const markNotificacaoLida = useCallback(async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  }, []);

  const markAllNotificacoesLidas = useCallback(async () => {
    await supabase.from("notifications").update({ read: true }).neq("read", true);
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  }, []);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <AppContext.Provider
      value={{
        leads, imoveis, tarefas, notificacoes, isAuthenticated, isLoading, error,
        login, logout, updateLead, moveLead, addImovel, updateImovel, removeImovel,
        toggleTarefa, markNotificacaoLida, markAllNotificacoesLidas,
        naoLidas, refresh: fetchAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
