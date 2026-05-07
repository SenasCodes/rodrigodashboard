import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { leadsMock, imoveisMock, tarefasMock, notificacoesMock, type Lead, type Imovel, type Tarefa, type Notificacao, type FaseKanban, type EstadoLead } from "./mock-data";

interface AppState {
  leads: Lead[];
  imoveis: Imovel[];
  tarefas: Tarefa[];
  notificacoes: Notificacao[];
  isAuthenticated: boolean;
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
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("leadflow_auth") === "true";
    }
    return false;
  });
  const [leads, setLeads] = useState<Lead[]>(leadsMock);
  const [imoveis, setImoveis] = useState<Imovel[]>(imoveisMock);
  const [tarefas, setTarefas] = useState<Tarefa[]>(tarefasMock);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(notificacoesMock);

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

  const updateLead = useCallback((id: string, data: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  }, []);

  const moveLead = useCallback((id: string, fase: FaseKanban) => {
    const faseToEstado: Record<FaseKanban, EstadoLead> = {
      novos: "novo", qualificados: "a_conversar", visita_marcada: "visita_marcada",
      encaminhados: "escalado", fechados: "fechado",
    };
    setLeads(prev => prev.map(l => l.id === id ? { ...l, fase, estado: faseToEstado[fase] } : l));
  }, []);

  const addImovel = useCallback((imovel: Imovel) => {
    setImoveis(prev => [imovel, ...prev]);
  }, []);

  const updateImovel = useCallback((id: string, data: Partial<Imovel>) => {
    setImoveis(prev => prev.map(im => im.id === id ? { ...im, ...data } : im));
  }, []);

  const removeImovel = useCallback((id: string) => {
    setImoveis(prev => prev.filter(im => im.id !== id));
  }, []);

  const toggleTarefa = useCallback((id: string) => {
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, concluida: !t.concluida } : t));
  }, []);

  const markNotificacaoLida = useCallback((id: string) => {
    setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  }, []);

  const markAllNotificacoesLidas = useCallback(() => {
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  }, []);

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <AppContext.Provider value={{
      leads, imoveis, tarefas, notificacoes, isAuthenticated, naoLidas,
      login, logout, updateLead, moveLead, addImovel, updateImovel, removeImovel,
      toggleTarefa, markNotificacaoLida, markAllNotificacoesLidas,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
