"use client";

import { AlertTriangle, CheckCircle, ExternalLink, Search, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { EstadoPago, MetodoPago } from "@prisma/client";
import type { PaymentFactura, PaymentRow } from "@/lib/payments";
import { cn } from "@/lib/utils";

type PaymentsPanelProps = {
  initialPayments: PaymentRow[];
  facturasPendientes: PaymentFactura[];
  isFallback: boolean;
};

const METODOS: MetodoPago[] = ["ZELLE", "TRANSFERENCIA", "EFECTIVO", "CREDITO", "MIXTO"];

const ESTADO_STYLES: Record<EstadoPago, string> = {
  PENDIENTE_VERIFICACION: "bg-amber-100 text-amber-700",
  CONFIRMADO: "bg-green-100 text-green-700",
  RECHAZADO: "bg-zinc-100 text-zinc-600",
  ANOMALO: "bg-red-100 text-red-700",
};

const ESTADO_LABELS: Record<EstadoPago, string> = {
  PENDIENTE_VERIFICACION: "Por verificar",
  CONFIRMADO: "Confirmado",
  RECHAZADO: "Rechazado",
  ANOMALO: "Anomalo",
};

export function PaymentsPanel({
  initialPayments,
  facturasPendientes,
  isFallback,
}: PaymentsPanelProps) {
  const router = useRouter();
  const [payments, setPayments] = useState(initialPayments);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  // New payment form state
  const [facturaId, setFacturaId] = useState("");
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState<MetodoPago>("ZELLE");
  const [referencia, setReferencia] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((p) =>
      [p.facturaNumero, p.cliente, p.referencia, ESTADO_LABELS[p.estado]].join(" ").toLowerCase().includes(q),
    );
  }, [payments, query]);

  const pendientesVerif = payments.filter((p) => p.estado === "PENDIENTE_VERIFICACION");

  async function accion(id: string, tipo: "CONFIRMAR" | "RECHAZAR" | "MARCAR_ANOMALIA") {
    const previous = payments;
    const nuevoEstado: EstadoPago =
      tipo === "CONFIRMAR" ? "CONFIRMADO" : tipo === "RECHAZAR" ? "RECHAZADO" : "ANOMALO";

    setPayments((curr) =>
      curr.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p)),
    );
    setMessage("");

    const res = await fetch(`/api/admin/pagos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: tipo }),
    });

    if (!res.ok) {
      setPayments(previous);
      setMessage(
        isFallback
          ? "Cambio visual solamente: conecta la base para persistir."
          : "No se pudo procesar la accion.",
      );
    } else {
      router.refresh();
    }
  }

  async function registrarPago(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!facturaId) { setFormError("Selecciona una factura."); return; }
    const montoNum = parseFloat(monto);
    if (!monto || isNaN(montoNum) || montoNum <= 0) { setFormError("Ingresa un monto valido."); return; }

    setSubmitting(true);

    const res = await fetch("/api/admin/pagos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facturaId, monto: montoNum, metodo, referencia: referencia.trim() || undefined }),
    });

    setSubmitting(false);

    if (res.ok) {
      const data = (await res.json()) as { pago: { esAnomalo: boolean; razonAnomalia: string | null } };
      setFacturaId(""); setMonto(""); setReferencia("");

      if (data.pago.esAnomalo) {
        setMessage(`Pago registrado con anomalia detectada: ${data.pago.razonAnomalia ?? "revisar manualmente"}`);
      } else {
        setMessage("Pago registrado. Pendiente de verificacion.");
      }
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setFormError(
        isFallback
          ? "Modo demo: conecta la base de datos para registrar pagos reales."
          : (data.error ?? "No se pudo registrar el pago."),
      );
    }
  }

  return (
    <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_400px]">
      {/* ─── Tabla de pagos ────────────────────────────────────────────────── */}
      <section>
        <div
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          <label className="relative block w-full sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
              size={18}
            />
            <input
              className="h-11 w-full pl-10 pr-3 text-sm outline-none transition focus:border-[var(--color-gold)]"
              style={{
                border: "1px solid var(--border)",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
              }}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar factura, cliente o referencia"
              value={query}
            />
          </label>
          <p className="font-mono text-sm font-black" style={{ color: "var(--text-muted)" }}>
            {filtered.length} / {payments.length} pagos
          </p>
        </div>

        {message ? (
          <div
            className="mt-4 p-4 text-sm"
            style={{
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
            }}
          >
            {message}
          </div>
        ) : null}

        {pendientesVerif.length > 0 ? (
          <div
            className="mt-4 p-4"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <p className="text-xs font-black uppercase tracking-widest text-[var(--color-gold)]">
              {pendientesVerif.length} pago{pendientesVerif.length !== 1 ? "s" : ""} por verificar
            </p>
            <div className="mt-3 grid gap-3">
              {pendientesVerif.map((p) => (
                <div
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 p-3",
                    p.esAnomalo
                      ? "border-[var(--color-danger)]"
                      : "",
                  )}
                  style={
                    p.esAnomalo
                      ? { border: "1px solid var(--color-danger)", background: "var(--bg-elevated)" }
                      : { border: "1px solid var(--border)", background: "var(--bg-surface)" }
                  }
                  key={p.id}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {p.esAnomalo ? (
                        <AlertTriangle className="text-[var(--color-danger)]" size={14} />
                      ) : null}
                      <Link
                        href={`/admin/facturacion/${p.facturaId}`}
                        className="inline-flex items-center gap-1 font-mono font-bold transition hover:opacity-80"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {p.facturaNumero} <ExternalLink size={10} />
                      </Link>
                      <span className="font-mono text-sm font-black text-[var(--color-gold)]">{p.monto}</span>
                    </div>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {p.cliente} · {p.metodo}{p.referencia ? ` · ${p.referencia}` : ""}
                    </p>
                    {p.esAnomalo && p.razonAnomalia ? (
                      <p className="mt-1 text-xs text-[var(--color-danger)]">{p.razonAnomalia}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="inline-flex items-center gap-1.5 rounded border border-[var(--color-success)] px-3 py-1.5 text-xs font-bold text-[var(--color-success)] transition hover:bg-[var(--color-success)] hover:text-black"
                      style={{ background: "var(--bg-input)" }}
                      onClick={() => accion(p.id, "CONFIRMAR")}
                      type="button"
                    >
                      <CheckCircle size={13} /> Confirmar
                    </button>
                    <button
                      className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
                      style={{
                        border: "1px solid var(--border)",
                        background: "var(--bg-input)",
                        color: "var(--text-secondary)",
                      }}
                      onClick={() => accion(p.id, "RECHAZAR")}
                      type="button"
                    >
                      <XCircle size={13} /> Rechazar
                    </button>
                    {!p.esAnomalo ? (
                      <button
                        className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition hover:text-[var(--color-gold)]"
                        style={{
                          border: "1px solid var(--border)",
                          background: "var(--bg-input)",
                          color: "var(--text-muted)",
                        }}
                        onClick={() => accion(p.id, "MARCAR_ANOMALIA")}
                        type="button"
                      >
                        <AlertTriangle size={13} /> Anomalia
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div
          className="mt-4 overflow-x-auto"
          style={{ border: "1px solid var(--border)" }}
        >
          <table
            className="min-w-[700px] w-full border-collapse text-left text-sm"
            style={{ background: "var(--bg-card)" }}
          >
            <thead
              className="text-xs uppercase"
              style={{ background: "var(--bg-base)", color: "var(--text-muted)" }}
            >
              <tr>
                <th className="px-4 py-3">Factura</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Metodo</th>
                <th className="px-4 py-3">Referencia</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  className={cn(p.esAnomalo && "bg-red-50")}
                  style={{ borderTop: "1px solid var(--border)" }}
                  key={p.id}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/facturacion/${p.facturaId}`}
                      className="inline-flex items-center gap-1 font-mono font-bold transition hover:opacity-80"
                      style={{ color: "var(--color-gold)" }}
                    >
                      {p.facturaNumero} <ExternalLink size={10} />
                    </Link>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                    {p.cliente}
                  </td>
                  <td
                    className="px-4 py-3 font-mono font-black"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {p.monto}
                  </td>
                  <td
                    className="px-4 py-3 text-xs uppercase"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {p.metodo}
                  </td>
                  <td
                    className="px-4 py-3 font-mono text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {p.referencia || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <span
                        className={cn(
                          "rounded px-2 py-1 text-[10px] font-black uppercase",
                          ESTADO_STYLES[p.estado],
                        )}
                      >
                        {ESTADO_LABELS[p.estado]}
                      </span>
                      {p.esAnomalo ? (
                        <AlertTriangle className="text-[var(--color-danger)]" size={12} />
                      ) : null}
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 font-mono text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {p.fechaPago}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── Registrar nuevo pago ──────────────────────────────────────────── */}
      <aside>
        <div
          className="p-5"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          <p
            className="text-xs font-black uppercase tracking-[0.18em]"
            style={{ color: "var(--text-secondary)" }}
          >
            Registrar pago
          </p>

          <form className="mt-5 grid gap-4" onSubmit={registrarPago}>
            <div>
              <label
                className="block text-xs font-bold uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                Factura *
              </label>
              <select
                className="mt-2 h-11 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--bg-input)",
                  color: "var(--text-primary)",
                }}
                onChange={(e) => setFacturaId(e.target.value)}
                required
                value={facturaId}
              >
                <option value="">— Seleccionar —</option>
                {facturasPendientes.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.numero} · {f.cliente} · ${f.saldoPendiente.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                Monto USD *
              </label>
              <input
                className="mt-2 h-11 w-full px-3 font-mono text-sm outline-none transition focus:border-[var(--color-gold)]"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--bg-input)",
                  color: "var(--text-primary)",
                }}
                min="0.01"
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                step="0.01"
                type="number"
                value={monto}
              />
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                Metodo *
              </label>
              <select
                className="mt-2 h-11 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--bg-input)",
                  color: "var(--text-primary)",
                }}
                onChange={(e) => setMetodo(e.target.value as MetodoPago)}
                value={metodo}
              >
                {METODOS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                Referencia / Confirmacion
              </label>
              <input
                className="mt-2 h-11 w-full px-3 font-mono text-sm outline-none transition focus:border-[var(--color-gold)]"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--bg-input)",
                  color: "var(--text-primary)",
                }}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="ZEL-YYYYMMDD-001"
                value={referencia}
              />
            </div>

            {formError ? (
              <p className="text-xs text-[var(--color-danger)]">{formError}</p>
            ) : null}

            <button
              className="h-11 w-full border border-[var(--color-gold)] bg-[var(--color-gold)] font-black text-black transition hover:bg-[var(--color-gold-hover)] disabled:opacity-50"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Registrando..." : "Registrar pago"}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
