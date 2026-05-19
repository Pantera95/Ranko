"use client";

import { CreditCard, DollarSign, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const METODO_OPTIONS = [
  { value: "ZELLE",         label: "Zelle" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "EFECTIVO",      label: "Efectivo" },
  { value: "CREDITO",       label: "Crédito" },
  { value: "MIXTO",         label: "Mixto" },
] as const;

type Metodo = (typeof METODO_OPTIONS)[number]["value"];

type Props = {
  facturaId: string;
  facturaNumero: string;
  saldoPendiente: number;
  /** Invoice is already fully paid or annulled */
  disabled?: boolean;
};

export function RegistrarPagoModal({
  facturaId,
  facturaNumero,
  saldoPendiente,
  disabled = false,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [metodo, setMetodo] = useState<Metodo>("ZELLE");
  const [monto, setMonto] = useState<string>(saldoPendiente > 0 ? saldoPendiente.toFixed(2) : "");
  const [referencia, setReferencia] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [anomaly, setAnomaly] = useState("");

  function close() {
    setOpen(false);
    setError("");
    setAnomaly("");
    setReferencia("");
    setMonto(saldoPendiente > 0 ? saldoPendiente.toFixed(2) : "");
    setMetodo("ZELLE");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAnomaly("");

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("Ingresa un monto válido.");
      return;
    }

    setSubmitting(true);

    const res = await fetch("/api/admin/pagos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facturaId,
        monto: montoNum,
        metodo,
        referencia: referencia.trim() || undefined,
      }),
    });

    setSubmitting(false);

    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      pago?: { esAnomalo?: boolean; razonAnomalia?: string };
    };

    if (res.ok) {
      if (data.pago?.esAnomalo) {
        setAnomaly(
          `Pago registrado con alerta: ${data.pago.razonAnomalia}. Queda pendiente de verificación.`,
        );
      } else {
        close();
      }
      router.refresh();
    } else {
      setError(data.error ?? "No se pudo registrar el pago.");
    }
  }

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        style={{ background: "var(--color-gold)" }}
      >
        <Plus size={12} /> Registrar pago
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/50" onClick={close} />

          {/* Panel */}
          <div
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col"
            style={{
              background: "var(--bg-surface)",
              borderLeft: "1px solid var(--border)",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.25)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
            >
              <div>
                <p className="text-sm font-black uppercase" style={{ color: "var(--text-primary)" }}>
                  Registrar pago
                </p>
                <p className="mt-0.5 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  {facturaNumero}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="grid size-7 place-items-center transition hover:opacity-80"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Saldo badge */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                Saldo pendiente
              </p>
              <p
                className="font-mono text-lg font-black"
                style={{ color: saldoPendiente > 0 ? "var(--color-danger)" : "var(--color-success)" }}
              >
                ${saldoPendiente.toFixed(2)}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">

              {/* Monto */}
              <div>
                <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                  Monto *
                </label>
                <div className="relative mt-2">
                  <DollarSign
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="h-11 w-full pl-8 pr-3 text-right font-mono text-sm outline-none transition focus:border-[var(--color-gold)]"
                    style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
                    required
                  />
                </div>
                {saldoPendiente > 0 && (
                  <button
                    type="button"
                    onClick={() => setMonto(saldoPendiente.toFixed(2))}
                    className="mt-1 text-[10px] font-bold uppercase transition hover:opacity-80"
                    style={{ color: "var(--color-gold)" }}
                  >
                    Usar saldo completo →
                  </button>
                )}
              </div>

              {/* Método */}
              <div>
                <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                  Método de pago *
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {METODO_OPTIONS.map(({ value, label }) => {
                    const active = metodo === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMetodo(value)}
                        className="py-2 text-[11px] font-black uppercase transition"
                        style={{
                          border: `1px solid ${active ? "var(--color-gold)" : "var(--border)"}`,
                          background: active
                            ? "color-mix(in srgb, var(--color-gold) 12%, var(--bg-card))"
                            : "var(--bg-card)",
                          color: active ? "var(--color-gold)" : "var(--text-muted)",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Referencia */}
              <div>
                <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                  Referencia / confirmación{" "}
                  <span style={{ fontWeight: 400 }}>(opcional)</span>
                </label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="mt-2 h-11 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
                  placeholder="Nro. de confirmación, código Zelle…"
                />
              </div>

              {/* Anomaly warning */}
              {anomaly && (
                <div
                  className="p-3 text-xs"
                  style={{ border: "1px solid var(--color-gold)", background: "color-mix(in srgb, var(--color-gold) 8%, var(--bg-card))", color: "var(--text-primary)" }}
                >
                  <p className="font-black uppercase" style={{ color: "var(--color-gold)" }}>
                    Alerta detectada
                  </p>
                  <p className="mt-1">{anomaly}</p>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-2 font-bold uppercase underline"
                    style={{ color: "var(--color-gold)" }}
                  >
                    Cerrar
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-sm font-bold" style={{ color: "var(--color-danger)" }}>
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="mt-auto flex gap-3 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 py-2.5 text-xs font-bold uppercase transition hover:opacity-80"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !!anomaly}
                  className="flex flex-1 items-center justify-center gap-2 py-2.5 text-xs font-black uppercase text-black transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--color-gold)" }}
                >
                  <CreditCard size={12} />
                  {submitting ? "Registrando…" : "Confirmar pago"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
