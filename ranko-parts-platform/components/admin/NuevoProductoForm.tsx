"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FormState = {
  sku: string;
  nombre: string;
  marca: string;
  categoria: string;
  subcategoria: string;
  descripcion: string;
  precio: string;
  costo: string;
  codigoOEM: string;
  codigoAftermarket: string;
  activo: boolean;
  destacado: boolean;
};

const EMPTY: FormState = {
  sku: "", nombre: "", marca: "", categoria: "", subcategoria: "",
  descripcion: "", precio: "", costo: "0",
  codigoOEM: "", codigoAftermarket: "",
  activo: true, destacado: false,
};

export function NuevoProductoForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  const precio = parseFloat(form.precio) || 0;
  const costo = parseFloat(form.costo) || 0;
  const margen = precio > 0 ? Math.round(((precio - costo) / precio) * 100) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/admin/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        precio,
        costo,
        sku: form.sku.toUpperCase().trim(),
      }),
    });

    setSubmitting(false);

    if (res.ok) {
      const data = (await res.json()) as { product: { id: string } };
      router.push(`/admin/catalogo/${data.product.id}`);
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "No se pudo crear el producto.");
    }
  }

  const inputCls = "mt-2 h-11 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]";
  const inputStyle = { border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" } as React.CSSProperties;
  const labelCls = "block text-xs font-bold uppercase";
  const labelStyle = { color: "var(--text-muted)" } as React.CSSProperties;

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-6">

      {/* SKU + Nombre */}
      <div
        className="grid gap-4 p-5 sm:grid-cols-[160px_1fr]"
        style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
      >
        <div>
          <label className={labelCls} style={labelStyle}>SKU *</label>
          <input
            type="text"
            value={form.sku}
            onChange={field("sku")}
            required
            placeholder="EJ-12345"
            className={`${inputCls} font-mono font-black uppercase`}
            style={inputStyle}
          />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Nombre del producto *</label>
          <input
            type="text"
            value={form.nombre}
            onChange={field("nombre")}
            required
            placeholder="Filtro de aceite premium…"
            className={`${inputCls} font-bold`}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Marca / Categoría / Subcategoría */}
      <div
        className="grid gap-4 p-5 sm:grid-cols-3"
        style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
      >
        <div>
          <label className={labelCls} style={labelStyle}>Marca *</label>
          <input type="text" value={form.marca} onChange={field("marca")} required placeholder="Ej: Mopar" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Categoría *</label>
          <input type="text" value={form.categoria} onChange={field("categoria")} required placeholder="Ej: Filtros" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Subcategoría</label>
          <input type="text" value={form.subcategoria} onChange={field("subcategoria")} placeholder="Opcional" className={inputCls} style={inputStyle} />
        </div>
      </div>

      {/* Precio / Costo / Margen */}
      <div
        className="grid gap-4 p-5 sm:grid-cols-3"
        style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
      >
        <div>
          <label className={labelCls} style={labelStyle}>Precio USD *</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.precio}
            onChange={field("precio")}
            required
            className={`${inputCls} text-right font-mono`}
            style={inputStyle}
          />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Costo USD</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.costo}
            onChange={field("costo")}
            className={`${inputCls} text-right font-mono`}
            style={inputStyle}
          />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Margen bruto</label>
          <div
            className="mt-2 flex h-11 items-center justify-center font-mono font-black"
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

      {/* OEM codes + Descripción */}
      <div
        className="grid gap-4 p-5"
        style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} style={labelStyle}>Código OEM</label>
            <input type="text" value={form.codigoOEM} onChange={field("codigoOEM")} placeholder="68375514AA" className={`${inputCls} font-mono`} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Código Aftermarket</label>
            <input type="text" value={form.codigoAftermarket} onChange={field("codigoAftermarket")} placeholder="AC-7241" className={`${inputCls} font-mono`} style={inputStyle} />
          </div>
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Descripción</label>
          <textarea
            rows={3}
            value={form.descripcion}
            onChange={field("descripcion")}
            placeholder="Descripción pública del producto para la tienda…"
            className="mt-2 w-full resize-none px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-gold)]"
            style={inputStyle}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm font-bold" style={{ color: "var(--color-danger)" }}>{error}</p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/catalogo")}
          className="px-5 py-2.5 text-sm font-bold transition hover:opacity-80"
          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-black uppercase text-black transition hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--color-gold)" }}
        >
          <Plus size={14} />
          {submitting ? "Creando…" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
