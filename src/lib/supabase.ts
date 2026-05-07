import { supabase } from "@/integrations/supabase/client";

export { supabase };

// ─── Types matching the dashboard mock types ───
export type Canal = "whatsapp" | "telegram" | "email";
export type EstadoLead = "novo" | "a_conversar" | "visita_marcada" | "escalado" | "fechado" | "perdido";

export interface Mensagem {
  id: string;
  de: "cliente" | "agente";
  texto: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  nome: string;
  contacto: string;
  canal: Canal;
  estado: string;
  fase: string;
  mensagens: Mensagem[];
  imoveisMostrados: string[];
  dataEntrada: string;
  notas: string;
}

export interface Imovel {
  id: string;
  titulo: string;
  preco: number;
  localizacao: string;
  tipologia: string;
  area: number;
  quartos: number;
  casasBanho: number;
  descricao: string;
  imagem: string;
  ativo: boolean;
  vezesMostrado: number;
  listing_url?: string;
}

export interface Tarefa {
  id: string;
  leadId: string;
  leadNome: string;
  descricao: string;
  concluida: boolean;
  timestamp: string;
}

export interface Notificacao {
  id: string;
  tipo: "lead_quente" | "visita" | "escalado";
  mensagem: string;
  leadId: string;
  timestamp: string;
  lida: boolean;
}

export type FaseKanban = "novos" | "qualificados" | "visita_marcada" | "encaminhados" | "fechados";

// ─── Map Supabase lead_status to dashboard estado ───
const statusToEstado: Record<string, string> = {
  novo: "novo",
  qualificado: "a_conversar",
  pediu_visita: "visita_marcada",
  encaminhado_rodrigo: "escalado",
  fechado: "fechado",
  em_espera: "a_conversar",
};

const statusToFase: Record<string, FaseKanban> = {
  novo: "novos",
  qualificado: "qualificados",
  pediu_visita: "visita_marcada",
  encaminhado_rodrigo: "encaminhados",
  fechado: "fechados",
  em_espera: "qualificados",
};

// ─── Lead helpers ───
export function mapLead(row: any, mensagens: Mensagem[] = []): Lead {
  const contacto = row.phone || row.email || row.telegram_chat_id || "";
  return {
    id: row.id,
    nome: row.name || "Sem nome",
    contacto,
    canal: (row.channel || "whatsapp") as Canal,
    estado: statusToEstado[row.lead_status] || "novo",
    fase: statusToFase[row.lead_status] || "novos",
    mensagens,
    imoveisMostrados: [],
    dataEntrada: row.created_at || new Date().toISOString(),
    notas: row.profile_summary || "",
  };
}

export function mapImovel(row: any): Imovel {
  return {
    id: row.property_id || row.id,
    titulo: row.title || "Sem título",
    preco: row.price || 0,
    localizacao: row.location || "",
    tipologia: row.typology || "T2",
    area: row.area || 0,
    quartos: row.bedrooms || 0,
    casasBanho: row.bathrooms || 0,
    descricao: row.description || "",
    imagem: row.images || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
    ativo: row.status === "Disponivel" || row.status === "Disponivel - Arrendar",
    vezesMostrado: 0,
    listing_url: row.listing_url || "",
  };
}

export function mapMensagem(row: any): Mensagem {
  return {
    id: String(row.id || Math.random()),
    de: row.role === "assistant" ? "agente" : "cliente",
    texto: row.content || "",
    timestamp: row.timestamp || new Date().toISOString(),
  };
}

export function mapNotificacao(row: any): Notificacao {
  return {
    id: row.id,
    tipo: (row.type || "lead_quente") as "lead_quente" | "visita" | "escalado",
    mensagem: row.message || "",
    leadId: row.lead_id || "",
    timestamp: row.created_at || new Date().toISOString(),
    lida: row.read || false,
  };
}

export function mapTarefa(row: any): Tarefa {
  return {
    id: row.id,
    leadId: row.lead_id || "",
    leadNome: row.lead_name || "",
    descricao: row.description || "",
    concluida: row.completed || false,
    timestamp: row.created_at || new Date().toISOString(),
  };
}

/** Convert dashboard estado back to Supabase lead_status */
export function estadoToStatus(estado: string): string {
  const map: Record<string, string> = {
    novo: "novo",
    a_conversar: "qualificado",
    visita_marcada: "pediu_visita",
    escalado: "encaminhado_rodrigo",
    fechado: "fechado",
    perdido: "fechado",
  };
  return map[estado] || "novo";
}

/** Convert dashboard fase to lead_status */
export function faseToStatus(fase: FaseKanban): string {
  const map: Record<FaseKanban, string> = {
    novos: "novo",
    qualificados: "qualificado",
    visita_marcada: "pediu_visita",
    encaminhados: "encaminhado_rodrigo",
    fechados: "fechado",
  };
  return map[fase] || "novo";
}
