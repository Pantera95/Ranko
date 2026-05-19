import { Clock, MessageSquare, TrendingUp, Zap } from "lucide-react";

import { getAutomationData } from "@/lib/automation";
import { AutomationPanel } from "@/components/admin/AutomationPanel";

export default async function AdminAutomatizacionPage() {
  const data = await getAutomationData();

  const kpis = [
    {
      label: "Secuencias activas",
      value: String(data.stats.secuenciasActivas),
      helper: `de ${data.secuencias.length} totales`,
      icon: Zap,
      accent: "#F5C518",
    },
    {
      label: "Mensajes hoy",
      value: String(data.stats.mensajesHoy),
      helper: "WhatsApp + Email",
      icon: MessageSquare,
      accent: "#22c55e",
    },
    {
      label: "Tasa de entrega",
      value: `${data.stats.tasaEntrega}%`,
      helper: "Últimas 24h",
      icon: TrendingUp,
      accent: data.stats.tasaEntrega >= 90 ? "#22c55e" : data.stats.tasaEntrega >= 70 ? "#f59e0b" : "#ef4444",
    },
    {
      label: "Pendientes",
      value: String(data.stats.pendientes),
      helper: "En cola",
      icon: Clock,
      accent: data.stats.pendientes > 0 ? "#f59e0b" : "#3f3f46",
    },
  ];

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-gold)]">
              Omnicanal
            </p>
            <h1 className="mt-2 text-4xl font-black uppercase">Automatización</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: "var(--text-muted)" }}>
              Secuencias automáticas de WhatsApp y Email para leads, cotizaciones,
              facturas vencidas y recompra programada.
            </p>
          </div>
          {/* Status pill */}
          <div className="hidden shrink-0 items-center gap-2 rounded-full px-4 py-2 sm:flex" style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-green-500" />
            </span>
            <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>Motor activo</span>
          </div>
        </div>

        {data.isFallback && (
          <div className="mt-5 flex items-start gap-3 px-4 py-3" style={{ background: "var(--bg-card)", borderLeft: "2px solid var(--color-gold)" }}>
            <Zap size={14} className="mt-0.5 shrink-0 text-[var(--color-gold)]" />
            <p className="text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
              Modo demo — conecta{" "}
              <code className="rounded px-1.5 py-0.5 font-mono text-[var(--color-gold)]" style={{ background: "var(--bg-elevated)" }}>DATABASE_URL</code>,{" "}
              <code className="rounded px-1.5 py-0.5 font-mono text-[var(--color-gold)]" style={{ background: "var(--bg-elevated)" }}>RESEND_API_KEY</code> y{" "}
              <code className="rounded px-1.5 py-0.5 font-mono text-[var(--color-gold)]" style={{ background: "var(--bg-elevated)" }}>META_WHATSAPP_TOKEN</code>{" "}
              para despacho real.
            </p>
          </div>
        )}

        {/* KPI band */}
        <section className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {kpis.map((kpi) => (
            <article
              key={kpi.label}
              className="group relative overflow-hidden p-5 transition-colors"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              {/* Colored top accent line */}
              <div
                className="absolute inset-x-0 top-0 h-0.5"
                style={{ background: kpi.accent }}
              />
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {kpi.label}
                </p>
                <kpi.icon
                  size={15}
                  style={{ color: kpi.accent }}
                  className="opacity-70"
                />
              </div>
              <p
                className="mt-3 font-mono text-3xl font-black"
                style={{ color: kpi.accent }}
              >
                {kpi.value}
              </p>
              <p className="mt-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>{kpi.helper}</p>
            </article>
          ))}
        </section>

        <AutomationPanel data={data} />
      </section>
    </main>
  );
}
