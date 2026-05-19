"use client";

import { UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Tipo = "MINORISTA" | "TALLER" | "DISTRIBUIDOR_LOCAL" | "DISTRIBUIDOR_REGIONAL" | "VIP";
type Fuente = "ADS" | "REFERIDO" | "ORGANICO" | "DIRECTO" | "WHATSAPP" | "TIENDA_WEB";

const TIPO_OPTIONS: { value: Tipo; label: string }[] = [
  { value: "MINORISTA",            label: "Minorista" },
  { value: "TALLER",               label: "Taller" },
  { value: "DISTRIBUIDOR_LOCAL",   label: "Dist. Local" },
  { value: "DISTRIBUIDOR_REGIONAL",label: "Dist. Regional" },
  { value: "VIP",                  label: "VIP" },
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
  { value: "TIENDA_WEB", label: "Tienda web" },
];

type FormState = {
  nombre: string;
  empresa: string;
  tipo: Tipo;
  telefono: string;
  whatsapp: string;
  email: string;
  ciudad: string;
  rif: string;
  fuente: Fuente;
  condicionPago: string;
  limiteCredito: string;
  notas: string;
};

const EMPTY: FormState = {
  nombre: "", empresa: "", tipo: "MINORISTA",
  telefono: "", whatsapp: "", email: "",
  ciudad: "", rif: "", fuente: "DIRECTO",
  condicionPago: "", limiteCredito: "0", notas: "",
};

export function NuevoClienteModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function close() {
    setOpen(false);
    setForm(EMPTY);
    setError("");
    setCreatedId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/admin/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        limiteCredito: parseFloat(form.limiteCredito) || 0,
      }),
    });

    setSubmitting(false);

    if (res.ok) {
      const data = (await res.json()) as { cliente: { id: string; nombre: string } };
      setCreatedId(data.cliente.id);
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "No se pudo crear el cliente.");
    }
  }

  const inputCls = "mt-2 h-11 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]";
  const inputStyle = {
    border: "1px solid var(--border)",
    background: "var(--bg-input)",
    color: "var(--text-primary)",
  } as React.CSSProperties;
  const labelCls = "block text-xs font-bold uppercase";
  const labelStyle = { color: "var(--text-muted)" } as React.CSSProperties;

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase text-black transition hover:opacity-90"
        style={{ background: "var(--color-gold)" }}
        type="button"
      >
        <UserPlus size={13} /> Nuevo cliente
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={close}
        />
      )}

      {/* Slide-in panel */}
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-y-auto"
        style={{
          background: "var(--bg-page)",
          borderLeft: "1px solid var(--border)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s ease",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--color-gold)" }}>
              CRM
            </p>
            <h2 className="mt-0.5 text-xl font-black uppercase">Nuevo cliente</h2>
          </div>
          <button onClick={close} type="button" className="p-1 transition hover:opacity-60">
            <X size={18} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {/* Success state */}
        {createdId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div
              className="flex size-16 items-center justify-center"
              style={{ border: "2px solid var(--color-success)" }}
            >
              <UserPlus size={28} style={{ color: "var(--color-success)" }} />
            </div>
            <p className="text-lg font-black" style={{ color: "var(--color-success)" }}>
              Cliente creado
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {form.nombre} ha sido añadido al CRM.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push(`/admin/clientes/${createdId}`)}
                className="px-5 py-2.5 text-sm font-black uppercase text-black transition hover:opacity-90"
                style={{ background: "var(--color-gold)" }}
              >
                Ver ficha
              </button>
              <button
                type="button"
                onClick={() => { setForm(EMPTY); setCreatedId(null); }}
                className="px-5 py-2.5 text-sm font-bold transition hover:opacity-80"
                style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              >
                Crear otro
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 p-6">

            {/* Nombre + Empresa */}
            <div
              className="grid gap-4 p-4"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <div>
                <label className={labelCls} style={labelStyle}>Nombre completo / Razón social *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={field("nombre")}
                  required
                  placeholder="Ej: Carlos Mendoza / Taller El Motor"
                  className={`${inputCls} font-bold`}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Empresa</label>
                <input
                  type="text"
                  value={form.empresa}
                  onChange={field("empresa")}
                  placeholder="Ej: Taller El Motor C.A."
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Tipo de cliente */}
            <div
              className="p-4"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <p className={labelCls} style={labelStyle}>Tipo de cliente *</p>
              <div className="mt-3 flex flex-wrap gap-2">
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

            {/* Contacto */}
            <div
              className="grid gap-4 p-4"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Contacto
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls} style={labelStyle}>Teléfono *</label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={field("telefono")}
                    required
                    placeholder="+58 414-0000000"
                    className={`${inputCls} font-mono`}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>WhatsApp</label>
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={field("whatsapp")}
                    placeholder="+58 414-0000000"
                    className={`${inputCls} font-mono`}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls} style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={field("email")}
                    placeholder="cliente@empresa.com"
                    className={`${inputCls} font-mono`}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Ciudad</label>
                  <input
                    type="text"
                    value={form.ciudad}
                    onChange={field("ciudad")}
                    placeholder="Ej: Caracas"
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Fiscal + Crédito */}
            <div
              className="grid gap-4 p-4"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Datos fiscales y crédito
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls} style={labelStyle}>RIF</label>
                  <input
                    type="text"
                    value={form.rif}
                    onChange={field("rif")}
                    placeholder="J-12345678-9"
                    className={`${inputCls} font-mono uppercase`}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Límite crédito USD</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.limiteCredito}
                    onChange={field("limiteCredito")}
                    className={`${inputCls} text-right font-mono`}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Condición de pago</label>
                <input
                  type="text"
                  value={form.condicionPago}
                  onChange={field("condicionPago")}
                  placeholder="Ej: Contado / Crédito 30 días"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Fuente + Notas */}
            <div
              className="grid gap-4 p-4"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <div>
                <label className={labelCls} style={labelStyle}>Fuente de adquisición</label>
                <div className="mt-3 flex flex-wrap gap-2">
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
              <div>
                <label className={labelCls} style={labelStyle}>Notas internas</label>
                <textarea
                  rows={3}
                  value={form.notas}
                  onChange={field("notas")}
                  placeholder="Observaciones del cliente, preferencias, historial previo…"
                  className="mt-2 w-full resize-none px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-gold)]"
                  style={inputStyle}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm font-bold" style={{ color: "var(--color-danger)" }}>
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pb-4">
              <button
                type="button"
                onClick={close}
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
                <UserPlus size={14} />
                {submitting ? "Creando…" : "Crear cliente"}
              </button>
            </div>
          </form>
        )}
      </aside>
    </>
  );
}
