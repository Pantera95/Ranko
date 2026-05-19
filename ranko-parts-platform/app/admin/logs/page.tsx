import { Activity, Clock, Shield, User } from "lucide-react";

import { getLogsData, ACCION_LABELS, ACCION_STYLES } from "@/lib/logs-admin";
import { cn } from "@/lib/utils";

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
            <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
              Sistema
            </p>
            <h1 className="mt-2 text-4xl font-black uppercase">Logs de auditoría</h1>
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
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
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
                      <code
                        className="rounded px-1.5 py-0.5 font-mono text-xs font-bold"
                        style={{ background: "var(--bg-elevated)", color: "var(--color-gold)" }}
                      >
                        {log.entidadId}
                      </code>
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
