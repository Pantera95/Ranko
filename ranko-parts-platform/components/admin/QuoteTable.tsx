"use client";

import { ArrowRightCircle, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { EstadoCotizacion } from "@prisma/client";
import type { QuoteRow } from "@/lib/quotes";
import { cn } from "@/lib/utils";

type QuoteTableProps = {
  initialQuotes: QuoteRow[];
  isFallback: boolean;
};

const ESTADO_LABELS: Record<EstadoCotizacion, string> = {
  BORRADOR: "Borrador",
  ENVIADA: "Enviada",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
  VENCIDA: "Vencida",
};

const ESTADO_STYLES: Record<EstadoCotizacion, string> = {
  BORRADOR: "bg-zinc-100 text-zinc-600",
  ENVIADA: "bg-blue-100 text-blue-700",
  ACEPTADA: "bg-green-100 text-green-700",
  RECHAZADA: "bg-red-50 text-red-600",
  VENCIDA: "bg-red-100 text-red-700",
};

const TRANSICIONES: Partial<Record<EstadoCotizacion, EstadoCotizacion[]>> = {
  BORRADOR: ["ENVIADA"],
  ENVIADA: ["ACEPTADA", "RECHAZADA", "VENCIDA"],
  ACEPTADA: [],
  RECHAZADA: [],
  VENCIDA: [],
};

export function QuoteTable({ initialQuotes, isFallback }: QuoteTableProps) {
  const router = useRouter();
  const [quotes, setQuotes] = useState(initialQuotes);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [converting, setConverting] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quotes;
    return quotes.filter((c) =>
      [c.numero, c.cliente, c.empresa, ESTADO_LABELS[c.estado]].join(" ").toLowerCase().includes(q),
    );
  }, [quotes, query]);

  async function updateEstado(id: string, estado: EstadoCotizacion) {
    const previous = quotes;
    setQuotes((curr) => curr.map((q) => (q.id === id ? { ...q, estado } : q)));
    setMessage("");

    const res = await fetch(`/api/admin/cotizaciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });

    if (!res.ok) {
      setQuotes(previous);
      setMessage(
        isFallback
          ? "Cambio visual solamente: conecta la base para persistir."
          : "No se pudo cambiar el estado.",
      );
    }
  }

  async function convertir(id: string) {
    setConverting(id);
    setMessage("");

    const res = await fetch(`/api/admin/cotizaciones/${id}/convertir`, { method: "POST" });

    if (res.ok) {
      const data = (await res.json()) as { factura: { numero: string } };
      setQuotes((curr) =>
        curr.map((q) => (q.id === id ? { ...q, convertidaAFactura: true } : q)),
      );
      setMessage(`Factura ${data.factura.numero} creada. Ve a Facturacion para gestionarla.`);
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setMessage(
        isFallback
          ? "Conversion visual solamente: conecta la base para persistir."
          : (data.error ?? "No se pudo convertir la cotizacion."),
      );
    }

    setConverting(null);
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
          {filtered.length} / {quotes.length} cotizaciones
        </p>
      </div>

      {message ? (
        <div className="mt-4 p-4 text-sm" style={{ border: "1px solid var(--color-gold-muted)", background: "var(--bg-card)", color: "var(--text-secondary)" }}>
          {message}
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto" style={{ border: "1px solid var(--border)" }}>
        <table className="min-w-[900px] w-full border-collapse text-left text-sm" style={{ background: "var(--bg-card)" }}>
          <thead className="text-xs uppercase" style={{ background: "var(--bg-base)", color: "var(--text-muted)" }}>
            <tr>
              <th className="px-4 py-3">Numero</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Validez</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => {
              const siguientes = TRANSICIONES[q.estado] ?? [];

              return (
                <tr key={q.id} className="align-top" style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/cotizaciones/${q.id}`}
                      className="inline-flex items-center gap-1.5 font-mono font-black transition hover:opacity-80"
                      style={{ color: "var(--color-gold)" }}
                    >
                      {q.numero} <ExternalLink size={11} />
                    </Link>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{q.vendedor}</p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-bold" style={{ color: "var(--text-primary)" }}>{q.cliente}</p>
                    {q.empresa ? (
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{q.empresa}</p>
                    ) : null}
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-mono font-black" style={{ color: "var(--text-primary)" }}>{q.total}</p>
                    {q.descuento !== "$0.00" ? (
                      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>Dto {q.descuento}</p>
                    ) : null}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-block rounded px-2 py-1 text-[10px] font-black uppercase",
                        ESTADO_STYLES[q.estado],
                      )}
                      style={q.estado === "VENCIDA" ? { background: "color-mix(in srgb, var(--color-danger) 15%, var(--bg-elevated))" } : undefined}
                    >
                      {ESTADO_LABELS[q.estado]}
                    </span>
                    {q.convertidaAFactura ? (
                      <p className="mt-1 text-[10px] font-bold uppercase text-[var(--color-success)]">
                        ✓ Facturada
                      </p>
                    ) : null}
                  </td>

                  <td className="px-4 py-4 font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                    {q.validezDias}d
                  </td>

                  <td className="px-4 py-4 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{q.createdAt}</td>

                  <td className="px-4 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      {siguientes.map((sig) => (
                        <button
                          className="rounded px-3 py-1.5 text-xs font-bold transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                          style={{ border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-secondary)" }}
                          key={sig}
                          onClick={() => updateEstado(q.id, sig)}
                          type="button"
                        >
                          → {ESTADO_LABELS[sig]}
                        </button>
                      ))}

                      {q.estado === "ACEPTADA" && !q.convertidaAFactura ? (
                        <button
                          className="inline-flex items-center gap-1.5 rounded border border-[var(--color-gold)] bg-[var(--color-gold)] px-3 py-1.5 text-xs font-black text-black transition hover:bg-[var(--color-gold-hover)] disabled:opacity-50"
                          disabled={converting === q.id}
                          onClick={() => convertir(q.id)}
                          type="button"
                        >
                          <ArrowRightCircle size={13} />
                          {converting === q.id ? "Convirtiendo..." : "Convertir a Factura"}
                        </button>
                      ) : null}
                    </div>
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
