import Link from "next/link";
import { ExternalLink, Package, Truck } from "lucide-react";

import { auth } from "@/auth";
import { getClientePedidos } from "@/lib/client-sections";
import { cn } from "@/lib/utils";
import type { EstadoOrden } from "@prisma/client";

const ESTADO_LABELS: Record<EstadoOrden, string> = {
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparacion",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const ESTADO_STYLES: Record<EstadoOrden, string> = {
  CONFIRMADO: "bg-zinc-100 text-zinc-600",
  EN_PREPARACION: "bg-blue-100 text-blue-700",
  EN_CAMINO: "bg-amber-100 text-amber-700",
  ENTREGADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-600",
};

const ESTADO_ICONS: Record<EstadoOrden, React.ElementType> = {
  CONFIRMADO: Package,
  EN_PREPARACION: Package,
  EN_CAMINO: Truck,
  ENTREGADO: Package,
  CANCELADO: Package,
};

export default async function ClientePedidosPage() {
  const session = await auth();
  const data = await getClientePedidos(session?.user?.id);

  const activos = data.pedidos.filter(
    (p) => p.estado !== "ENTREGADO" && p.estado !== "CANCELADO",
  );
  const historial = data.pedidos.filter(
    (p) => p.estado === "ENTREGADO" || p.estado === "CANCELADO",
  );

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
          Portal del cliente
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase">Mis pedidos</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Sigue el estado de tus despachos en tiempo real.
        </p>

        {data.isFallback ? (
          <div
            className="mt-6 p-4 text-sm"
            style={{
              border: "1px solid var(--border)",
              borderLeft: "2px solid var(--color-gold)",
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
            }}
          >
            Portal en modo demo hasta conectar la base de datos.
          </div>
        ) : null}

        {/* Métricas rápidas */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              { label: "En curso", value: activos.length, color: "var(--text-primary)" },
              { label: "Entregados", value: data.pedidos.filter((p) => p.estado === "ENTREGADO").length, color: "#16a34a" },
              { label: "En camino", value: data.pedidos.filter((p) => p.estado === "EN_CAMINO").length, color: "#b45309" },
              { label: "Cancelados", value: data.pedidos.filter((p) => p.estado === "CANCELADO").length, color: "#dc2626" },
            ] as const
          ).map((m) => (
            <article
              className="p-4"
              key={m.label}
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>{m.label}</p>
              <p className="mt-2 font-mono text-3xl font-black" style={{ color: m.color }}>{m.value}</p>
            </article>
          ))}
        </div>

        {/* Pedidos activos */}
        {activos.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              En curso
            </h2>
            <div className="mt-3 grid gap-3">
              {activos.map((p) => {
                const Icon = ESTADO_ICONS[p.estado];
                return (
                  <article
                    className="flex items-center justify-between gap-4 p-5"
                    key={p.id}
                    style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="mt-0.5 rounded-full p-2"
                        style={{ background: "var(--bg-elevated)" }}
                      >
                        <Icon size={18} style={{ color: "var(--text-secondary)" }} />
                      </div>
                      <div>
                        <p className="font-mono font-black">{p.codigo}</p>
                        <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                          Factura {p.facturaNumero}
                          {p.estimadoEntrega ? ` · Estimado ${p.estimadoEntrega}` : ""}
                        </p>
                        {p.direccionEntrega ? (
                          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{p.direccionEntrega}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={cn(
                          "rounded px-2 py-1 text-[10px] font-black uppercase",
                          ESTADO_STYLES[p.estado],
                        )}
                      >
                        {ESTADO_LABELS[p.estado]}
                      </span>
                      <Link
                        className="inline-flex items-center gap-1 text-xs font-bold transition"
                        href={`/orden/${p.codigo}`}
                        style={{ color: "var(--text-muted)" }}
                      >
                        Ver tracking <ExternalLink size={11} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          <div
            className="mt-8 p-8 text-center"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <Package className="mx-auto" size={40} style={{ color: "var(--text-muted)" }} />
            <p className="mt-3 font-bold uppercase" style={{ color: "var(--text-muted)" }}>Sin pedidos activos</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Cuando realices un pedido aparecera aqui.
            </p>
          </div>
        )}

        {/* Historial */}
        {historial.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Historial
            </h2>
            <div
              className="mt-3 overflow-x-auto"
              style={{ border: "1px solid var(--border)" }}
            >
              <table
                className="min-w-[560px] w-full border-collapse text-left text-sm"
                style={{ background: "var(--bg-card)" }}
              >
                <thead
                  className="text-xs uppercase"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                >
                  <tr>
                    <th className="px-4 py-3">Codigo</th>
                    <th className="px-4 py-3">Factura</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3 text-right">Tracking</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((p) => (
                    <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                      <td className="px-4 py-3 font-mono font-bold" style={{ color: "var(--text-secondary)" }}>{p.codigo}</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{p.facturaNumero}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded px-2 py-1 text-[10px] font-black uppercase",
                            ESTADO_STYLES[p.estado],
                          )}
                        >
                          {ESTADO_LABELS[p.estado]}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{p.createdAt}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          className="text-xs font-bold transition"
                          href={`/orden/${p.codigo}`}
                          style={{ color: "var(--text-muted)" }}
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
