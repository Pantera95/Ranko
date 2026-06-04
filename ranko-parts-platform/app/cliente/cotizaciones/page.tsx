import { FileText } from "lucide-react";

import { auth } from "@/auth";
import { ResponderCotizacionButtons } from "@/components/public/ResponderCotizacionButtons";
import { getClienteCotizaciones } from "@/lib/client-sections";
import { cn } from "@/lib/utils";
import type { EstadoCotizacion } from "@prisma/client";

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

export default async function ClienteCotizacionesPage() {
  const session = await auth();
  const data = await getClienteCotizaciones(session?.user?.id);

  const pendientes = data.cotizaciones.filter(
    (q) => q.estado === "ENVIADA" || q.estado === "BORRADOR",
  );
  const aceptadas = data.cotizaciones.filter((q) => q.estado === "ACEPTADA");
  const cerradas = data.cotizaciones.filter(
    (q) => q.estado === "RECHAZADA" || q.estado === "VENCIDA",
  );

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-4xl">
        <p className="font-mono-tech text-xs" style={{ color: "var(--color-gold)" }}>
          Portal del cliente
        </p>
        <h1 className="mt-2 font-display-kinetic--tight text-3xl uppercase leading-tight sm:text-4xl">Mis cotizaciones</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Propuestas comerciales de Ranko Parts para tus requerimientos.
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
          {[
            { label: "Pendientes", value: pendientes.length, color: "var(--text-primary)" },
            { label: "Aceptadas", value: aceptadas.length, color: "#16a34a" },
            { label: "Facturadas", value: data.cotizaciones.filter((q) => q.convertidaAFactura).length, color: "#16a34a" },
            { label: "Cerradas", value: cerradas.length, color: "var(--text-muted)" },
          ].map((m) => (
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

        {/* Pendientes destacadas */}
        {pendientes.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
              Esperando tu respuesta
            </h2>
            <div className="mt-3 grid gap-3">
              {pendientes.map((q) => (
                <article
                  className="p-5"
                  key={q.id}
                  style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="mt-0.5 rounded-full p-2"
                        style={{ background: "var(--bg-elevated)" }}
                      >
                        <FileText size={18} style={{ color: "var(--text-secondary)" }} />
                      </div>
                      <div>
                        <p className="font-mono font-black">{q.numero}</p>
                        <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                          Creada {q.createdAt} · Valida {q.validezDias} dias
                        </p>
                        {q.notas ? (
                          <p className="mt-1 text-xs italic" style={{ color: "var(--text-muted)" }}>{q.notas}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-black">{q.total}</p>
                      {q.descuento !== "$0.00" ? (
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Dto {q.descuento}</p>
                      ) : null}
                      <span
                        className={cn(
                          "mt-2 inline-block rounded px-2 py-1 text-[10px] font-black uppercase",
                          ESTADO_STYLES[q.estado],
                        )}
                      >
                        {ESTADO_LABELS[q.estado]}
                      </span>
                    </div>
                  </div>
                  {!data.isFallback && (q.estado === "ENVIADA" || q.estado === "BORRADOR") && (
                    <ResponderCotizacionButtons cotizacionId={q.id} numero={q.numero} />
                  )}
                </article>
              ))}
            </div>

            <div
              className="mt-5 p-5 text-center"
              style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)" }}
            >
              <p className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
                ¿Tienes dudas sobre una cotizacion?
              </p>
              <a
                className="mt-3 inline-block px-6 py-2.5 text-sm font-black text-black transition hover:opacity-90"
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%2C+quiero+consultar+una+cotizacion`}
                rel="noopener noreferrer"
                style={{ background: "var(--color-gold)" }}
                target="_blank"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </section>
        ) : null}

        {/* Tabla completa */}
        <section className="mt-10">
          <h2 className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
            Historial
          </h2>
          <div
            className="mt-3 overflow-x-auto"
            style={{ border: "1px solid var(--border)" }}
          >
            <table
              className="min-w-[580px] w-full border-collapse text-left text-sm"
              style={{ background: "var(--bg-card)" }}
            >
              <thead
                className="text-xs uppercase"
                style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
              >
                <tr>
                  <th className="px-4 py-3">Numero</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Facturada</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.cotizaciones.map((q) => (
                  <tr key={q.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="px-4 py-3 font-mono font-bold" style={{ color: "var(--text-secondary)" }}>{q.numero}</td>
                    <td className="px-4 py-3 font-mono font-black">{q.total}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded px-2 py-1 text-[10px] font-black uppercase",
                          ESTADO_STYLES[q.estado],
                        )}
                      >
                        {ESTADO_LABELS[q.estado]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {q.convertidaAFactura ? (
                        <span className="text-xs font-bold text-green-700">✓ Si</span>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{q.createdAt}</td>
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
