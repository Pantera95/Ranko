import { Receipt } from "lucide-react";

import { auth } from "@/auth";
import { getClienteFacturas } from "@/lib/client-sections";
import { cn } from "@/lib/utils";
import type { EstadoFactura } from "@prisma/client";

const ESTADO_LABELS: Record<EstadoFactura, string> = {
  PENDIENTE: "Pendiente",
  PARCIAL: "Parcial",
  PAGADA: "Pagada",
  VENCIDA: "Vencida",
  ANULADA: "Anulada",
};

const ESTADO_STYLES: Record<EstadoFactura, string> = {
  PENDIENTE: "bg-zinc-100 text-zinc-700",
  PARCIAL: "bg-blue-100 text-blue-700",
  PAGADA: "bg-green-100 text-green-700",
  VENCIDA: "bg-red-100 text-red-700",
  ANULADA: "bg-zinc-50 text-zinc-400",
};

export default async function ClienteFacturasPage() {
  const session = await auth();
  const data = await getClienteFacturas(session?.user?.id);

  const pendientes = data.facturas.filter(
    (f) => f.estado === "PENDIENTE" || f.estado === "PARCIAL",
  );
  const vencidas = data.facturas.filter((f) => f.estado === "VENCIDA");
  const pagadas = data.facturas.filter((f) => f.estado === "PAGADA");

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
          Portal del cliente
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase">Mis facturas</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Estado de cuenta y deuda pendiente con Ranko Parts.
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

        {/* Métricas */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <article
            className="p-4"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Total deuda</p>
            <p className="mt-2 font-mono text-2xl font-black text-red-600">{data.totalDeuda}</p>
          </article>
          <article
            className="p-4"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Pendientes</p>
            <p className="mt-2 font-mono text-3xl font-black">{pendientes.length}</p>
          </article>
          <article
            className="p-4"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Vencidas</p>
            <p
              className="mt-2 font-mono text-3xl font-black"
              style={{ color: vencidas.length > 0 ? "#dc2626" : "var(--text-primary)" }}
            >
              {vencidas.length}
            </p>
          </article>
          <article
            className="p-4"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Pagadas</p>
            <p className="mt-2 font-mono text-3xl font-black text-green-700">{pagadas.length}</p>
          </article>
        </div>

        {/* Facturas pendientes / vencidas destacadas */}
        {(pendientes.length > 0 || vencidas.length > 0) ? (
          <section className="mt-8">
            <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Requieren pago
            </h2>
            <div className="mt-3 grid gap-3">
              {[...vencidas, ...pendientes].map((f) => (
                <article
                  className="flex items-center justify-between gap-4 p-5"
                  key={f.id}
                  style={
                    f.estado === "VENCIDA"
                      ? { border: "1px solid #fca5a5", background: "color-mix(in srgb, #dc2626 6%, var(--bg-card))" }
                      : { border: "1px solid var(--border)", background: "var(--bg-card)" }
                  }
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="mt-0.5 rounded-full p-2"
                      style={{ background: "var(--bg-elevated)" }}
                    >
                      <Receipt size={18} style={{ color: "var(--text-secondary)" }} />
                    </div>
                    <div>
                      <p className="font-mono font-black">{f.numero}</p>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                        Emitida {f.fechaEmision} · Vence {f.fechaVencimiento}
                      </p>
                      {f.diasVencida > 0 ? (
                        <p className="mt-1 text-xs font-bold text-red-600">
                          +{f.diasVencida} dias de vencimiento
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-black text-red-600">{f.saldoPendiente}</p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>saldo pendiente</p>
                    <span
                      className={cn(
                        "mt-2 inline-block rounded px-2 py-1 text-[10px] font-black uppercase",
                        ESTADO_STYLES[f.estado],
                      )}
                    >
                      {ESTADO_LABELS[f.estado]}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <div
              className="mt-5 p-5 text-center"
              style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)" }}
            >
              <p className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
                Para registrar tu pago contacta a tu vendedor
              </p>
              <a
                className="mt-3 inline-block px-6 py-2.5 text-sm font-black text-black transition hover:opacity-90"
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%2C+quiero+registrar+un+pago`}
                rel="noopener noreferrer"
                style={{ background: "var(--color-gold)" }}
                target="_blank"
              >
                Enviar comprobante por WhatsApp
              </a>
            </div>
          </section>
        ) : null}

        {/* Tabla completa */}
        <section className="mt-10">
          <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Historial completo
          </h2>
          <div
            className="mt-3 overflow-x-auto"
            style={{ border: "1px solid var(--border)" }}
          >
            <table
              className="min-w-[620px] w-full border-collapse text-left text-sm"
              style={{ background: "var(--bg-card)" }}
            >
              <thead
                className="text-xs uppercase"
                style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
              >
                <tr>
                  <th className="px-4 py-3">Numero</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Pagado</th>
                  <th className="px-4 py-3">Saldo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {data.facturas.map((f) => (
                  <tr
                    key={f.id}
                    className={cn(f.estado === "ANULADA" && "opacity-40")}
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <td className="px-4 py-3 font-mono font-bold" style={{ color: "var(--text-secondary)" }}>{f.numero}</td>
                    <td className="px-4 py-3 font-mono text-sm font-black">{f.total}</td>
                    <td className="px-4 py-3 font-mono text-xs text-green-700">{f.montoPagado}</td>
                    <td
                      className="px-4 py-3 font-mono text-sm font-black"
                      style={{ color: f.saldoNum > 0 ? "#dc2626" : "#16a34a" }}
                    >
                      {f.saldoPendiente}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "rounded px-2 py-1 text-[10px] font-black uppercase",
                        ESTADO_STYLES[f.estado],
                      )}>
                        {ESTADO_LABELS[f.estado]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                      {f.fechaVencimiento}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
