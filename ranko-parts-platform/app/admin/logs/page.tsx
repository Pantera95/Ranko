import { Activity, Clock, Shield, User } from "lucide-react";
import Link from "next/link";

import { getLogsData, ACCION_LABELS, ACCION_STYLES } from "@/lib/logs-admin";
import { cn } from "@/lib/utils";

/**
 * Resolves the admin page that shows the full record referenced by a log row.
 * Returns null for entity types that don't have a 1:1 detail page (Pago → use
 * the queue at /admin/pagos instead) or when the id looks like a placeholder
 * (fallback data uses fake numeric codes that won't match real cuid routes).
 */
function entidadHref(tipo: string, id: string): string | null {
  if (!id || /^[A-Z]+-\d+$/i.test(id)) return null; // placeholder ids like FAC-0001
  switch (tipo.toLowerCase()) {
    case "factura":
      return `/admin/facturacion/${id}`;
    case "cotizacion":
    case "cotización":
      return `/admin/cotizaciones/${id}`;
    case "cliente":
      return `/admin/clientes/${id}`;
    case "producto":
      return `/admin/catalogo/${id}`;
    case "pago":
      // Pagos don't have a dedicated detail page; the queue is the closest match.
      return "/admin/pagos";
    default:
      return null;
  }
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminLogsPage() {
  const data = await getLogsData(200);
  const { logs, metrics } = data;

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono-tech text-xs" style={{ color: "var(--color-gold)" }}>
              Sistema
            </p>
            <h1 className="mt-2 font-display-kinetic--tight text-3xl uppercase leading-tight sm:text-4xl">Logs de auditoría</h1>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              Registro inmutable de todas las acciones críticas realizadas en la plataforma.
            </p>
          </div>
          <div
            className="hidden shrink-0 items-center gap-2 px-3 py-2 sm:flex"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <Shield size={12} style={{ color: "var(--color-gold)" }} />
            <span className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
              Sólo lectura
            </span>
          </div>
        </div>

        {data.isFallback && (
          <div
            className="mt-5 p-4 text-sm"
            style={{ border: "1px solid var(--border)", borderLeft: "2px solid var(--color-gold)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
          >
            Modo demo — conecta{" "}
            <code className="rounded px-1 font-mono" style={{ background: "var(--bg-elevated)", color: "var(--color-gold)" }}>DATABASE_URL</code>{" "}
            para ver logs reales del sistema.
          </div>
        )}

        {/* KPI Band */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <article
              key={m.label}
              className="p-5"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{m.label}</p>
              <p className="mt-3 font-mono text-3xl font-black">{m.value}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{m.helper}</p>
            </article>
          ))}
        </div>

        {/* Action legend */}
        <section
          className="mt-6 p-4"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          <p className="flex items-center gap-2 text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>
            <Activity size={12} /> Tipos de evento
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(ACCION_LABELS) as (keyof typeof ACCION_LABELS)[]).map((k) => (
              <span
                key={k}
                className={cn("rounded px-2 py-0.5 text-[10px] font-black uppercase", ACCION_STYLES[k])}
              >
                {ACCION_LABELS[k]}
              </span>
            ))}
          </div>
        </section>

        {/* Log list */}
        <section className="mt-6">
          <p className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
            Eventos ({logs.length})
          </p>

          {logs.length === 0 ? (
            <div
              className="mt-4 p-8 text-center"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <Activity className="mx-auto" size={36} style={{ color: "var(--text-muted)" }} />
              <p className="mt-3 font-bold uppercase" style={{ color: "var(--text-muted)" }}>Sin eventos registrados</p>
            </div>
          ) : (
            <div
              className="mt-4 divide-y"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-wrap items-start gap-3 px-5 py-4"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  {/* Badge */}
                  <span
                    className={cn(
                      "mt-0.5 shrink-0 rounded px-2 py-0.5 text-[10px] font-black uppercase",
                      ACCION_STYLES[log.accion] ?? "bg-zinc-100 text-zinc-500",
                    )}
                  >
                    {ACCION_LABELS[log.accion] ?? log.accion}
                  </span>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
                        {log.entidadTipo}
                      </p>
                      {(() => {
                        const href = entidadHref(log.entidadTipo, log.entidadId);
                        const codeProps = {
                          className: "rounded px-1.5 py-0.5 font-mono text-xs font-bold transition hover:opacity-80",
                          style: { background: "var(--bg-elevated)", color: "var(--color-gold)" },
                        };
                        return href ? (
                          <Link href={href} {...codeProps} title={`Abrir ${log.entidadTipo}`}>
                            {log.entidadId}
                          </Link>
                        ) : (
                          <code {...codeProps}>{log.entidadId}</code>
                        );
                      })()}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      <span
                        className="flex items-center gap-1 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <User size={10} /> {log.usuarioNombre}
                      </span>
                      {log.ipAddress && (
                        <span
                          className="font-mono text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {log.ipAddress}
                        </span>
                      )}
                      {(log.hasAntes || log.hasDespues) && (
                        <span
                          className="text-[10px] font-bold uppercase"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {log.hasAntes && log.hasDespues ? "Δ antes/después" : log.hasDespues ? "Δ estado nuevo" : "Δ estado previo"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div
                    className="flex shrink-0 items-center gap-1.5 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Clock size={10} />
                    <time dateTime={log.timestamp}>{formatTimestamp(log.timestamp)}</time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
