import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  CreditCard,
  FileText,
  User,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnularFacturaButton } from "@/components/admin/AnularFacturaButton";
import { PrintButton } from "@/components/admin/PrintButton";
import { RegistrarPagoModal } from "@/components/admin/RegistrarPagoModal";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

const ESTADO_STYLES: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  PARCIAL: "bg-orange-100 text-orange-700",
  PAGADA: "bg-green-100 text-green-700",
  VENCIDA: "bg-red-100 text-red-700",
  ANULADA: "bg-zinc-100 text-zinc-500",
};

const METODO_LABELS: Record<string, string> = {
  ZELLE: "Zelle",
  TRANSFERENCIA: "Transferencia bancaria",
  EFECTIVO: "Efectivo",
  CREDITO: "Crédito",
  MIXTO: "Mixto",
};

const PAGO_ESTADO_STYLES: Record<string, string> = {
  PENDIENTE_VERIFICACION: "bg-amber-100 text-amber-700",
  CONFIRMADO: "bg-green-100 text-green-700",
  RECHAZADO: "bg-red-100 text-red-700",
  ANOMALO: "bg-red-100 text-red-700",
};

function money(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(d: Date) {
  return d.toLocaleString("es-VE", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

async function getFactura(id: string) {
  try {
    return await prisma.factura.findUnique({
      where: { id },
      include: {
        cliente: true,
        usuario: true,
        items: {
          include: { producto: true },
        },
        pagos: {
          orderBy: { createdAt: "desc" },
        },
        logs: {
          include: { usuario: true },
          orderBy: { timestamp: "desc" },
          take: 10,
        },
      },
    });
  } catch {
    return null;
  }
}

export default async function FacturaDetailPage({ params }: Props) {
  const { id } = await params;
  const f = await getFactura(id);

  if (!f) notFound();

  const subtotal = Number(f.subtotal);
  const descuento = Number(f.descuento);
  const impuesto = Number(f.impuesto);
  const total = Number(f.total);
  const montoPagado = Number(f.montoPagado);
  const saldo = Number(f.saldoPendiente);
  const isOverdue = f.estado === "VENCIDA";
  // Server component runs once per request; Date.now() is acceptable here as
  // "request time", but React Compiler flags it as impure. eslint-disable
  // keeps the warning quiet without changing behavior.
  // eslint-disable-next-line react-compiler/react-compiler
  const nowMs = Date.now();
  const diasVencida = isOverdue
    ? Math.floor((nowMs - f.fechaVencimiento.getTime()) / 86400000)
    : 0;

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <div className="mx-auto max-w-5xl">

        {/* Breadcrumb + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/facturacion"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition hover:opacity-100"
            style={{ color: "var(--text-muted)", opacity: 0.7 }}
          >
            <ChevronLeft size={13} /> Facturación
          </Link>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <RegistrarPagoModal
              facturaId={f.id}
              facturaNumero={f.numero}
              saldoPendiente={saldo}
              disabled={f.estado === "PAGADA" || f.estado === "ANULADA"}
            />
            <AnularFacturaButton facturaId={f.id} estado={f.estado} />
            <PrintButton />
          </div>
        </div>

        {/* Alert if overdue */}
        {isOverdue && (
          <div
            className="mt-4 flex items-start gap-3 p-4 text-sm"
            style={{ border: "1px solid var(--color-danger)", background: "color-mix(in srgb, var(--color-danger) 6%, var(--bg-card))" }}
          >
            <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: "var(--color-danger)" }} />
            <p>
              Esta factura lleva <strong>{diasVencida} días</strong> vencida sin pago completo.
              Saldo pendiente: <strong>{money(saldo)}</strong>
            </p>
          </div>
        )}

        {/* Invoice header */}
        <div
          className="mt-4 p-6 sm:p-8"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          {/* Top row: logo + estado */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-2xl font-black uppercase" style={{ color: "var(--text-primary)" }}>
                Ranko <span style={{ color: "var(--color-gold)" }}>Parts</span>
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                Factura de venta
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-3xl font-black">{f.numero}</p>
              <div className="mt-2 flex justify-end gap-2">
                <span className={cn("rounded px-2 py-0.5 text-xs font-black uppercase", ESTADO_STYLES[f.estado] ?? "bg-zinc-100 text-zinc-500")}>
                  {f.estado}
                </span>
                {f.metodoPago && (
                  <span
                    className="rounded px-2 py-0.5 text-xs font-bold uppercase"
                    style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                  >
                    {METODO_LABELS[f.metodoPago] ?? f.metodoPago}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2" style={{ borderColor: "var(--border)" }}>
            <div>
              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Fecha de emisión</p>
              <p className="mt-1 font-bold">{fmtDate(f.fechaEmision)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Vencimiento</p>
              <p className="mt-1 font-bold" style={{ color: isOverdue ? "var(--color-danger)" : "var(--text-primary)" }}>
                {fmtDate(f.fechaVencimiento)}
                {isOverdue && <span className="ml-2 text-xs">({diasVencida}d vencida)</span>}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Emitida por</p>
              <p className="mt-1 text-sm font-bold">{f.usuario.nombre}</p>
            </div>
            {f.cotizacionId && (
              <div>
                <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Cotización origen</p>
                <Link
                  href={`/admin/cotizaciones/${f.cotizacionId}`}
                  className="mt-1 inline-flex items-center gap-1 text-sm font-bold transition hover:opacity-80"
                  style={{ color: "var(--color-gold)" }}
                >
                  <FileText size={12} /> Ver cotización →
                </Link>
              </div>
            )}
          </div>

          {/* Client / Bill-to */}
          <div
            className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                <User size={11} /> Facturar a
              </p>
              <div className="mt-2">
                <Link
                  href={`/admin/clientes/${f.cliente.id}`}
                  className="font-black uppercase transition hover:opacity-80"
                  style={{ color: "var(--text-primary)" }}
                >
                  {f.cliente.nombre}
                </Link>
                {f.cliente.empresa && (
                  <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>{f.cliente.empresa}</p>
                )}
                {f.cliente.rif && (
                  <p className="mt-0.5 font-mono text-xs" style={{ color: "var(--text-muted)" }}>RIF {f.cliente.rif}</p>
                )}
                {f.cliente.ciudad && (
                  <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{f.cliente.ciudad}</p>
                )}
              </div>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                <CreditCard size={11} /> Condición de pago
              </p>
              <p className="mt-2 font-bold">{f.cliente.condicionPago ?? "Contado"}</p>
              {f.cliente.telefono && (
                <p className="mt-1 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{f.cliente.telefono}</p>
              )}
              {f.cliente.email && (
                <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{f.cliente.email}</p>
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
            <table className="min-w-[600px] w-full border-collapse text-sm" style={{ background: "var(--bg-card)" }}>
              <thead style={{ background: "var(--bg-elevated)" }}>
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>Producto</th>
                  <th className="px-5 py-3 text-center text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>Cant.</th>
                  <th className="px-5 py-3 text-right text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>Precio unit.</th>
                  <th className="px-5 py-3 text-right text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>Desc.</th>
                  <th className="px-5 py-3 text-right text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {f.items.map((item) => (
                  <tr key={item.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <td className="px-5 py-4">
                      <p className="font-bold">{item.producto.nombre}</p>
                      <p className="mt-0.5 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                        {item.producto.marca} · {item.producto.sku}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-center font-mono font-black">{item.cantidad}</td>
                    <td className="px-5 py-4 text-right font-mono">{money(Number(item.precioUnitario))}</td>
                    <td className="px-5 py-4 text-right font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                      {Number(item.descuento) > 0 ? money(Number(item.descuento)) : "—"}
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-black">{money(Number(item.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end px-5 py-5" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="grid w-full max-w-xs gap-2">
              {[
                { label: "Subtotal", value: money(subtotal) },
                ...(descuento > 0 ? [{ label: "Descuento", value: `− ${money(descuento)}` }] : []),
                ...(impuesto > 0 ? [{ label: "Impuesto (IVA)", value: money(impuesto) }] : []),
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-8">
                  <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>{row.label}</p>
                  <p className="font-mono text-sm">{row.value}</p>
                </div>
              ))}
              <div
                className="flex items-center justify-between gap-8 pt-3"
                style={{ borderTop: "2px solid var(--color-gold)" }}
              >
                <p className="text-sm font-black uppercase">Total</p>
                <p className="font-mono text-2xl font-black">{money(total)}</p>
              </div>
              {montoPagado > 0 && (
                <>
                  <div className="flex items-center justify-between gap-8">
                    <p className="text-xs font-bold uppercase" style={{ color: "var(--color-success)" }}>Pagado</p>
                    <p className="font-mono text-sm font-black" style={{ color: "var(--color-success)" }}>{money(montoPagado)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-8">
                    <p className="text-xs font-black uppercase" style={{ color: saldo > 0 ? "var(--color-danger)" : "var(--text-muted)" }}>
                      Saldo pendiente
                    </p>
                    <p
                      className="font-mono text-lg font-black"
                      style={{ color: saldo > 0 ? "var(--color-danger)" : "var(--color-success)" }}
                    >
                      {money(saldo)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Notes */}
        {f.notas && (
          <div
            className="mt-4 p-4 text-sm"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
          >
            <p className="mb-2 text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>Notas</p>
            {f.notas}
          </div>
        )}

        {/* Pagos */}
        {(f.pagos.length > 0 || (f.estado !== "PAGADA" && f.estado !== "ANULADA")) && (
          <section
            className="mt-4"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <div
              className="flex items-center justify-between gap-2 px-5 py-3"
              style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} style={{ color: "var(--color-gold)" }} />
                <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>
                  Pagos registrados ({f.pagos.length})
                </p>
              </div>
              {f.estado !== "PAGADA" && f.estado !== "ANULADA" && (
                <RegistrarPagoModal
                  facturaId={f.id}
                  facturaNumero={f.numero}
                  saldoPendiente={saldo}
                />
              )}
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {f.pagos.length === 0 && (
                <p className="px-5 py-4 text-sm" style={{ color: "var(--text-muted)" }}>
                  Sin pagos registrados. Usa el botón para registrar el primer pago.
                </p>
              )}
              {f.pagos.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span className={cn("shrink-0 rounded px-2 py-0.5 text-[10px] font-black uppercase", PAGO_ESTADO_STYLES[p.estado] ?? "bg-zinc-100 text-zinc-500")}>
                    {p.estado.replace("_", " ")}
                  </span>
                  {p.esAnomalo && (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-red-700">
                      Anómalo
                    </span>
                  )}
                  <p className="flex-1 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {METODO_LABELS[p.metodo] ?? p.metodo}
                    {p.referencia && (
                      <span className="ml-2 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                        #{p.referencia}
                      </span>
                    )}
                  </p>
                  <p className="font-mono font-black" style={{ color: "var(--color-success)" }}>
                    {money(Number(p.monto))}
                  </p>
                  <p className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    <Clock size={10} /> {fmtDateTime(p.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Audit log */}
        {f.logs.length > 0 && (
          <section
            className="mt-4"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <div
              className="flex items-center gap-2 px-5 py-3"
              style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
            >
              <Clock size={13} style={{ color: "var(--color-gold)" }} />
              <p className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
                Historial de cambios
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {f.logs.map((log) => (
                <div key={log.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-xs">
                  <span
                    className="shrink-0 rounded px-2 py-0.5 font-mono font-bold uppercase"
                    style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                  >
                    {log.accion.replace(/_/g, " ")}
                  </span>
                  <p className="flex-1" style={{ color: "var(--text-secondary)" }}>{log.usuario.nombre}</p>
                  <p style={{ color: "var(--text-muted)" }}>{fmtDateTime(log.timestamp)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
