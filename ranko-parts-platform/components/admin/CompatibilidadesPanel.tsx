"use client";

import { Loader2, Plus, Tag, Trash2, X } from "lucide-react";
import { useState } from "react";

export type CompatibilidadItem = {
  id: string;
  marca: string;
  modelo: string;
  anioDesde: number;
  anioHasta: number;
  motor: string | null;
  sistema: string | null;
};

type Props = {
  productoId: string;
  initial: CompatibilidadItem[];
};

const CURRENT_YEAR = new Date().getFullYear();

const EMPTY_FORM = {
  marca: "",
  modelo: "",
  anioDesde: String(CURRENT_YEAR - 5),
  anioHasta: String(CURRENT_YEAR),
  motor: "",
  sistema: "",
};

const inputStyle: React.CSSProperties = {
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: 6,
};

export default function CompatibilidadesPanel({ productoId, initial }: Props) {
  const [items, setItems] = useState<CompatibilidadItem[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function field(key: keyof typeof EMPTY_FORM) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function openForm() {
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setError(null);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const anioDesde = parseInt(form.anioDesde, 10);
    const anioHasta = parseInt(form.anioHasta, 10);
    if (!form.marca.trim()) { setError("La marca es requerida"); return; }
    if (!form.modelo.trim()) { setError("El modelo es requerido"); return; }
    if (!anioDesde || anioDesde < 1900 || anioDesde > 2100) {
      setError("Año desde no válido"); return;
    }
    if (!anioHasta || anioHasta < anioDesde) {
      setError("Año hasta debe ser ≥ año desde"); return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/productos/${productoId}/compatibilidades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marca: form.marca.trim().toUpperCase(),
          modelo: form.modelo.trim(),
          anioDesde,
          anioHasta,
          motor: form.motor.trim() || null,
          sistema: form.sistema.trim() || null,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Error al guardar");
        return;
      }
      // Insert sorted: by marca, modelo, anioDesde
      setItems((prev) => {
        const next = [...prev, json.compatibilidad];
        next.sort((a, b) =>
          a.marca.localeCompare(b.marca) ||
          a.modelo.localeCompare(b.modelo) ||
          a.anioDesde - b.anioDesde,
        );
        return next;
      });
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cid: string) {
    if (!confirm("¿Eliminar esta regla de compatibilidad?")) return;
    setDeletingId(cid);
    try {
      const res = await fetch(`/api/admin/productos/${productoId}/compatibilidades/${cid}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.ok) {
        setItems((prev) => prev.filter((c) => c.id !== cid));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between gap-2 px-5 py-3"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
      >
        <div className="flex items-center gap-2">
          <Tag size={13} style={{ color: "var(--color-gold)" }} />
          <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>
            Compatibilidades ({items.length})
          </p>
        </div>
        <button
          type="button"
          onClick={openForm}
          className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-black uppercase transition-opacity hover:opacity-75"
          style={{ background: "var(--color-gold)", color: "#000" }}
        >
          <Plus size={10} />
          Agregar
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="border-b px-5 py-4"
          style={{ borderColor: "var(--border-subtle)", background: "var(--bg-elevated)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>
              Nueva regla
            </p>
            <button type="button" onClick={closeForm}>
              <X size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Marca *</label>
              <input
                type="text"
                value={form.marca}
                onChange={field("marca")}
                placeholder="Toyota"
                className="w-full rounded px-3 py-2 text-sm uppercase"
                style={inputStyle}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Modelo *</label>
              <input
                type="text"
                value={form.modelo}
                onChange={field("modelo")}
                placeholder="Corolla"
                className="w-full rounded px-3 py-2 text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Sistema</label>
              <input
                type="text"
                value={form.sistema}
                onChange={field("sistema")}
                placeholder="Frenos"
                className="w-full rounded px-3 py-2 text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Año desde *</label>
              <input
                type="number"
                value={form.anioDesde}
                onChange={field("anioDesde")}
                min={1900}
                max={2100}
                className="w-full rounded px-3 py-2 font-mono text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Año hasta *</label>
              <input
                type="number"
                value={form.anioHasta}
                onChange={field("anioHasta")}
                min={1900}
                max={2100}
                className="w-full rounded px-3 py-2 font-mono text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Motor</label>
              <input
                type="text"
                value={form.motor}
                onChange={field("motor")}
                placeholder="1.8L 2ZR"
                className="w-full rounded px-3 py-2 text-sm"
                style={inputStyle}
              />
            </div>
          </div>

          {error && (
            <p className="mt-2 text-xs font-bold" style={{ color: "var(--color-danger)" }}>{error}</p>
          )}

          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded px-4 py-1.5 text-xs font-black uppercase disabled:opacity-50"
              style={{ background: "var(--color-gold)", color: "#000" }}
            >
              {saving ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
              Guardar
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded px-4 py-1.5 text-xs font-black uppercase"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {items.length === 0 && !showForm ? (
        <p className="p-5 text-sm" style={{ color: "var(--text-muted)" }}>
          Sin compatibilidades registradas.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[560px] w-full border-collapse text-sm">
            <thead style={{ background: "var(--bg-base)" }}>
              <tr>
                {["Marca", "Modelo", "Años", "Motor", "Sistema", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="group" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <td className="px-4 py-3 font-bold uppercase">{c.marca}</td>
                  <td className="px-4 py-3">{c.modelo}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {c.anioDesde === c.anioHasta ? c.anioDesde : `${c.anioDesde}–${c.anioHasta}`}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{c.motor ?? "—"}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{c.sistema ?? "—"}</td>
                  <td className="px-2 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      className="rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                      style={{ color: "var(--color-danger)" }}
                      title="Eliminar"
                    >
                      {deletingId === c.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
