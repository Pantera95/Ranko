import { CheckCircle, Circle, Clock, MapPin, Package, Truck, XCircle } from "lucide-react";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { getTrackingData } from "@/lib/orders";
import { cn } from "@/lib/utils";
import type { EstadoOrden } from "@prisma/client";

type OrdenPageProps = {
  params: Promise<{ codigo: string }>;
};

const PIPELINE: EstadoOrden[] = ["CONFIRMADO", "EN_PREPARACION", "EN_CAMINO", "ENTREGADO"];

const STEP_LABELS: Record<EstadoOrden, string> = {
  CONFIRMADO: "Pedido confirmado",
  EN_PREPARACION: "En preparacion",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const STEP_DESCRIPTIONS: Record<EstadoOrden, string> = {
  CONFIRMADO: "Tu pedido fue recibido y esta en cola de despacho.",
  EN_PREPARACION: "El equipo esta preparando y empacando tu pedido.",
  EN_CAMINO: "Tu pedido salio del almacen y esta en ruta.",
  ENTREGADO: "Pedido entregado exitosamente.",
  CANCELADO: "Esta orden fue cancelada.",
};

function StepIcon({ estado, active, done }: { estado: EstadoOrden; active: boolean; done: boolean }) {
  if (estado === "CANCELADO") return <XCircle className="text-[var(--color-danger)]" size={22} />;
  if (done) return <CheckCircle className="text-[var(--color-success)]" size={22} />;
  if (active) {
    if (estado === "EN_PREPARACION") return <Package className="text-[var(--color-gold)]" size={22} />;
    if (estado === "EN_CAMINO") return <Truck className="text-[var(--color-gold)]" size={22} />;
    return <Clock className="text-[var(--color-gold)]" size={22} />;
  }
  return <Circle size={22} style={{ color: "var(--text-muted)" }} />;
}

export default async function OrdenPage({ params }: OrdenPageProps) {
  const { codigo } = await params;
  const data = await getTrackingData(codigo);

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <PublicNavbar />
      <WhatsAppFloating />

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-gold-muted)]">
          Tracking publico
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase sm:text-5xl">
          Orden {codigo}
        </h1>

        {!data.found ? (
          <div
            className="mt-10 p-8 text-center"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="text-lg font-black uppercase" style={{ color: "var(--text-primary)" }}>
              Orden no encontrada
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Verifica el codigo con tu vendedor o contactanos por WhatsApp.
            </p>
            <a
              className="mt-6 inline-block px-6 py-3 text-sm font-black uppercase text-black transition hover:opacity-90"
              style={{ background: "var(--color-gold)" }}
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%2C+quiero+consultar+mi+orden+${codigo}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              Consultar por WhatsApp
            </a>
          </div>
        ) : (
          <>
            {/* Info band */}
            <div
              className="mt-8 grid gap-0 sm:grid-cols-3"
              style={{ border: "1px solid var(--border)" }}
            >
              <div
                className="p-4 sm:border-b-0 sm:border-r"
                style={{ borderBottom: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}
              >
                <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Cliente</p>
                <p className="mt-1 font-black" style={{ color: "var(--text-primary)" }}>{data.cliente}</p>
              </div>
              <div
                className="p-4 sm:border-b-0 sm:border-r"
                style={{ borderBottom: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}
              >
                <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Estado actual</p>
                <p
                  className={cn(
                    "mt-1 font-black uppercase",
                    data.estado === "ENTREGADO"
                      ? "text-[var(--color-success)]"
                      : data.estado === "CANCELADO"
                      ? "text-[var(--color-danger)]"
                      : "text-[var(--color-gold-muted)]",
                  )}
                >
                  {STEP_LABELS[data.estado]}
                </p>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                  {data.estimadoEntrega ? "Entrega estimada" : "Direccion"}
                </p>
                <p className="mt-1 font-black" style={{ color: "var(--text-primary)" }}>
                  {data.estimadoEntrega
                    ? data.estimadoEntrega
                    : data.direccionEntrega || "—"}
                </p>
              </div>
            </div>

            {/* Pipeline tracker */}
            {data.estado !== "CANCELADO" ? (
              <div className="mt-10">
                <ol
                  className="relative ml-4"
                  style={{ borderLeft: "2px solid var(--border)" }}
                >
                  {PIPELINE.map((step) => {
                    const pipelineIndex = PIPELINE.indexOf(step);
                    const currentIndex = PIPELINE.indexOf(data.estado as EstadoOrden);
                    const done = pipelineIndex < currentIndex;
                    const active = pipelineIndex === currentIndex;

                    // Find historial entry for this step
                    const entry = data.historial.find((h) => h.estado === step);

                    return (
                      <li
                        className={cn(
                          "mb-6 ml-8",
                          !done && !active && "opacity-40",
                        )}
                        key={step}
                      >
                        <span
                          className={cn(
                            "absolute -left-[13px] flex size-6 items-center justify-center rounded-full",
                            active && "ring-2 ring-[var(--color-gold)]",
                            done && "ring-2 ring-[var(--color-success)]",
                          )}
                          style={{ background: "var(--bg-card)" }}
                        >
                          <StepIcon active={active} done={done} estado={step} />
                        </span>

                        <div
                          className="p-5"
                          style={{
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <h2
                            className="font-black uppercase"
                            style={{
                              color: active
                                ? "var(--text-primary)"
                                : done
                                ? "var(--text-secondary)"
                                : "var(--text-muted)",
                            }}
                          >
                            {STEP_LABELS[step]}
                          </h2>
                          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                            {STEP_DESCRIPTIONS[step]}
                          </p>
                          {entry ? (
                            <p className="mt-2 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                              {new Date(entry.timestamp).toLocaleString("es-VE")}
                              {entry.responsable ? ` · ${entry.responsable}` : ""}
                            </p>
                          ) : null}
                          {entry?.nota ? (
                            <p className="mt-1 text-xs italic" style={{ color: "var(--text-muted)" }}>{entry.nota}</p>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ) : (
              <div
                className="mt-10 p-6"
                style={{
                  border: "1px solid var(--color-danger)",
                  background: "color-mix(in srgb, var(--color-danger) 6%, var(--bg-card))",
                }}
              >
                <div className="flex items-center gap-3">
                  <XCircle className="text-[var(--color-danger)]" size={22} />
                  <p className="font-black uppercase text-[var(--color-danger)]">
                    Orden cancelada
                  </p>
                </div>
                <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  Contacta a tu vendedor para mas informacion sobre esta orden.
                </p>
              </div>
            )}

            {/* Items */}
            {data.items.length > 0 ? (
              <div className="mt-10">
                <p
                  className="text-xs font-black uppercase tracking-[0.18em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Productos en esta orden
                </p>
                <div className="mt-4 grid gap-2">
                  {data.items.map((item) => (
                    <div
                      className="flex items-center justify-between px-4 py-3"
                      key={item.sku}
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Package size={16} style={{ color: "var(--text-muted)" }} />
                        <div>
                          <p className="font-bold" style={{ color: "var(--text-primary)" }}>{item.nombre}</p>
                          <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{item.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-black" style={{ color: "var(--text-primary)" }}>x{item.cantidad}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.precioUnitario} c/u</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Delivery info */}
            {data.direccionEntrega ? (
              <div
                className="mt-8 flex items-start gap-3 p-5"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                }}
              >
                <MapPin className="mt-0.5 shrink-0" size={18} style={{ color: "var(--text-muted)" }} />
                <div>
                  <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Direccion de entrega</p>
                  <p className="mt-1 font-bold" style={{ color: "var(--text-primary)" }}>{data.direccionEntrega}</p>
                </div>
              </div>
            ) : null}

            {/* CTA WhatsApp */}
            <div
              className="mt-10 p-6 text-center"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
            >
              <p className="text-sm font-bold uppercase" style={{ color: "var(--text-secondary)" }}>
                ¿Tienes alguna consulta sobre tu pedido?
              </p>
              <a
                className="mt-4 inline-block border border-[var(--color-gold)] bg-[var(--color-gold)] px-8 py-3 font-black uppercase text-black transition hover:bg-[var(--color-gold-hover)]"
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%2C+consulta+sobre+mi+orden+${data.codigo}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                Contactar por WhatsApp
              </a>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
