"use client";

import { Check, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Tipo = "MINORISTA" | "TALLER" | "DISTRIBUIDOR_LOCAL" | "DISTRIBUIDOR_REGIONAL" | "VIP";
type Fuente = "ADS" | "REFERIDO" | "ORGANICO" | "DIRECTO" | "WHATSAPP" | "TIENDA_WEB";
type Temperatura = "CALIENTE" | "TIBIO" | "FRIO";

const TIPO_OPTIONS: { value: Tipo; label: string }[] = [
  { value: "MINORISTA",             label: "Minorista" },
  { value: "TALLER",                label: "Taller" },
  { value: "DISTRIBUIDOR_LOCAL",    label: "Dist. Local" },
  { value: "DISTRIBUIDOR_REGIONAL", label: "Dist. Regional" },
  { value: "VIP",                   label: "VIP" },
];

const TIPO_STYLES: Record<Tipo, string> = {
  MINORISTA:             "bg-zinc-100 text-zinc-700",
  TALLER:                "bg-blue-100 text-blue-700",
  DISTRIBUIDOR_LOCAL:    "bg-purple-100 text-purple-700",
  DISTRIBUIDOR_REGIONAL: "bg-indigo-100 text-indigo-700",
  VIP:                   "bg-[var(--color-gold)] text-black",
};

const FUENTE_OPTIONS: { value: Fuente; label: string }[] = [
  { value: "DIRECTO",    label: "Directo" },
  { value: "REFERIDO",   label: "Referido" },
  { value: "WHATSAPP",   label: "WhatsApp" },
  { value: "ORGANICO",   label: "Orgánico" },
  { value: "ADS",        label: "Ads" },
  { value: "TIENDA_WEB", label: "Tienda Web" },
];

const TEMP_OPTIONS: { value: Temperatura; label: string; cls: string }[] = [
  { value: "CALIENTE", label: "Caliente", cls: "bg-red-100 text-red-700" },
  { value: "TIBIO",    label: "Tibio",    cls: "bg-amber-100 text-amber-700" },
  { value: "FRIO",     label: "Frío",     cls: "bg-blue-100 text-blue-700" },
];

type Props = {
  clienteId: string;
  initial: {
    nombre: string;
    empresa: string | null;
    tipo: Tipo;
    telefono: string;
    whatsapp: string | null;
    email: string | null;
    ciudad: string | null;
    rif: string | null;
    fuente: Fuente;
    temperatura: Temperatura;
    condicionPago: string | null;
    limiteCredito: number;
    notas: string | null;
  };
};

export function ClienteEditPanel({ clienteId, initial }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nombre: initial.nombre,
    empresa: initial.empresa ?? "",
    tipo: initial.tipo,
    telefono: initial.telefono,
    whatsapp: initial.whatsapp ?? "",
    email: initial.email ?? "",
    ciudad: initial.ciudad ?? "",
    rif: initial.rif ?? "",
    fuente: initial.fuente,
    temperatura: initial.temperatura,
    condicionPago: initial.condicionPago ?? "",
    limiteCredito: String(initial.limiteCredito),
    notas: initial.notas ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function cancel() {
    setForm({
      nombre: initial.nombre,
      empresa: initial.empresa ?? "",
      tipo: initial.tipo,
      telefono: initial.telefono,
      whatsapp: initial.whatsapp ?? "",
      email: initial.email ?? "",
      ciudad: initial.ciudad ?? "",
      rif: initial.rif ?? "",
      fuente: initial.fuente,
      temperatura: initial.temperatura,
      condicionPago: initial.condicionPago ?? "",
      limiteCredito: String(initial.limiteCredito),
      notas: initial.notas ?? "",
    });
    setError("");
    setEditing(false);
  }

  async function save() {
    setError("");
    setSaving(true);

    const res = await fetch(`/api/admin/clientes/${clienteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        editMode: true,
        limiteCredito: parseFloat(form.limiteCredito) || 0,
      }),
    });

    setSaving(false);

    if (res.ok) {
      setSaved(true);
      setEditing(false);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "No se pudo actualizar.");
    }
  }

  const inputCls = "mt-1.5 h-10 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]";
  const inputStyle = {
    border: "1px solid var(--border)",
    background: "var(--bg-input)",
    color: "var(--text-primary)",
  } as React.CSSProperties;
  const labelCls = "block text-xs font-bold uppercase";
  const labelStyle = { color: "var(--text-muted)" } as React.CSSProperties;

  return (
    <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
      {/* Section header */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-3"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
      >
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
          Editar ficha
        </p>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs font-bold" style={{ color: "var(--color-success)" }}>
              <Check size={12} /> Guardado
            </span>
          )}
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition hover:opacity-80"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              <Pencil size={11} /> Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancel}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition hover:opacity-80"
                style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                <X size={11} /> Cancelar
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-black uppercase text-black transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--color-gold)" }}
              >
                <Check size={11} />
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        {editing ? (
          <div className="grid gap-5">
            {/* Nombre + Empresa */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} style={labelStyle}>Nombre *</label>
                <input type="text" value={form.nombre} onChange={field("nombre")} required className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Empresa</label>
                <input type="text" value={form.empresa} onChange={field("empresa")} className={inputCls} style={inputStyle} />
              </div>
            </div>

            {/* Tipo */}
            <div>
              <p className={labelCls} style={labelStyle}>Tipo</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TIPO_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, tipo: opt.value }))}
                    className={`rounded px-3 py-1.5 text-xs font-black uppercase transition ${TIPO_STYLES[opt.value]}`}
                    style={{
                      outline: form.tipo === opt.value ? "2px solid var(--color-gold)" : "none",
                      outlineOffset: "2px",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Teléfono + WhatsApp */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} style={labelStyle}>Teléfono *</label>
                <input type="tel" value={form.telefono} onChange={field("telefono")} required className={`${inputCls} font-mono`} style={inputStyle} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>WhatsApp</label>
                <input type="tel" value={form.whatsapp} onChange={field("whatsapp")} className={`${inputCls} font-mono`} style={inputStyle} />
              </div>
            </div>

            {/* Email + Ciudad */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} style={labelStyle}>Email</label>
                <input type="email" value={form.email} onChange={field("email")} className={`${inputCls} font-mono`} style={inputStyle} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Ciudad</label>
                <input type="text" value={form.ciudad} onChange={field("ciudad")} className={inputCls} style={inputStyle} />
              </div>
            </div>

            {/* RIF + Condición pago */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} style={labelStyle}>RIF</label>
                <input type="text" value={form.rif} onChange={field("rif")} className={`${inputCls} font-mono uppercase`} style={inputStyle} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Condición de pago</label>
                <input type="text" value={form.condicionPago} onChange={field("condicionPago")} placeholder="Ej: Contado / Crédito 30d" className={inputCls} style={inputStyle} />
              </div>
            </div>

            {/* Límite + Temperatura */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} style={labelStyle}>Límite crédito USD</label>
                <input type="number" min="0" step="0.01" value={form.limiteCredito} onChange={field("limiteCredito")} className={`${inputCls} text-right font-mono`} style={inputStyle} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Temperatura</label>
                <div className="mt-2 flex gap-2">
                  {TEMP_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, temperatura: opt.value }))}
                      className={`flex-1 rounded py-2 text-xs font-black uppercase transition ${opt.cls}`}
                      style={{
                        outline: form.temperatura === opt.value ? "2px solid var(--color-gold)" : "none",
                        outlineOffset: "2px",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fuente */}
            <div>
              <p className={labelCls} style={labelStyle}>Fuente</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {FUENTE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, fuente: opt.value }))}
                    className="rounded px-3 py-1.5 text-xs font-bold uppercase transition"
                    style={{
                      border: `1px solid ${form.fuente === opt.value ? "var(--color-gold)" : "var(--border)"}`,
                      background: form.fuente === opt.value ? "var(--bg-elevated)" : "transparent",
                      color: form.fuente === opt.value ? "var(--text-primary)" : "var(--text-muted)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className={labelCls} style={labelStyle}>Notas internas</label>
              <textarea
                rows={3}
                value={form.notas}
                onChange={field("notas")}
                className="mt-1.5 w-full resize-none px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-gold)]"
                style={inputStyle}
              />
            </div>

            {error && (
              <p className="text-sm font-bold" style={{ color: "var(--color-danger)" }}>{error}</p>
            )}
          </div>
        ) : (
          /* Read-only summary */
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Nombre", value: initial.nombre },
              { label: "Empresa", value: initial.empresa ?? "—" },
              { label: "Tipo", value: initial.tipo.replace(/_/g, " ") },
              { label: "Teléfono", value: initial.telefono },
              { label: "WhatsApp", value: initial.whatsapp ?? "—" },
              { label: "Email", value: initial.email ?? "—" },
              { label: "Ciudad", value: initial.ciudad ?? "—" },
              { label: "RIF", value: initial.rif ?? "—" },
              { label: "Condición pago", value: initial.condicionPago ?? "—" },
              { label: "Límite crédito", value: `$${initial.limiteCredito.toLocaleString("en-US")}` },
              { label: "Fuente", value: initial.fuente },
              { label: "Temperatura", value: initial.temperatura },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 px-4 py-2.5"
                style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)" }}
              >
                <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>{row.label}</p>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{row.value}</p>
              </div>
            ))}
            {initial.notas && (
              <div
                className="col-span-2 px-4 py-3"
                style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)" }}
              >
                <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Notas</p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{initial.notas}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
