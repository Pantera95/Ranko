"use client";

import { Car, Loader2, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type VehiculoItem = {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  motor: string | null;
  color: string | null;
  placa: string | null;
};

type Props = {
  initial: VehiculoItem[];
};

const CURRENT_YEAR = new Date().getFullYear();

const EMPTY_FORM = {
  marca: "",
  modelo: "",
  anio: String(CURRENT_YEAR),
  motor: "",
  color: "",
  placa: "",
};

const inputStyle: React.CSSProperties = {
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: 6,
};

export function MisVehiculosPanel({ initial }: Props) {
  const router = useRouter();
  const [vehiculos, setVehiculos] = useState<VehiculoItem[]>(initial);
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

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const anio = parseInt(form.anio, 10);
    if (!form.marca.trim()) { setError("La marca es requerida"); return; }
    if (!form.modelo.trim()) { setError("El modelo es requerido"); return; }
    if (!anio || anio < 1900 || anio > 2100) { setError("Año no válido"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/cliente/vehiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marca: form.marca.trim(),
          modelo: form.modelo.trim(),
          anio,
          motor: form.motor.trim() || null,
          color: form.color.trim() || null,
          placa: form.placa.trim().toUpperCase() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "No se pudo guardar");
        return;
      }
      setVehiculos((prev) => [...prev, json.vehiculo]);
      setShowForm(false);
      setForm(EMPTY_FORM);
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(vid: string) {
    if (!confirm("¿Eliminar este vehículo de tu flota?")) return;
    setDeletingId(vid);
    try {
      const res = await fetch(`/api/cliente/vehiculos/${vid}`, { method: "DELETE" });
      if (res.ok) {
        setVehiculos((prev) => prev.filter((v) => v.id !== vid));
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {/* Header row with Add button */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
          {vehiculos.length === 0 ? "Sin vehículos registrados" : `${vehiculos.length} vehículo${vehiculos.length === 1 ? "" : "s"}`}
        </p>
        <button
          type="button"
          onClick={openForm}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-black uppercase transition-opacity hover:opacity-75"
          style={{ background: "var(--color-gold)", color: "#000" }}
        >
          <Plus size={10} /> Agregar
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="px-5 py-4"
          style={{ borderTop: "1px solid var(--border)", background: "var(--bg-elevated)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-black uppercase" style={{ color: "var(--text-primary)" }}>
              Nuevo vehículo
            </p>
            <button type="button" onClick={() => setShowForm(false)}>
              <X size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Marca *</label>
              <input type="text" value={form.marca} onChange={field("marca")} placeholder="Toyota"
                className="w-full rounded px-3 py-2 text-sm" style={inputStyle} autoFocus />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Modelo *</label>
              <input type="text" value={form.modelo} onChange={field("modelo")} placeholder="Corolla"
                className="w-full rounded px-3 py-2 text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Año *</label>
              <input type="number" value={form.anio} onChange={field("anio")} min={1900} max={2100}
                className="w-full rounded px-3 py-2 font-mono text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Motor</label>
              <input type="text" value={form.motor} onChange={field("motor")} placeholder="1.8L"
                className="w-full rounded px-3 py-2 text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Color</label>
              <input type="text" value={form.color} onChange={field("color")} placeholder="Blanco"
                className="w-full rounded px-3 py-2 text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Placa</label>
              <input type="text" value={form.placa} onChange={field("placa")} placeholder="AB123CD"
                className="w-full rounded px-3 py-2 font-mono text-sm uppercase" style={inputStyle} />
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
              onClick={() => setShowForm(false)}
              className="rounded px-4 py-1.5 text-xs font-black uppercase"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {vehiculos.length > 0 && (
        <div>
          {vehiculos.map((v) => (
            <div
              className="group flex items-start justify-between gap-3 px-5 py-4"
              key={v.id}
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Car size={14} style={{ color: "var(--text-muted)" }} />
                  <p className="font-black uppercase">{v.marca} {v.modelo} {v.anio}</p>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                  {v.motor ? <span>Motor: {v.motor}</span> : null}
                  {v.color ? <span>Color: {v.color}</span> : null}
                  {v.placa ? <span className="font-mono">Placa: {v.placa}</span> : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(v.id)}
                disabled={deletingId === v.id}
                className="shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                style={{ color: "var(--color-danger)" }}
                title="Eliminar"
                aria-label="Eliminar vehículo"
              >
                {deletingId === v.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
