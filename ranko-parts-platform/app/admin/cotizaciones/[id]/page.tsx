"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileText,
  MessageSquare,
  Printer,
  RefreshCw,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type CotizacionItem = {
  id: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  total: number;
  producto: { nombre: string; sku: string; marca: string };
};

type Cotizacion = {
  id: string;
  numero: string;
  estado: string;
  subtotal: number;
  descuento: number;
  total: number;
  listaPrecios: number;
  validezDias: number;
  notas: string | null;
  enviadaPorWhatsApp: boolean;
  enviadaPorEmail: boolean;
  convertidaAFactura: boolean;
  createdAt: string;
  updatedAt: string;
  cliente: {
    id: string;
    nombre: string;
    empresa: string | null;
    rif: string | null;
    telefono: string;
    whatsapp: string | null;
    email: string | null;
    ciudad: string | null;
  };
  usuario: { nombre: string; email: string };
  items: CotizacionItem[];
  factura: { id: string; numero: string } | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ESTADO_STYLES: Record<string, string> = {
  BORRADOR: "bg-zinc-100 text-zinc-600",
  ENVIADA: "bg-blue-100 text-blue-700",
  ACEPTADA: "bg-green-100 text-green-700",
  RECHAZADA: "bg-red-100 text-red-700",
  VENCIDA: "bg-zinc-100 text-zinc-500",
};

const NEXT_ESTADO: Record<string, { label: string; value: string }[]> = {
  BORRADOR: [{ label: "Marcar enviada", value: "ENVIADA" }],
  ENVIADA: [
    { label: "Aceptada", value: "ACEPTADA" },
    { label: "Rechazada", value: "RECHAZADA" },
  ],
  ACEPTADA: [],
  RECHAZADA: [],
  VENCIDA: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function money(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-VE", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function expiryDate(createdAt: string, validezDias: number) {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + validezDias);
  return d;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CotizacionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cot, setCot] = useState<Cotizacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [updatingEstado, setUpdatingEstado] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/cotizaciones/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCot(data);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar la cotización.");
        setLoading(false);
      });
  }, [id]);

  async function handleEstado(estado: string) {
    if (!cot) return;
    setUpdatingEstado(true);
    const res = await fetch(`/api/admin/cotizaciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setUpdatingEstado(false);
    if (res.ok) {
      setCot((prev) => prev ? { ...prev, estado } : prev);
    } else {
      setMessage("No se pudo actualizar el estado.");
    }
  }

  async function handleConvertir() {
    if (!cot) return;
    setConverting(true);
    const res = await fetch(`/api/admin/cotizaciones/${id}/convertir`, { method: "POST" });
    setConverting(false);
    if (res.ok) {
      const data = await res.json() as { factura: { id: string; numero: string } };
      setCot((prev) => prev ? { ...prev, convertidaAFactura: true, factura: data.factura } : prev);
      setMessage(`✓ Factura ${data.factura.numero} creada correctamente.`);
    } else {
      setMessage("No se pudo convertir la cotización.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center" style={{ color: "var(--text-muted)" }}>
        <RefreshCw size={20} className="animate-spin" />
      </main>
    );
  }

  if (error || !cot) {
    return (
      <main className="p-6 text-center" style={{ color: "var(--text-muted)" }}>
        <p className="font-bold uppercase">{error || "Cotización no encontrada."}</p>
        <Link href="/admin/cotizaciones" className="mt-4 inline-block text-sm underline">
          Volver a Cotizaciones
        </Link>
      </main>
    );
  }

  const expiry = expiryDate(cot.createdAt, cot.validezDias);
  const isExpired = expiry < new Date() && cot.estado !== "ACEPTADA" && cot.estado !== "RECHAZADA";
  const subtotal = cot.subtotal;
  const descuento = cot.descuento;
  const total = cot.total;
  const nextStates = NEXT_ESTADO[cot.estado] ?? [];

  const waMsg = encodeURIComponent(
    `Hola ${cot.cliente.nombre}, te enviamos la cotización ${cot.numero} por un total de ${money(total)}. Por favor confirma si deseas proceder.`,
  );
  const waHref = cot.cliente.whatsapp
    ? `https://wa.me/${cot.cliente.whatsapp.replace(/\D/g, "")}?text=${waMsg}`
    : cot.cliente.telefono
    ? `https://wa.me/${cot.cliente.telefono.replace(/\D/g, "")}?text=${waMsg}`
    : null;

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <div className="mx-auto max-w-5xl">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/admin/cotizaciones"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition hover:opacity-100"
            style={{ color: "var(--text-muted)", opacity: 0.7 }}
          >
            <ChevronLeft size={13} /> Cotizaciones
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="hidden items-center gap-2 px-4 py-2 text-xs font-black uppercase transition hover:opacity-80 sm:inline-flex"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <Printer size={13} /> Imprimir
          </button>
        </div>

        {/* Flash message */}
        {message && (
          <div
            className="mt-4 flex items-center gap-3 p-4 text-sm"
            style={{
              border: `1px solid ${message.startsWith("✓") ? "var(--color-success)" : "var(--color-danger)"}`,
              background: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          >
            {message.startsWith("✓") ? <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} /> : null}
            {message}
            {cot.factura && (
              <Link
                href={`/admin/facturacion/${cot.factura.id}`}
                className="ml-auto flex items-center gap-1 text-xs font-bold uppercase hover:opacity-80"
                style={{ color: "var(--color-gold)" }}
              >
                Ver factura <ArrowRight size={12} />
              </Link>
            )}
          </div>
        )}

        {/* Expiry warning */}
        {isExpired && (
          <div
            className="mt-4 flex items-start gap-3 p-4 text-sm"
            style={{ border: "1px solid var(--color-gold)", background: "var(--bg-card)" }}
          >
            <Clock size={16} className="mt-0.5 shrink-0" style={{ color: "var(--color-gold)" }} />
            <p>
              Esta cotización expiró el <strong>{fmtDate(expiry.toISOString())}</strong>. El cliente puede necesitar una cotización actualizada.
            </p>
          </div>
        )}

        {/* Quote header */}
        <div
          className="mt-4 p-6 sm:p-8"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          {/* Top row */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-2xl font-black uppercase" style={{ color: "var(--text-primary)" }}>
                Ranko <span style={{ color: "var(--color-gold)" }}>Parts</span>
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                Cotización de venta
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-3xl font-black">{cot.numero}</p>
              <div className="mt-2 flex justify-end gap-2">
                <span className={cn("rounded px-2 py-0.5 text-xs font-black uppercase", ESTADO_STYLES[cot.estado] ?? "bg-zinc-100 text-zinc-500")}>
                  {cot.estado}
                </span>
                <span
                  className="rounded px-2 py-0.5 text-xs font-bold uppercase"
                  style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                >
                  Lista {cot.listaPrecios}
                </span>
              </div>
            </div>
          </div>

          {/* Dates / meta */}
          <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-3" style={{ borderColor: "var(--border)" }}>
            <div>
              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Emitida</p>
              <p className="mt-1 font-bold">{fmtDate(cot.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Vence</p>
              <p className="mt-1 font-bold" style={{ color: isExpired ? "var(--color-danger)" : "var(--text-primary)" }}>
                {fmtDate(expiry.toISOString())}
                <span className="ml-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                  ({cot.validezDias}d)
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Preparada por</p>
              <p className="mt-1 text-sm font-bold">{cot.usuario.nombre}</p>
            </div>
          </div>

          {/* Channels sent */}
          <div className="mt-4 flex flex-wrap gap-2">
            {cot.enviadaPorWhatsApp && (
              <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-[10px] font-black uppercase text-green-700">
                <MessageSquare size={10} /> Enviada por WhatsApp
              </span>
            )}
            {cot.enviadaPorEmail && (
              <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase text-blue-700">
                <FileText size={10} /> Enviada por Email
              </span>
            )}
            {cot.convertidaAFactura && cot.factura && (
              <Link
                href={`/admin/facturacion/${cot.factura.id}`}
                className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-[10px] font-black uppercase text-green-700 hover:opacity-80"
              >
                <CheckCircle2 size={10} /> Factura {cot.factura.numero}
              </Link>
            )}
          </div>

          {/* Client */}
          <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2" style={{ borderColor: "var(--border)" }}>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                <User size={11} /> Cotización para
              </p>
              <div className="mt-2">
                <Link
                  href={`/admin/clientes/${cot.cliente.id}`}
                  className="font-black uppercase transition hover:opacity-80"
                  style={{ color: "var(--text-primary)" }}
                >
                  {cot.cliente.nombre}
                </Link>
                {cot.cliente.empresa && (
                  <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>{cot.cliente.empresa}</p>
                )}
                {cot.cliente.rif && (
                  <p className="mt-0.5 font-mono text-xs" style={{ color: "var(--text-muted)" }}>RIF {cot.cliente.rif}</p>
                )}
                {cot.cliente.ciudad && (
                  <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{cot.cliente.ciudad}</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Contacto</p>
              <p className="mt-2 font-mono text-sm">{cot.cliente.telefono}</p>
              {cot.cliente.email && (
                <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{cot.cliente.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Line items */}
        <section
          className="mt-4"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full border-collapse text-sm">
              <thead style={{ background: "var(--bg-elevated)" }}>
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>Producto</th>
                  <th className="px-5 py-3 text-center text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>Cant.</th>
                  <th className="px-5 py-3 text-right text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>P. Unit.</th>
                  <th className="px-5 py-3 text-right text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>Desc.</th>
                  <th className="px-5 py-3 text-right text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {cot.items.map((item) => (
                  <tr key={item.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <td className="px-5 py-4">
                      <p className="font-bold">{item.producto.nombre}</p>
                      <p className="mt-0.5 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                        {item.producto.marca} · {item.producto.sku}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-center font-mono font-black">{item.cantidad}</td>
                    <td className="px-5 py-4 text-right font-mono">{money(item.precioUnitario)}</td>
                    <td className="px-5 py-4 text-right font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                      {item.descuento > 0 ? money(item.descuento) : "—"}
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-black">{money(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end px-5 py-5" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="grid w-full max-w-xs gap-2">
              <div className="flex items-center justify-between gap-8">
                <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Subtotal</p>
                <p className="font-mono text-sm">{money(subtotal)}</p>
              </div>
              {descuento > 0 && (
                <div className="flex items-center justify-between gap-8">
                  <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Descuento</p>
                  <p className="font-mono text-sm">− {money(descuento)}</p>
                </div>
              )}
              <div
                className="flex items-center justify-between gap-8 pt-3"
                style={{ borderTop: "2px solid var(--color-gold)" }}
              >
                <p className="text-sm font-black uppercase">Total</p>
                <p className="font-mono text-2xl font-black">{money(total)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Notes */}
        {cot.notas && (
          <div
            className="mt-4 p-4 text-sm"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
          >
            <p className="mb-2 text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>Notas</p>
            {cot.notas}
          </div>
        )}

        {/* Actions panel */}
        <section
          className="mt-4 p-5"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Acciones
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {/* WhatsApp send */}
            {waHref && cot.estado !== "RECHAZADA" && cot.estado !== "ACEPTADA" && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase text-white transition hover:opacity-90"
                style={{ background: "#25D366" }}
              >
                <MessageSquare size={13} /> Enviar por WhatsApp
              </a>
            )}

            {/* Estado transitions */}
            {nextStates.map((s) => (
              <button
                key={s.value}
                type="button"
                disabled={updatingEstado}
                onClick={() => handleEstado(s.value)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase transition hover:opacity-90 disabled:opacity-50"
                style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--bg-elevated)" }}
              >
                <ArrowRight size={13} /> {s.label}
              </button>
            ))}

            {/* Convert to invoice */}
            {cot.estado === "ACEPTADA" && !cot.convertidaAFactura && (
              <button
                type="button"
                disabled={converting}
                onClick={handleConvertir}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase text-black transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--color-gold)" }}
              >
                <CheckCircle2 size={13} />
                {converting ? "Generando..." : "Convertir a factura"}
              </button>
            )}

            {/* Already converted */}
            {cot.convertidaAFactura && cot.factura && (
              <Link
                href={`/admin/facturacion/${cot.factura.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase transition hover:opacity-80"
                style={{ border: "1px solid var(--color-success)", color: "var(--color-success)" }}
              >
                <FileText size={13} /> Ver factura {cot.factura.numero}
              </Link>
            )}

            {/* Nueva cotización para mismo cliente */}
            <Link
              href={`/admin/cotizaciones/nueva?clienteId=${cot.cliente.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase transition hover:opacity-80"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              <FileText size={13} /> Nueva cotización
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
