"use client";

import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FormState = {
  nombre: string;
  telefono: string;
  empresa: string;
  ciudad: string;
  tipo: string;
  fuente: string;
  temperatura: string;
  valorEstimado: string;
  productosInteresados: string;
  notas: string;
};

const EMPTY: FormState = {
  nombre: "",
  telefono: "",
  empresa: "",
  ciudad: "",
  tipo: "TALLER",
  fuente: "WHATSAPP",
  temperatura: "CALIENTE",
  valorEstimado: "",
  productosInteresados: "",
  notas: "",
};

const TIPOS = [
  { value: "MINORISTA", label: "Minorista" },
  { value: "TALLER", label: "Taller" },
  { value: "DISTRIBUIDOR_LOCAL", label: "Dist. Local" },
  { value: "DISTRIBUIDOR_REGIONAL", label: "Dist. Regional" },
  { value: "VIP", label: "VIP" },
];

const FUENTES = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "ADS", label: "Ads" },
  { value: "REFERIDO", label: "Referido" },
  { value: "ORGANICO", label: "Orgánico" },
  { value: "DIRECTO", label: "Directo" },
  { value: "TIENDA_WEB", label: "Tienda web" },
];

const TEMP_COLORS: Record<string, string> = {
  CALIENTE: "var(--color-danger)",
  TIBIO: "var(--color-gold)",
  FRIO: "var(--text-muted)",
};

export function NuevoLeadModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function reset() {
    setForm(EMPTY);
    setError("");
    setDone(false);
  }

  function close() {
    setOpen(false);
    setTimeout(reset, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const productosArray = form.productosInteresados
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        empresa: form.empresa.trim() || null,
        ciudad: form.ciudad.trim() || null,
        tipo: form.tipo,
        fuente: form.fuente,
        temperatura: form.temperatura,
        valorEstimado: form.valorEstimado ? parseFloat(form.valorEstimado) : null,
        productosInteresados: productosArray,
        notas: form.notas.trim() || null,
      }),
    });

    setSubmitting(false);

    if (res.ok) {
      setDone(true);
      router.refresh();
      setTimeout(() => { close(); }, 1200);
    } else {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "No se pudo crear el lead.");
    }
  }

  const inputCls = "mt-1.5 h-10 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]";
  const inputStyle = { border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" } as React.CSSProperties;
  const labelCls = "text-[10px] font-black uppercase tracking-widest";
  const labelStyle = { color: "var(--text-muted)" } as React.CSSProperties;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase text-black transition hover:opacity-90"
        style={{ background: "var(--color-gold)" }}
      >
        <Plus size={14} /> Nuevo lead
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={close}
          />

          {/* Panel */}
          <div
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              borderLeft: "1px solid var(--border)",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.35)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--color-gold)" }}>
                  CRM
                </p>
                <h2 className="mt-0.5 font-display-kinetic text-xl uppercase">Nuevo lead</h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded p-2 transition hover:opacity-70"
                style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                <X size={16} />
              </button>
            </div>

            {done ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <div
                  className="flex size-14 items-center justify-center rounded-full"
                  style={{ background: "var(--bg-elevated)", color: "var(--color-gold)" }}
                >
                  <Plus size={24} />
                </div>
                <p className="text-lg font-black uppercase">Lead creado</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Aparece en la columna <strong>Nuevo</strong> del pipeline.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="space-y-5 px-6 py-5">

                  {/* Nombre + Teléfono */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls} style={labelStyle}>Nombre / Empresa *</label>
                      <input
                        type="text"
                        value={form.nombre}
                        onChange={field("nombre")}
                        required
                        placeholder="Carlos Mendoza"
                        className={inputCls}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className={labelCls} style={labelStyle}>Teléfono *</label>
                      <input
                        type="text"
                        value={form.telefono}
                        onChange={field("telefono")}
                        required
                        placeholder="+58 414-0000000"
                        className={inputCls}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Empresa + Ciudad */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls} style={labelStyle}>Razón social</label>
                      <input
                        type="text"
                        value={form.empresa}
                        onChange={field("empresa")}
                        placeholder="Taller Las Mercedes"
                        className={inputCls}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className={labelCls} style={labelStyle}>Ciudad</label>
                      <input
                        type="text"
                        value={form.ciudad}
                        onChange={field("ciudad")}
                        placeholder="Caracas"
                        className={inputCls}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className={labelCls} style={labelStyle}>Tipo de cliente</label>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {TIPOS.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, tipo: t.value }))}
                          className="px-3 py-1.5 text-xs font-black uppercase transition"
                          style={{
                            border: `1px solid ${form.tipo === t.value ? "var(--color-gold)" : "var(--border)"}`,
                            background: form.tipo === t.value ? "var(--color-gold)" : "var(--bg-elevated)",
                            color: form.tipo === t.value ? "#000" : "var(--text-secondary)",
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Temperatura */}
                  <div>
                    <label className={labelCls} style={labelStyle}>Temperatura del lead</label>
                    <div className="mt-2 flex gap-2">
                      {["CALIENTE", "TIBIO", "FRIO"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, temperatura: t }))}
                          className="flex-1 py-2 text-xs font-black uppercase transition"
                          style={{
                            border: `1px solid ${form.temperatura === t ? TEMP_COLORS[t] : "var(--border)"}`,
                            background: form.temperatura === t ? `color-mix(in srgb, ${TEMP_COLORS[t]} 15%, var(--bg-elevated))` : "var(--bg-elevated)",
                            color: form.temperatura === t ? TEMP_COLORS[t] : "var(--text-muted)",
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fuente */}
                  <div>
                    <label className={labelCls} style={labelStyle}>Fuente del lead</label>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {FUENTES.map((f) => (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, fuente: f.value }))}
                          className="px-3 py-1.5 text-xs font-bold uppercase transition"
                          style={{
                            border: `1px solid ${form.fuente === f.value ? "var(--color-gold)" : "var(--border)"}`,
                            background: form.fuente === f.value ? "var(--bg-elevated)" : "transparent",
                            color: form.fuente === f.value ? "var(--color-gold)" : "var(--text-muted)",
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Valor estimado + Productos */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls} style={labelStyle}>Valor estimado USD</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.valorEstimado}
                        onChange={field("valorEstimado")}
                        placeholder="0.00"
                        className={`${inputCls} text-right font-mono`}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className={labelCls} style={labelStyle}>Productos (separados por coma)</label>
                      <input
                        type="text"
                        value={form.productosInteresados}
                        onChange={field("productosInteresados")}
                        placeholder="Aceite 5W-40, Filtro K&N"
                        className={inputCls}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Notas */}
                  <div>
                    <label className={labelCls} style={labelStyle}>Notas internas</label>
                    <textarea
                      rows={3}
                      value={form.notas}
                      onChange={field("notas")}
                      placeholder="Contexto del lead, urgencia, preferencias…"
                      className="mt-1.5 w-full resize-none px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-gold)]"
                      style={inputStyle}
                    />
                  </div>

                  {error && (
                    <p className="text-xs font-bold" style={{ color: "var(--color-danger)" }}>
                      {error}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div
                  className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4"
                  style={{ borderTop: "1px solid var(--border)", background: "var(--bg-surface)" }}
                >
                  <button
                    type="button"
                    onClick={close}
                    className="px-4 py-2.5 text-xs font-bold uppercase transition hover:opacity-80"
                    style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-black transition hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--color-gold)" }}
                  >
                    <Plus size={13} />
                    {submitting ? "Creando…" : "Crear lead"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </>
  );
}
