"use client";

import { MessageSquare, Phone, Mail, Users, FileText, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TIPO_OPTIONS = [
  { value: "LLAMADA",   label: "Llamada telefónica", Icon: Phone },
  { value: "WHATSAPP",  label: "WhatsApp",            Icon: MessageSquare },
  { value: "EMAIL",     label: "Email",               Icon: Mail },
  { value: "REUNION",   label: "Reunión",             Icon: Users },
  { value: "NOTA",      label: "Nota interna",        Icon: FileText },
] as const;

type Tipo = (typeof TIPO_OPTIONS)[number]["value"];

export function RegistrarInteraccionModal({ clienteId }: { clienteId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<Tipo>("LLAMADA");
  const [descripcion, setDescripcion] = useState("");
  const [resultado, setResultado] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function close() {
    setOpen(false);
    setDescripcion("");
    setResultado("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!descripcion.trim()) {
      setError("La descripción es requerida.");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/admin/clientes/${clienteId}/interacciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, descripcion, resultado }),
    });

    setSubmitting(false);

    if (res.ok) {
      close();
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "No se pudo registrar.");
    }
  }

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase transition hover:opacity-80"
        style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--bg-input)" }}
      >
        <Plus size={12} /> Registrar interacción
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={close}
          />

          {/* Slide-in panel */}
          <div
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col"
            style={{
              background: "var(--bg-surface)",
              borderLeft: "1px solid var(--border)",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.25)",
            }}
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
            >
              <p className="text-sm font-black uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>
                Registrar interacción
              </p>
              <button
                type="button"
                onClick={close}
                className="grid size-7 place-items-center transition hover:opacity-80"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">

              {/* Tipo selector — icon grid */}
              <div>
                <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                  Tipo de interacción
                </label>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {TIPO_OPTIONS.map(({ value, label, Icon }) => {
                    const active = tipo === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setTipo(value)}
                        title={label}
                        className="flex flex-col items-center gap-1.5 py-3 text-[10px] font-black uppercase transition"
                        style={{
                          border: `1px solid ${active ? "var(--color-gold)" : "var(--border)"}`,
                          background: active ? "color-mix(in srgb, var(--color-gold) 12%, var(--bg-card))" : "var(--bg-card)",
                          color: active ? "var(--color-gold)" : "var(--text-muted)",
                        }}
                      >
                        <Icon size={16} />
                        <span className="leading-none">{label.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-center text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                  {TIPO_OPTIONS.find((o) => o.value === tipo)?.label}
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label
                  htmlFor="descripcion"
                  className="block text-xs font-bold uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  Descripción *
                </label>
                <textarea
                  id="descripcion"
                  rows={4}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="mt-2 w-full resize-none px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-gold)]"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--bg-input)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="¿De qué trató la interacción? ¿Qué se habló?"
                />
              </div>

              {/* Resultado */}
              <div>
                <label
                  htmlFor="resultado"
                  className="block text-xs font-bold uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  Resultado / próximo paso <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(opcional)</span>
                </label>
                <input
                  id="resultado"
                  type="text"
                  value={resultado}
                  onChange={(e) => setResultado(e.target.value)}
                  className="mt-2 h-11 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--bg-input)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Ej: Cliente confirmó pago para el viernes"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm font-bold" style={{ color: "var(--color-danger)" }}>
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="mt-auto flex justify-end gap-3 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
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
                  className="px-6 py-2.5 text-xs font-black uppercase text-black transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--color-gold)" }}
                >
                  {submitting ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
