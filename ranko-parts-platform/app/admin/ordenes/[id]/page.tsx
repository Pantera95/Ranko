import {
  CheckCircle2,
  ChevronLeft,
  Clock,
  MapPin,
  Package,
  Receipt,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AvanzarOrdenPanel } from "@/components/admin/AvanzarOrdenPanel";
import { PrintButton } from "@/components/admin/PrintButton";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

const ESTADO_STYLES: Record<string, string> = {
  CONFIRMADO: "bg-blue-100 text-blue-700",
  EN_PREPARACION: "bg-amber-100 text-amber-700",
  EN_CAMINO: "bg-purple-100 text-purple-700",
  ENTREGADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-700",
};

const ESTADO_LABELS: Record<string, string> = {
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparación",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const PIPELINE: string[] = [
  "CONFIRMADO",
  "EN_PREPARACION",
  "EN_CAMINO",
  "ENTREGADO",
];

type HistorialEntry = {
  estado: string;
  ts: string;
  nota?: string;
};

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("es-VE", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtDateTime(d: Date | string) {
  return new Date(d).toLocaleString("es-VE", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

async function getOrden(id: string) {
  try {
    return await prisma.orden.findUnique({
      where: { id },
      include: {
        cliente: true,
        factura: {
          select: {
            id: true,
            numero: true,
            total: true,
            estado: true,
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export default async function OrdenDetailPage({ params }: Props) {
  const { id } = await params;
  const orden = await getOrden(id);

  if (!orden) notFound();

  const historial: HistorialEntry[] = Array.isArray(orden.historialEstados)
    ? (orden.historialEstados as HistorialEntry[])
    : [];

  const isCancelled = orden.estado === "CANCELADO";
  const isDelivered = orden.estado === "ENTREGADO";
  const activeIdx = isCancelled ? -1 : PIPELINE.indexOf(orden.estado);

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <div className="mx-auto max-w-4xl">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/admin/ordenes"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition hover:opacity-100"
            style={{ color: "var(--text-muted)", opacity: 0.7 }}
          >
            <ChevronLeft size={13} /> Órdenes
          </Link>
          <PrintButton />
        </div>

        {/* Header */}
        <div
          className="mt-4 p-6"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
                Orden de despacho
              </p>
              <h1 className="mt-2 font-mono text-3xl font-black uppercase">{orden.codigo}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={cn("rounded px-2 py-0.5 text-xs font-black uppercase", ESTADO_STYLES[orden.estado] ?? "bg-zinc-100 text-zinc-500")}>
                  {ESTADO_LABELS[orden.estado] ?? orden.estado}
                </span>
                {orden.responsable && (
                  <span
                    className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold"
                    style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                  >
                    <User size={10} /> {orden.responsable}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right text-sm" style={{ color: "var(--text-muted)" }}>
              <p>Creada {fmtDate(orden.createdAt)}</p>
              {orden.estimadoEntrega && (
                <p className="mt-1 font-bold" style={{ color: isDelivered ? "var(--color-success)" : "var(--text-primary)" }}>
                  {isDelivered ? "Entregada" : "Est."} {fmtDate(orden.estimadoEntrega)}
                </p>
              )}
            </div>
          </div>

          {/* Client + Delivery address */}
          <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2" style={{ borderColor: "var(--border)" }}>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                <User size={11} /> Cliente
              </p>
              <Link
                href={`/admin/clientes/${orden.cliente.id}`}
                className="mt-2 block font-black uppercase transition hover:opacity-80"
                style={{ color: "var(--text-primary)" }}
              >
                {orden.cliente.nombre}
              </Link>
              {orden.cliente.empresa && (
                <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>{orden.cliente.empresa}</p>
              )}
              <p className="mt-0.5 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{orden.cliente.telefono}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                <MapPin size={11} /> Dirección de entrega
              </p>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                {orden.direccionEntrega ?? "Retira en tienda / No especificada"}
              </p>
            </div>
          </div>

          {/* Linked invoice */}
          <div className="mt-4 flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <Receipt size={13} style={{ color: "var(--text-muted)" }} />
            <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Factura vinculada</p>
            <Link
              href={`/admin/facturacion/${orden.factura.id}`}
              className="inline-flex items-center gap-1 font-mono text-sm font-black transition hover:opacity-80"
              style={{ color: "var(--color-gold)" }}
            >
              {orden.factura.numero} →
            </Link>
            <span className="ml-auto font-mono text-sm font-black">
              ${Number(orden.factura.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Tracking pipeline */}
        {!isCancelled && (
          <section
            className="mt-4 p-6"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Estado del pedido
            </p>
            <div className="mt-6 flex items-start gap-0">
              {PIPELINE.map((step, i) => {
                const done = i <= activeIdx;
                const active = i === activeIdx;
                const isLast = i === PIPELINE.length - 1;

                return (
                  <div key={step} className="flex flex-1 flex-col items-center">
                    <div className="flex w-full items-center">
                      {/* Connector left */}
                      <div
                        className="h-0.5 flex-1"
                        style={{ background: i === 0 ? "transparent" : done ? "var(--color-gold)" : "var(--bg-elevated)" }}
                      />
                      {/* Node */}
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: done ? "var(--color-gold)" : "var(--bg-elevated)",
                          border: `2px solid ${done ? "var(--color-gold)" : "var(--border)"}`,
                          boxShadow: active ? "0 0 0 3px color-mix(in srgb, var(--color-gold) 25%, transparent)" : "none",
                        }}
                      >
                        {done ? (
                          <CheckCircle2 size={14} style={{ color: "#000" }} />
                        ) : (
                          <span className="size-2 rounded-full" style={{ background: "var(--border)" }} />
                        )}
                      </div>
                      {/* Connector right */}
                      <div
                        className="h-0.5 flex-1"
                        style={{ background: isLast ? "transparent" : done && i < activeIdx ? "var(--color-gold)" : "var(--bg-elevated)" }}
                      />
                    </div>
                    <p
                      className="mt-2 text-center text-[10px] font-black uppercase"
                      style={{ color: active ? "var(--text-primary)" : done ? "var(--text-secondary)" : "var(--text-muted)" }}
                    >
                      {ESTADO_LABELS[step]}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Cancelled banner */}
        {isCancelled && (
          <div
            className="mt-4 flex items-start gap-3 p-4"
            style={{ border: "1px solid var(--color-danger)", background: "color-mix(in srgb, var(--color-danger) 6%, var(--bg-card))" }}
          >
            <XCircle size={16} className="mt-0.5 shrink-0" style={{ color: "var(--color-danger)" }} />
            <p className="text-sm">
              Esta orden fue <strong>cancelada</strong>.
              {historial.at(-1)?.nota && ` Motivo: ${historial.at(-1)!.nota}`}
            </p>
          </div>
        )}

        {/* Notes */}
        {orden.notasDespacho && (
          <div
            className="mt-4 p-4 text-sm"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
          >
            <p className="mb-2 text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>
              Notas de despacho
            </p>
            {orden.notasDespacho}
          </div>
        )}

        {/* History timeline */}
        {historial.length > 0 && (
          <section
            className="mt-4"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <div
              className="flex items-center gap-2 px-5 py-3"
              style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
            >
              <Clock size={13} style={{ color: "var(--color-gold)" }} />
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
                Historial de estados
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {[...historial].reverse().map((entry, i) => (
                <div key={i} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span className={cn("shrink-0 rounded px-2 py-0.5 text-[10px] font-black uppercase", ESTADO_STYLES[entry.estado] ?? "bg-zinc-100 text-zinc-500")}>
                    {ESTADO_LABELS[entry.estado] ?? entry.estado}
                  </span>
                  {entry.nota && (
                    <p className="flex-1 text-xs" style={{ color: "var(--text-secondary)" }}>{entry.nota}</p>
                  )}
                  <time className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>
                    {fmtDateTime(entry.ts)}
                  </time>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/admin/clientes/${orden.cliente.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase transition hover:opacity-80"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <User size={13} /> Ver cliente
          </Link>
          <Link
            href={`/admin/facturacion/${orden.factura.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase transition hover:opacity-80"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <Receipt size={13} /> Ver factura
          </Link>
          <Link
            href={`/orden/${orden.codigo}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase transition hover:opacity-80"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <Package size={13} /> Vista pública
          </Link>
        </div>

        {/* Inline state control — only shown when order is still active */}
        {!isCancelled && !isDelivered && (
          <AvanzarOrdenPanel ordenId={orden.id} estado={orden.estado as "CONFIRMADO" | "EN_PREPARACION" | "EN_CAMINO"} />
        )}
      </div>
    </main>
  );
}
