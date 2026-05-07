
# LeadFlow — Dashboard de Gestão de Leads Imobiliários

## Visão Geral

App completa em React com dark theme sofisticado, mobile-first, para o Rodrigo gerir leads imobiliários. Toda a interface em português de Portugal, com dados mock realistas. Sem backend — tudo local com localStorage.

---

## Design System

- **Fundo principal**: `#0F1117`, cards `#1A1D2E`, bordas subtis
- **Acento principal**: azul elétrico `#3B82F6`
- **Acento secundário**: verde-esmeralda `#10B981` e violeta `#8B5CF6`
- **Font**: DM Sans (Google Fonts)
- **Glassmorphism** subtil nos cards, border-radius 12-16px
- **Animações**: fade-in staggered, contadores animados, hover scale(1.02)
- Tokens definidos em `src/styles.css` com oklch

---

## Estrutura de Rotas

| Rota | Ficheiro | Descrição |
|---|---|---|
| `/login` | `login.tsx` | Autenticação (hardcoded rodrigo/rodrigo) |
| `/` | `_authenticated/index.tsx` | Dashboard com métricas, leads recentes, pipeline kanban |
| `/leads` | `_authenticated/leads.tsx` | Lista completa com filtros e paginação |
| `/leads/$id` | `_authenticated/leads.$id.tsx` | Detalhe do lead (drawer/página) |
| `/imoveis` | `_authenticated/imoveis.tsx` | Gestão de imóveis (CRUD) |
| `/tarefas` | `_authenticated/tarefas.tsx` | Lista de tarefas pendentes |
| `/definicoes` | `_authenticated/definicoes.tsx` | Placeholder de definições |

Layout `_authenticated.tsx` protege rotas, renderiza header + sidebar/bottom nav.

---

## Autenticação

- Login simples com credenciais fixas `rodrigo` / `rodrigo`
- Estado guardado em localStorage
- Shake animation no erro
- Layout protegido redireciona para `/login` se não autenticado
- Botão logout no header

---

## Dados Mock

Ficheiro `src/lib/mock-data.ts` com:
- **20 leads** com nomes portugueses, canais (WhatsApp/Telegram/Email), estados, conversas (3-8 mensagens cada)
- **10 imóveis** em Lisboa, Almada, Cascais, Sintra (150k-650k€, T1-T4)
- **8 tarefas** pendentes ligadas a leads
- **5 notificações** recentes
- **Métricas** calculadas a partir dos dados

---

## Componentes Principais

### Header
- Logo "LeadFlow", saudação "Olá, Rodrigo"
- Badge de notificações com dropdown
- Botão logout

### Sidebar (desktop) / Bottom Nav (mobile)
- 5 itens: Dashboard, Leads, Imóveis, Tarefas, Definições
- Sidebar colapsável no desktop
- Bottom bar fixa no mobile

### Dashboard
- 6 cards de métricas com contagem animada e tendências
- Lista dos 10 leads mais recentes com avatares, badges de canal/estado
- Pipeline Kanban horizontal (5 colunas) com drag & drop via `@hello-pangea/dnd`

### Leads
- Tabela paginada (20/página) com filtros por canal, estado, pesquisa
- Detalhe em drawer lateral: timeline de chat, imóveis mostrados, ações, notas

### Imóveis
- Grid de cards com imagem, preço, detalhes, badges ativo/inativo
- Modal de adicionar com campo URL + "Buscar Informações" (simulado)
- Editar e remover com confirmação

### Tarefas
- Lista com checkbox, filtro pendentes/concluídas/todas
- Geradas a partir dos leads

### Exportação
- Botão exportar em Dashboard e Leads
- Excel via `xlsx`, PDF via `jsPDF`

---

## Dependências a Instalar

- `@hello-pangea/dnd` — drag & drop para kanban
- `xlsx` — exportação Excel
- `jspdf` — exportação PDF
- `framer-motion` — animações

---

## Detalhes Técnicos

- Estado global via React Context + useReducer para leads, imóveis, tarefas, notificações
- Persistência em localStorage
- Simulação de "tempo real" com setInterval (30s) para atualizar indicador
- Todos os ícones via `lucide-react`
- Componentes shadcn/ui reutilizados: Card, Badge, Button, Dialog, Sheet, Tabs, Table, Input, Textarea, Select, Checkbox, Tooltip, DropdownMenu
- Mobile-first com breakpoints Tailwind
