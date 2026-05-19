"use client";

import { Eye, EyeOff, Save, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type InitialData = {
  nombre: string;
  descripcion: string;
  precio: number;
  costo: number;
  categoria: string;
  subcategoria: string;
  marca: string;
  codigoOEM: string;
  codigoAftermarket: string;
  activo: boolean;
  destacado: boolean;
};

type Props = { productoId: string; initialData: InitialData };

export function ProductEditPanel({ productoId, initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function field(key: keyof InitialData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSaved(false);
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };
  }

  function toggle(key: "activo" | "destacado") {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: !f[key] }));
  }

  const margen = form.precio > 0
    ? Math.round(((form.precio - form.costo) / form.precio) * 100)
    : 0;

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);

    const res = await fetch(`/api/admin/productos/${productoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        costo: Number(form.costo),
        categoria: form.categoria,
        subcategoria: form.subcategoria,
        marca: form.marca,
        codigoOEM: form.codigoOEM,
        codigoAftermarket: form.codigoAftermarket,
        activo: form.activo,
        destacado: form.destacado,
      }),
    });

    setSaving(false);

    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      const d = (await res.json()) as { error?: string };
      setError(d.error ?? "No se pudo guardar.");
    }
  }

  return (
    <div className="p-5">
      <div className="grid gap-5">

        {/* Toggles row */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => toggle("activo")}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-black uppercase transition"
            style={{
              border: `1px solid ${form.activo ? "var(--color-gold)" : "var(--border)"}`,
              background: form.activo
                ? "color-mix(in srgb, var(--color-gold) 10%, var(--bg-card))"
                : "var(--bg-card)",
              color: form.activo ? "var(--color-gold)" : "var(--text-muted)",
            }}
          >
            {form.activo ? <Eye size={13} /> : <EyeOff size={13} />}
            {form.activo ? "Visible en tienda" : "Oculto en tienda"}
          </button>
          <button
            type="button"
            onClick={() => toggle("destacado")}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-black uppercase transition"
            style={{
              border: `1px solid ${form.destacado ? "#f59e0b" : "var(--border)"}`,
              background: form.destacado
                ? "color-mix(in srgb, #f59e0b 10%, var(--bg-card))"
                : "var(--bg-card)",
              color: form.destacado ? "#b45309" : "var(--text-muted)",
            }}
          >
            <Star size={13} fill={form.destacado ? "currentColor" : "none"} />
            {form.destacado ? "Destacado" : "No destacado"}
          </button>
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
            Nombre *
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={field("nombre")}
            className="mt-2 h-11 w-full px-3 text-sm font-bold outline-none transition focus:border-[var(--color-gold)]"
            style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
            Descripción
          </label>
          <textarea
            rows={3}
            value={form.descripcion}
            onChange={field("descripcion")}
            className="mt-2 w-full resize-none px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-gold)]"
            style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
            placeholder="Descripción del producto para la tienda pública…"
          />
        </div>

        {/* Precio + Costo + Margen */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
              Precio USD *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.precio}
              onChange={field("precio")}
              className="mt-2 h-11 w-full px-3 text-right font-mono text-sm outline-none transition focus:border-[var(--color-gold)]"
              style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
              Costo USD
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.costo}
              onChange={field("costo")}
              className="mt-2 h-11 w-full px-3 text-right font-mono text-sm outline-none transition focus:border-[var(--color-gold)]"
              style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
              Margen bruto
            </label>
            <div
              className="mt-2 flex h-11 items-center justify-center font-mono text-sm font-black"
              style={{
                border: "1px solid var(--border)",
                background: "var(--bg-elevated)",
                color: margen < 20 ? "var(--color-danger)" : margen >= 40 ? "var(--color-success)" : "var(--text-primary)",
              }}
            >
              {margen}%
            </div>
          </div>
        </div>

        {/* Marca + Categoría + Subcategoría */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
              Marca *
            </label>
            <input
              type="text"
              value={form.marca}
              onChange={field("marca")}
              className="mt-2 h-11 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]"
              style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
              Categoría *
            </label>
            <input
              type="text"
              value={form.categoria}
              onChange={field("categoria")}
              className="mt-2 h-11 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]"
              style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
              Subcategoría
            </label>
            <input
              type="text"
              value={form.subcategoria}
              onChange={field("subcategoria")}
              className="mt-2 h-11 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]"
              style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
              placeholder="Opcional"
            />
          </div>
        </div>

        {/* OEM + Aftermarket */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
              Código OEM
            </label>
            <input
              type="text"
              value={form.codigoOEM}
              onChange={field("codigoOEM")}
              className="mt-2 h-11 w-full px-3 font-mono text-sm outline-none transition focus:border-[var(--color-gold)]"
              style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
              placeholder="Ej: 68375514AA"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
              Código Aftermarket
            </label>
            <input
              type="text"
              value={form.codigoAftermarket}
              onChange={field("codigoAftermarket")}
              className="mt-2 h-11 w-full px-3 font-mono text-sm outline-none transition focus:border-[var(--color-gold)]"
              style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
              placeholder="Ej: AC-7241"
            />
          </div>
        </div>

        {/* Error / success feedback */}
        {error && (
          <p className="text-sm font-bold" style={{ color: "var(--color-danger)" }}>{error}</p>
        )}
        {saved && (
          <p className="text-sm font-bold" style={{ color: "var(--color-success)" }}>
            ✓ Cambios guardados correctamente.
          </p>
        )}

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase text-black transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--color-gold)" }}
          >
            <Save size={13} />
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
