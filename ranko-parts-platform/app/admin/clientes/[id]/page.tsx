import {
  Ban,
  ChevronLeft,
  FileText,
  MessageSquare,
  Phone,
  PhoneCall,
  Receipt,
  ReceiptText,
  Star,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BloquearButton } from "@/components/admin/BloquearButton";
import { ClienteEditPanel } from "@/components/admin/ClienteEditPanel";
import { InteraccionRowActions } from "@/components/admin/InteraccionRowActions";
import { PortalAccesoPanel } from "@/components/admin/PortalAccesoPanel";
import { RegistrarInteraccionModal } from "@/components/admin/RegistrarInteraccionModal";
import VehiculosPanel from "@/components/admin/VehiculosPanel";
import {
  getClienteDetail,
  TIPO_LABELS,
  TIPO_STYLES,
  INTERACCION_LABELS,
  FACTURA_ESTADO_STYLES,
  COT_ESTADO_STYLES,
} from "@/lib/cliente-detail";
import { getVendedoresSimple } from "@/lib/usuarios-admin";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

function money(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-VE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ClienteDetailPage({ params }: Props) {
  const { id } = await params;
  const [c, vendedores] = await Promise.all([
    getClienteDetail(id),
    getVendedoresSimple(),
  ]);

  if (!c) notFound();

  const whatsappMsg = encodeURIComponent(
    `Hola ${c.nombre}, te contactamos de Ranko Parts.`,
  );
  const waHref = c.whatsapp
    ? `https://wa.me/${c.whatsapp.replace(/\D/g, "")}?text=${whatsappMsg}`
    : undefined;

  const conversionRate =
    c.stats.cotizacionesTotal > 0
      ? Math.round((c.stats.cotizacionesAceptadas / c.stats.cotizacionesTotal) * 100)
      : 0;

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <div className="mx-auto max-w-6xl">

        {/* Breadcrumb */}
        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition hover:opacity-100"
          style={{ color: "var(--text-muted)", opacity: 0.7 }}
        >
          <ChevronLeft size={13} /> Clientes
        </Link>

        {/* Header */}
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="flex size-14 shrink-0 items-center justify-center text-2xl font-black uppercase"
              style={{ background: "var(--bg-elevated)", color: "var(--color-gold)", border: "1px solid var(--border)" }}
            >
              {c.nombre.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display-kinetic--tight text-2xl uppercase leading-tight sm:text-3xl">{c.nombre}</h1>
                <span className={cn("rounded px-2 py-0.5 text-[10px] font-black uppercase", TIPO_STYLES[c.tipo])}>
                  {TIPO_LABELS[c.tipo]}
                </span>
                {c.bloqueado && (
                  <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[10px] font-black uppercase text-red-700">
                    <Ban size={10} /> Bloqueado
                  </span>
                )}
                {!c.activo && (
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-black uppercase text-zinc-500">
                    Inactivo
                  </span>
                )}
              </div>
              {c.empresa && (
                <p className="mt-1 text-sm font-bold" style={{ color: "var(--text-secondary)" }}>{c.empresa}</p>
              )}
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                Cliente desde {fmtDate(c.createdAt)}
                {c.vendedorNombre ? ` · Vendedor: ${c.vendedorNombre}` : ""}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase text-white transition hover:opacity-90"
                style={{ background: "#25D366" }}
              >
                <MessageSquare size={12} /> WhatsApp
              </a>
            )}
            {c.telefono && (
              <a
                href={`tel:${c.telefono}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase transition"
                style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              >
                <PhoneCall size={12} /> {c.telefono}
              </a>
            )}
            <BloquearButton clienteId={c.id} bloqueado={c.bloqueado} />
            <Link
              href={`/admin/cotizaciones/nueva?clienteId=${c.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase text-black transition hover:opacity-90"
              style={{ background: "var(--color-gold)" }}
            >
              <FileText size={12} /> Nueva cotización
            </Link>
            <Link
              href={`/admin/facturacion/nueva?clienteId=${c.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase transition hover:opacity-80"
              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              <ReceiptText size={12} /> Nueva factura
            </Link>
          </div>
        </div>

        {/* KPI band */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total facturado", value: money(c.stats.totalFacturado), helper: "Historial de compras" },
            { label: "Deuda actual", value: money(c.stats.deudaActual), helper: "Pendiente + vencido", danger: c.stats.deudaActual > 0 },
            { label: "Cotizaciones", value: `${c.stats.cotizacionesAceptadas}/${c.stats.cotizacionesTotal}`, helper: `${conversionRate}% conversión` },
            { label: "Scoring", value: `${c.scoring}/100`, helper: "Índice de riesgo crediticio" },
          ].map((m) => (
            <article
              key={m.label}
              className="p-5"
              style={{ border: `1px solid ${m.danger ? "var(--color-danger)" : "var(--border)"}`, background: "var(--bg-card)" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{m.label}</p>
              <p
                className="mt-3 font-mono text-2xl font-black"
                style={{ color: m.danger ? "var(--color-danger)" : "var(--text-primary)" }}
              >
                {m.value}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{m.helper}</p>
            </article>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* LEFT COLUMN */}
          <div className="grid gap-6">

            {/* Editable contact info */}
            <ClienteEditPanel
              clienteId={c.id}
              initial={{
                nombre: c.nombre,
                empresa: c.empresa,
                tipo: c.tipo as "MINORISTA" | "TALLER" | "DISTRIBUIDOR_LOCAL" | "DISTRIBUIDOR_REGIONAL" | "VIP",
                telefono: c.telefono,
                whatsapp: c.whatsapp,
                email: c.email,
                ciudad: c.ciudad,
                rif: c.rif,
                fuente: c.fuente as "ADS" | "REFERIDO" | "ORGANICO" | "DIRECTO" | "WHATSAPP" | "TIENDA_WEB",
                temperatura: c.temperatura as "CALIENTE" | "TIBIO" | "FRIO",
                condicionPago: c.condicionPago,
                limiteCredito: c.limiteCredito,
                scoring: c.scoring,
                vendedorId: c.vendedorId,
                vendedorNombre: c.vendedorNombre,
                codigoReferido: c.codigoReferido,
                notas: c.notas,
              }}
              vendedores={vendedores}
            />

            {/* Facturas */}
            <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
                <div className="flex items-center gap-2">
                  <Receipt size={13} style={{ color: "var(--color-gold)" }} />
                  <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>
                    Últimas facturas
                  </p>
                </div>
                <Link
                  href={`/admin/facturacion?clienteId=${c.id}`}
                  className="text-xs font-bold uppercase transition hover:opacity-80"
                  style={{ color: "var(--color-gold)" }}
                >
                  Ver todas →
                </Link>
              </div>
              {c.ultimasFacturas.length === 0 ? (
                <p className="p-5 text-sm" style={{ color: "var(--text-muted)" }}>Sin facturas emitidas.</p>
              ) : (
                <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                  {c.ultimasFacturas.map((f) => (
                    <div key={f.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                      <span className={cn("shrink-0 rounded px-2 py-0.5 text-[10px] font-black uppercase", FACTURA_ESTADO_STYLES[f.estado])}>
                        {f.estado}
                      </span>
                      <p className="flex-1 font-mono text-sm font-bold" style={{ color: "var(--text-primary)" }}>{f.numero}</p>
                      <div className="text-right">
                        <p className="font-mono text-sm font-black">{money(f.total)}</p>
                        {f.saldo > 0 && (
                          <p className="text-xs font-bold" style={{ color: "var(--color-danger)" }}>
                            Saldo: {money(f.saldo)}
                          </p>
                        )}
                      </div>
                      <p className="w-full text-xs sm:w-auto" style={{ color: "var(--text-muted)" }}>
                        {fmtDate(f.fechaEmision)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Cotizaciones */}
            <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
                <div className="flex items-center gap-2">
                  <FileText size={13} style={{ color: "var(--color-gold)" }} />
                  <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>
                    Cotizaciones
                  </p>
                </div>
                <Link
                  href={`/admin/cotizaciones?clienteId=${c.id}`}
                  className="text-xs font-bold uppercase transition hover:opacity-80"
                  style={{ color: "var(--color-gold)" }}
                >
                  Ver todas →
                </Link>
              </div>
              {c.ultimasCotizaciones.length === 0 ? (
                <p className="p-5 text-sm" style={{ color: "var(--text-muted)" }}>Sin cotizaciones.</p>
              ) : (
                <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                  {c.ultimasCotizaciones.map((q) => (
                    <div key={q.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                      <span className={cn("shrink-0 rounded px-2 py-0.5 text-[10px] font-black uppercase", COT_ESTADO_STYLES[q.estado])}>
                        {q.estado}
                      </span>
                      <p className="flex-1 font-mono text-sm font-bold" style={{ color: "var(--text-primary)" }}>{q.numero}</p>
                      <p className="font-mono text-sm font-black">{money(q.total)}</p>
                      <p className="w-full text-xs sm:w-auto" style={{ color: "var(--text-muted)" }}>
                        {fmtDate(q.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="grid gap-6 self-start">

            {/* Vehicles */}
            <VehiculosPanel clienteId={c.id} initial={c.vehiculos} />

            {/* Timeline / Interacciones */}
            <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <div className="flex items-center justify-between gap-2 px-5 py-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
                <div className="flex items-center gap-2">
                  <Phone size={13} style={{ color: "var(--color-gold)" }} />
                  <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>
                    Últimas interacciones
                  </p>
                </div>
                <RegistrarInteraccionModal clienteId={c.id} />
              </div>
              {c.ultimasInteracciones.length === 0 ? (
                <p className="p-5 text-sm" style={{ color: "var(--text-muted)" }}>Sin interacciones registradas.</p>
              ) : (
                <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                  {c.ultimasInteracciones.map((i) => (
                    <div key={i.id} className="group px-5 py-4">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-black uppercase"
                          style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                        >
                          {INTERACCION_LABELS[i.tipo]}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <time className="text-[10px]" style={{ color: "var(--text-muted)" }} dateTime={i.createdAt}>
                            {fmtDateTime(i.createdAt)}
                          </time>
                          <InteraccionRowActions clienteId={c.id} interaccionId={i.id} />
                        </div>
                      </div>
                      <p className="mt-1.5 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>{i.descripcion}</p>
                      <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>{i.usuarioNombre}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Credit usage */}
            {c.limiteCredito > 0 && (
              <section className="p-5" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div className="flex items-center gap-2">
                  <Star size={13} style={{ color: "var(--color-gold)" }} />
                  <p className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
                    Crédito utilizado
                  </p>
                </div>
                <div className="mt-4">
                  <div className="flex items-end justify-between gap-2">
                    <p className="font-mono text-2xl font-black" style={{ color: c.stats.deudaActual > c.limiteCredito ? "var(--color-danger)" : "var(--text-primary)" }}>
                      {money(c.stats.deudaActual)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>de {money(c.limiteCredito)}</p>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full" style={{ background: "var(--bg-elevated)" }}>
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(Math.round((c.stats.deudaActual / c.limiteCredito) * 100), 100)}%`,
                        background: c.stats.deudaActual > c.limiteCredito * 0.8 ? "var(--color-danger)" : "var(--color-gold)",
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    {Math.round((c.stats.deudaActual / c.limiteCredito) * 100)}% utilizado
                  </p>
                </div>
              </section>
            )}

            {/* Portal access */}
            <PortalAccesoPanel
              clienteId={c.id}
              portalActivo={c.portalActivo}
              portalEmail={c.portalEmail}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
