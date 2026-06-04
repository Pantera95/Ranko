"use client";

import { CreditCard, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  facturaId: string;
  numero: string;
  saldoPendiente: string; // formatted display value, e.g. "$248.00"
  saldoNum: number; // numeric value for input default + max
};

const METODOS = [
  { value: "ZELLE", label: "Zelle" },
  { value: "TRANSFERENCIA", label: "Transferencia bancaria" },
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "CREDITO", label: "Crédito" },
  { value: "MIXTO", label: "Mixto" },
] as const;

const inputStyle: React.CSSProperties = {
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: 6,
};

export function ReportarPagoButton({ facturaId, numero, saldoPendiente, saldoNum }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    monto: saldoNum.toFixed(2),
    metodo: "ZELLE" as (typeof METODOS)[number]["value"],
    referencia: "",
    notas: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openModal() {
    setForm({
      monto: saldoNum.toFixed(2),
      metodo: "ZELLE",
      referencia: "",
      notas: "",
    });
    setError(null);
    setSubmitted(false);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const monto = parseFloat(form.monto);
    if (!Number.isFinite(monto) || monto <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/cliente/facturas/${facturaId}/reportar-pago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monto,
          metodo: form.metodo,
          referencia: form.referencia.trim() || null,
          notas: form.notas.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "No se pudo registrar el pago");
        return;
      }
      setSubmitted(true);
      // Refresh server data so balance / payment list reflect the pending claim
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-black uppercase text-black transition hover:opacity-90"
        style={{ background: "var(--color-gold)" }}
      >
        <CreditCard size={11} /> Reportar pago
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
            >
              <div className="flex items-center gap-2">
                <CreditCard size={13} style={{ color: "var(--color-gold)" }} />
                <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>
                  Reportar pago — {numero}
                </p>
              </div>
              <button type="button" onClick={closeModal}>
                <X size={14} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            <div className="px-5 py-4">
              {submitted ? (
                <>
                  <div
                    className="p-3 text-sm"
                    style={{
                      border: "1px solid var(--color-success)",
                      background: "var(--bg-elevated)",
                      color: "var(--color-success)",
                    }}
                  >
                    ✓ Pago reportado. Tu vendedor verificará el comprobante y aplicará el monto a tu factura.
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-4 w-full rounded px-4 py-2 text-xs font-black uppercase"
                    style={{ background: "var(--color-gold)", color: "#000" }}
                  >
                    Cerrar
                  </button>
                </>
              ) : (
                <form onSubmit={submit}>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Saldo pendiente:{" "}
                    <span className="font-mono font-black" style={{ color: "var(--text-primary)" }}>
                      {saldoPendiente}
                    </span>
                  </p>

                  <div className="mt-4 grid gap-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                        Monto pagado *
                      </label>
                      <input
                        type="number"
                        value={form.monto}
                        onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
                        min="0.01"
                        step="0.01"
                        className="w-full rounded px-3 py-2 font-mono text-sm"
                        style={inputStyle}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                        Método de pago *
                      </label>
                      <select
                        value={form.metodo}
                        onChange={(e) => setForm((f) => ({ ...f, metodo: e.target.value as typeof f.metodo }))}
                        className="w-full rounded px-3 py-2 text-sm"
                        style={inputStyle}
                      >
                        {METODOS.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                        Referencia / # de operación
                      </label>
                      <input
                        type="text"
                        value={form.referencia}
                        onChange={(e) => setForm((f) => ({ ...f, referencia: e.target.value }))}
                        placeholder="Ej: 1234567890"
                        className="w-full rounded px-3 py-2 font-mono text-sm"
                        style={inputStyle}
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                        Notas para el vendedor
                      </label>
                      <textarea
                        value={form.notas}
                        onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
                        rows={2}
                        placeholder="Banco origen, fecha de la transferencia, etc."
                        className="w-full resize-none rounded px-3 py-2 text-sm"
                        style={inputStyle}
                        maxLength={500}
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="mt-2 text-xs font-bold" style={{ color: "var(--color-danger)" }}>{error}</p>
                  )}

                  <p className="mt-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Tu reporte queda en verificación. El monto se aplicará a tu factura cuando tu vendedor confirme el comprobante.
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-1.5 rounded px-4 py-2 text-xs font-black uppercase disabled:opacity-50"
                      style={{ background: "var(--color-gold)", color: "#000" }}
                    >
                      {submitting ? <Loader2 size={11} className="animate-spin" /> : <CreditCard size={11} />}
                      Enviar reporte
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded px-4 py-2 text-xs font-black uppercase"
                      style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
