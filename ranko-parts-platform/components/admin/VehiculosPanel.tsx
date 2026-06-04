"use client";

import { Car, Loader2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

export type VehiculoItem = {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  motor: string | null;
  color: string | null;
  placa: string | null;
  vin: string | null;
  notas: string | null;
};

type Props = {
  clienteId: string;
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
  vin: "",
  notas: "",
};

const inputStyle: React.CSSProperties = {
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: 6,
};

export default function VehiculosPanel({ clienteId, initial }: Props) {
  const [vehiculos, setVehiculos] = useState<VehiculoItem[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function field(key: keyof typeof EMPTY_FORM) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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

    const anio = parseInt(form.anio, 10);
    if (!form.marca.trim()) { setError("La marca es requerida"); return; }
    if (!form.modelo.trim()) { setError("El modelo es requerido"); return; }
    if (!anio || anio < 1900 || anio > 2100) { setError("El año no es válido"); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/clientes/${clienteId}/vehiculos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marca: form.marca.trim(),
          modelo: form.modelo.trim(),
          anio,
          motor: form.motor.trim() || null,
          color: form.color.trim() || null,
          placa: form.placa.trim().toUpperCase() || null,
          vin: form.vin.trim().toUpperCase() || null,
          notas: form.notas.trim() || null,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Error al guardar");
        return;
      }
      setVehiculos((prev) => [...prev, json.vehiculo]);
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(vid: string) {
    if (!confirm("¿Eliminar este vehículo del cliente?")) return;
    setDeletingId(vid);
    try {
      const res = await fetch(`/api/admin/clientes/${clienteId}/vehiculos/${vid}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        setVehiculos((prev) => prev.filter((v) => v.id !== vid));
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
          <Car size={13} style={{ color: "var(--color-gold)" }} />
          <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>
            Flota ({vehiculos.length})
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
              Nuevo vehículo
            </p>
            <button type="button" onClick={closeForm}>
              <X size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                Marca *
              </label>
              <input
                type="text"
                value={form.marca}
                onChange={field("marca")}
                placeholder="Toyota"
                className="w-full rounded px-3 py-2 text-sm"
                style={inputStyle}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                Modelo *
              </label>
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
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                Año *
              </label>
              <input
                type="number"
                value={form.anio}
                onChange={field("anio")}
                min={1900}
                max={2100}
                className="w-full rounded px-3 py-2 text-sm font-mono"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                Motor
              </label>
              <input
                type="text"
                value={form.motor}
                onChange={field("motor")}
                placeholder="1.8L 2ZR"
                className="w-full rounded px-3 py-2 text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                Placa
              </label>
              <input
                type="text"
                value={form.placa}
                onChange={field("placa")}
                placeholder="AB123CD"
                className="w-full rounded px-3 py-2 font-mono text-sm uppercase"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                Color
              </label>
              <input
                type="text"
                value={form.color}
                onChange={field("color")}
                placeholder="Blanco"
                className="w-full rounded px-3 py-2 text-sm"
                style={inputStyle}
              />
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                VIN
              </label>
              <input
                type="text"
                value={form.vin}
                onChange={field("vin")}
                placeholder="1HGBH41JXMN109186"
                className="w-full rounded px-3 py-2 font-mono text-sm uppercase"
                style={inputStyle}
              />
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                Notas
              </label>
              <textarea
                value={form.notas}
                onChange={field("notas")}
                rows={2}
                placeholder="Observaciones del vehículo..."
                className="w-full resize-none rounded px-3 py-2 text-sm"
                style={inputStyle}
              />
            </div>
          </div>

          {error && (
            <p className="mt-2 text-xs font-bold" style={{ color: "var(--color-danger)" }}>
              {error}
            </p>
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

      {/* Vehicle list */}
      {vehiculos.length === 0 && !showForm ? (
        <p className="p-5 text-sm" style={{ color: "var(--text-muted)" }}>
          Sin vehículos registrados.
        </p>
      ) : (
        <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
          {vehiculos.map((v) => (
            <div key={v.id} className="group flex items-start justify-between gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-black uppercase" style={{ color: "var(--text-primary)" }}>
                  {v.marca} {v.modelo} {v.anio}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                  {[v.motor, v.color, v.placa].filter(Boolean).join(" · ") || "Sin detalles adicionales"}
                </p>
                {v.vin && (
                  <p className="mt-0.5 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                    VIN: {v.vin}
                  </p>
                )}
                {v.notas && (
                  <p className="mt-1 text-xs italic" style={{ color: "var(--text-muted)" }}>
                    {v.notas}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(v.id)}
                disabled={deletingId === v.id}
                className="shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                style={{ color: "var(--color-danger)" }}
                title="Eliminar vehículo"
              >
                {deletingId === v.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
