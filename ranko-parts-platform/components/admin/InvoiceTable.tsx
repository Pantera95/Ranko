"use client";

import { Ban, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { EstadoFactura } from "@prisma/client";
import type { InvoiceRow } from "@/lib/invoices";
import { cn } from "@/lib/utils";

type InvoiceTableProps = {
  initialInvoices: InvoiceRow[];
  isFallback: boolean;
};

const ESTADO_LABELS: Record<EstadoFactura, string> = {
  PENDIENTE: "Pendiente",
  PARCIAL: "Parcial",
  PAGADA: "Pagada",
  VENCIDA: "Vencida",
  ANULADA: "Anulada",
};

const ESTADO_STYLES: Record<EstadoFactura, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  PARCIAL: "bg-blue-100 text-blue-700",
  PAGADA: "bg-green-100 text-green-700",
  VENCIDA: "bg-red-100 text-red-700",
  ANULADA: "bg-zinc-100 text-zinc-500",
};

const AGING_STYLES: Record<InvoiceRow["agingBucket"], string> = {
  corriente: "text-[var(--text-muted)]",
  "30": "text-[var(--color-gold)]",
  "60": "text-orange-400",
  "90": "text-[var(--color-danger)]",
  critica: "text-[var(--color-danger)] font-black",
};

export function InvoiceTable({ initialInvoices, isFallback }: InvoiceTableProps) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((i) =>
      [i.numero, i.cliente, i.empresa, ESTADO_LABELS[i.estado], i.cotizacionNumero]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [invoices, query]);

  async function anular(id: string) {
    const previous = invoices;
    setInvoices((curr) =>
      curr.map((i) =>
        i.id === id ? { ...i, estado: "ANULADA" as EstadoFactura, saldoPendiente: "$0.00", saldoNum: 0 } : i,
      ),
    );
    setMessage("");

    const res = await fetch(`/api/admin/facturas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "ANULAR" }),
    });

    if (!res.ok) {
      setInvoices(previous);
      const data = (await res.json()) as { error?: string };
      setMessage(
        isFallback
          ? "Cambio visual solamente: conecta la base para persistir."
          : (data.error ?? "No se pudo anular la factura."),
      );
    }
  }

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <label className="relative block w-full sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            size={18}
            style={{ color: "var(--text-muted)" }}
          />
          <input
            className="h-11 w-full pl-10 pr-3 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--color-gold)]"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar numero, cliente o estado"
            style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            value={query}
          />
        </label>
        <p className="font-mono text-sm font-black" style={{ color: "var(--text-muted)" }}>
          {filtered.length} / {invoices.length} facturas
        </p>
      </div>

      {message ? (
        <div className="mt-4 p-4 text-sm" style={{ border: "1px solid var(--color-gold-muted)", background: "var(--bg-card)", color: "var(--text-secondary)" }}>
          {message}
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto" style={{ border: "1px solid var(--border)" }}>
        <table className="min-w-[960px] w-full border-collapse text-left text-sm" style={{ background: "var(--bg-card)" }}>
          <thead className="font-mono-tech text-xs" style={{ background: "var(--bg-base)", color: "var(--text-muted)" }}>
            <tr>
              <th className="px-4 py-3">Factura</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Saldo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Vencimiento</th>
              <th className="px-4 py-3">Aging</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => {
              const canAnular = inv.estado !== "ANULADA" && inv.estado !== "PAGADA";

              return (
                <tr
                  key={inv.id}
                  className={cn(
                    "align-top",
                    inv.estado === "ANULADA" && "opacity-40",
                  )}
                  style={{
                    borderTop: "1px solid var(--border)",
                    ...(inv.estado === "VENCIDA" ? { background: "color-mix(in srgb, var(--color-danger) 8%, var(--bg-card))" } : {}),
                  }}
                >
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/facturacion/${inv.id}`}
                      className="inline-flex items-center gap-1.5 font-mono font-black transition hover:opacity-80"
                      style={{ color: "var(--color-gold)" }}
                    >
                      {inv.numero} <ExternalLink size={11} />
                    </Link>
                    {inv.cotizacionNumero ? (
                      <p className="mt-1 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                        De {inv.cotizacionNumero}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{inv.fechaEmision}</p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-bold" style={{ color: "var(--text-primary)" }}>{inv.cliente}</p>
                    {inv.empresa ? (
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{inv.empresa}</p>
                    ) : null}
                  </td>

                  <td className="px-4 py-4 font-mono font-black" style={{ color: "var(--text-primary)" }}>{inv.total}</td>

                  <td className="px-4 py-4">
                    <p
                      className={cn(
                        "font-mono font-black",
                        inv.saldoNum > 0 ? "text-[var(--color-danger)]" : "text-[var(--color-success)]",
                      )}
                    >
                      {inv.saldoPendiente}
                    </p>
                    {inv.montoPagado !== "$0.00" ? (
                      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>Pagado {inv.montoPagado}</p>
                    ) : null}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-block rounded px-2 py-1 text-[10px] font-black uppercase",
                        ESTADO_STYLES[inv.estado],
                      )}
                      style={inv.estado === "VENCIDA" ? { background: "color-mix(in srgb, var(--color-danger) 15%, var(--bg-elevated))" } : undefined}
                    >
                      {ESTADO_LABELS[inv.estado]}
                    </span>
                    {inv.metodoPago ? (
                      <p className="mt-1 text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>{inv.metodoPago}</p>
                    ) : null}
                  </td>

                  <td className="px-4 py-4 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                    {inv.fechaVencimiento}
                  </td>

                  <td className="px-4 py-4">
                    {inv.diasVencida > 0 ? (
                      <span className={cn("font-mono text-xs", AGING_STYLES[inv.agingBucket])}>
                        +{inv.diasVencida}d
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-right">
                    {canAnular ? (
                      <button
                        className="inline-flex size-9 items-center justify-center border transition hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
                        style={{ borderColor: "var(--border)", background: "var(--bg-base)", color: "var(--text-muted)" }}
                        onClick={() => anular(inv.id)}
                        title="Anular factura"
                        type="button"
                      >
                        <Ban size={15} />
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
