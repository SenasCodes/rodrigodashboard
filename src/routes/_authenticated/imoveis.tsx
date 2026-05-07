import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "../../lib/app-context";
import { useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Bath, BedDouble, Maximize } from "lucide-react";
import type { Imovel } from "../../lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/imoveis")({
  component: ImoveisPage,
});

const emptyImovel: Omit<Imovel, "id" | "vezesMostrado"> = {
  titulo: "", preco: 0, localizacao: "", tipologia: "T2", area: 0,
  quartos: 2, casasBanho: 1, descricao: "", imagem: "", ativo: true,
};

function ImoveisPage() {
  const { imoveis, addImovel, updateImovel, removeImovel } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Imovel | null>(null);
  const [form, setForm] = useState(emptyImovel);
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openAdd = () => { setEditing(null); setForm(emptyImovel); setUrl(""); setShowModal(true); };
  const openEdit = (im: Imovel) => { setEditing(im); setForm(im); setShowModal(true); };

  const simulateFetch = async () => {
    if (!url) return;
    setFetching(true);

    // Try to extract property info from URL
    const urlObj = new URL(url.startsWith("http") ? url : "https://" + url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    const lastSegment = pathParts[pathParts.length - 1] || "";

    // Guess title from URL path
    const guessedTitle = lastSegment
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/Imovel\s*/i, "Imóvel ")
      .slice(0, 60) || "Imóvel do portal";

    // Try n8n webhook if configured
    let fetched = false;
    const n8nWebhook = import.meta.env.VITE_N8N_SCRAPER_URL;
    if (n8nWebhook) {
      try {
        const res = await fetch(n8nWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url.startsWith("http") ? url : "https://" + url }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.titulo || data.title) {
            setForm({
              titulo: data.titulo || data.title || guessedTitle,
              preco: Number(data.preco || data.price || 0),
              localizacao: data.localizacao || data.location || "",
              tipologia: data.tipologia || data.typology || "T2",
              area: Number(data.area || 0),
              quartos: Number(data.quartos || data.bedrooms || 2),
              casasBanho: Number(data.casasBanho || data.bathrooms || 1),
              descricao: data.descricao || data.description || "",
              imagem: data.imagem || data.image || form.imagem,
              ativo: true,
            });
            fetched = true;
          }
        }
      } catch (e) {
        console.log("Scraper webhook unavailable, using URL-based guess");
      }
    }

    if (!fetched) {
      // Guess typology from URL
      const typoMatch = guessedTitle.match(/\b(T[0-9])\b/i) || guessedTitle.match(/\bTipo\s*([0-9])\b/i);
      const guessedTypology = typoMatch ? typoMatch[1].toUpperCase() : "T2";

      // Guess price from URL
      const priceMatch = guessedTitle.match(/(\d+)\s*(?:mil|k|000)/i) || url.match(/(\d{5,7})/);

      setForm({
        titulo: guessedTitle,
        preco: priceMatch ? Number(priceMatch[1]) * (guessedTitle.includes("mil") ? 1000 : 1) : 0,
        localizacao: pathParts.includes("lisboa") ? "Lisboa" : "",
        tipologia: guessedTypology,
        area: 0,
        quartos: Number(guessedTypology?.replace("T", "") || 2),
        casasBanho: 1,
        descricao: "URL: " + url,
        imagem: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
        ativo: true,
      });
    }
    setFetching(false);
  };

  const handleSave = () => {
    if (!form.titulo) return;
    if (editing) {
      updateImovel(editing.id, form);
      toast.success("Imóvel atualizado.");
    } else {
      addImovel({ ...form, id: `im_${Date.now()}`, vezesMostrado: 0 });
      toast.success("Casa adicionada com sucesso! Já está disponível para o agente.");
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    removeImovel(id);
    setConfirmDelete(null);
    toast.success("Imóvel removido.");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Imóveis</h1>
        <button onClick={openAdd} className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Adicionar Casa
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {imoveis.map(im => (
          <div key={im.id} className="glass-card rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="relative h-40">
              <img src={im.imagem} alt={im.titulo} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-1">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${im.ativo ? "bg-emerald/90 text-white" : "bg-muted text-muted-foreground"}`}>
                  {im.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-1">{im.titulo}</h3>
              <p className="text-lg font-bold text-primary">{im.preco.toLocaleString("pt-PT")}€</p>
              <p className="text-xs text-muted-foreground mb-2">{im.localizacao}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {im.quartos}</span>
                <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {im.casasBanho}</span>
                <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {im.area}m²</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Mostrado {im.vezesMostrado}×</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(im)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setConfirmDelete(im.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card rounded-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{editing ? "Editar Imóvel" : "Adicionar Nova Casa"}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            {!editing && (
              <div className="flex gap-2 mb-4">
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Cola o URL do imóvel..."
                  className="flex-1 rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-primary" />
                <button onClick={simulateFetch} disabled={fetching}
                  className="rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-1">
                  {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                </button>
              </div>
            )}

            <div className="space-y-3">
              <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Título"
                className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-primary" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.preco || ""} onChange={e => setForm({ ...form, preco: Number(e.target.value) })} placeholder="Preço (€)"
                  className="rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-primary" />
                <input value={form.localizacao} onChange={e => setForm({ ...form, localizacao: e.target.value })} placeholder="Localização"
                  className="rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-primary" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <select value={form.tipologia} onChange={e => setForm({ ...form, tipologia: e.target.value })}
                  className="rounded-xl bg-secondary px-3 py-2.5 text-sm text-foreground outline-none ring-1 ring-border focus:ring-primary">
                  {["T0", "T1", "T2", "T3", "T4+"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="number" value={form.area || ""} onChange={e => setForm({ ...form, area: Number(e.target.value) })} placeholder="m²"
                  className="rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-primary" />
                <input type="number" value={form.quartos || ""} onChange={e => setForm({ ...form, quartos: Number(e.target.value) })} placeholder="Quartos"
                  className="rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-primary" />
                <input type="number" value={form.casasBanho || ""} onChange={e => setForm({ ...form, casasBanho: Number(e.target.value) })} placeholder="WC"
                  className="rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-primary" />
              </div>
              <textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição"
                className="w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-primary min-h-[80px] resize-y" />
              <input value={form.imagem} onChange={e => setForm({ ...form, imagem: e.target.value })} placeholder="URL da imagem"
                className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-primary" />
              <button onClick={handleSave} className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold hover:opacity-90 transition-all">
                {editing ? "Guardar alterações" : "Guardar imóvel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setConfirmDelete(null)}>
          <div className="glass-card rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-foreground mb-2">Remover imóvel?</h3>
            <p className="text-xs text-muted-foreground mb-4">Tens a certeza que queres remover este imóvel? Esta ação não pode ser revertida.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="rounded-xl bg-secondary text-foreground px-4 py-2 text-xs font-medium">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)} className="rounded-xl bg-destructive text-destructive-foreground px-4 py-2 text-xs font-medium">Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
