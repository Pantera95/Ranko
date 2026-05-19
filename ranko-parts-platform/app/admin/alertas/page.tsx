import { AlertTriangle, CheckCircle, CreditCard, Package, Receipt, ShieldAlert } from "lucide-react";

import { getAlertasData } from "@/lib/alertas";
import { cn } from "@/lib/utils";
import type { AlertaItem, AlertaSeveridad } from "@/lib/alertas";

const SEV_STYLES: Record<AlertaSeveridad, { badge: string; border: string; icon: string }> = {
  CRITICA: {
    badge: "bg-red-600 text-white",
    border: "var(--color-danger)",
    icon: "#dc2626",
  },
  ALTA: {
    badge: "bg-orange-100 text-orange-700",
    border: "#ea580c",
    icon: "#ea580c",
  },
  MEDIA: {
    badge: "bg-amber-100 text-amber-700",
    border: "#d97706",
    icon: "#d97706",
  },
  BAJA: {
    badge: "bg-zinc-100 text-zinc-600",
    border: "var(--border)",
    icon: "var(--text-muted)",
  },
};

const TIPO_ICONS: Record<AlertaItem["tipo"], React.ElementType> = {
  PAGO_ANOMALO: CreditCard,
  FACTURA_VENCIDA: Receipt,
  DEUDA_CRITICA: ShieldAlert,
  CLIENTE_INACTIVO: AlertTriangle,
  STOCK_BAJO: Package,
};

function SeveridadBadge({ sev }: { sev: AlertaSeveridad }) {
  return (
    <span className={cn("rounded px-2 py-0.5 text-[10px] font-black uppercase", SEV_STYLES[sev].badge)}>
      {sev}
    </span>
  );
}

export default async function AdminAlertasPage() {
  const data = await getAlertasData();
  const { alertas, resumen } = data;

  const criticas = alertas.filter((a) => a.severidad === "CRITICA");
  const altas = alertas.filter((a) => a.severidad === "ALTA");
  const medias = alertas.filter((a) => a.severidad === "MEDIA" || a.severidad === "BAJA");

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
              Finanzas
            </p>
            <h1 className="mt-2 text-4xl font-black uppercase">Alertas anómalas</h1>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              Pagos sospechosos, facturas vencidas críticas y riesgos operativos en tiempo real.
            </p>
          </div>
          {resumen.total > 0 && (
            <div
              className="hidden shrink-0 items-center gap-2 rounded-full px-4 py-2 sm:flex"
              style={{ border: "1px solid var(--color-danger)", background: "color-mix(in srgb, var(--color-danger) 8%, var(--bg-card))" }}
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-red-500" />
              </span>
              <span className="text-xs font-bold" style={{ color: "var(--color-danger)" }}>
                {resumen.total} alerta{resumen.total !== 1 ? "s" : ""} activa{resumen.total !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {data.isFallback && (
          <div
            className="mt-5 p-4 text-sm"
            style={{ border: "1px solid var(--border)", borderLeft: "2px solid var(--color-gold)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
          >
            Modo demo — conecta <code className="rounded px-1 font-mono" style={{ background: "var(--bg-elevated)", color: "var(--color-gold)" }}>DATABASE_URL</code> para alertas en tiempo real.
          </div>
        )}

        {/* KPI Band */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.metrics.map((m) => (
            <article
              key={m.label}
              className="relative overflow-hidden p-5"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              {m.danger && m.value !== "0" && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-red-500" />
              )}
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{m.label}</p>
              <p
                className="mt-3 font-mono text-3xl font-black"
                style={{ color: m.danger && m.value !== "0" ? "var(--color-danger)" : "var(--text-primary)" }}
              >
                {m.value}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{m.helper}</p>
            </article>
          ))}
        </div>

        {alertas.length === 0 ? (
          <div
            className="mt-10 p-10 text-center"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <CheckCircle className="mx-auto" size={40} style={{ color: "var(--color-success)" }} />
            <p className="mt-4 text-xl font-black uppercase">Sistema sin alertas</p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              No hay pagos anómalos, facturas críticas ni riesgos detectados.
            </p>
          </div>
        ) : (
          <>
            {/* Críticas */}
            {criticas.length > 0 && (
              <section className="mt-8">
                <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest" style={{ color: "var(--color-danger)" }}>
                  <AlertTriangle size={13} /> Críticas — Acción inmediata ({criticas.length})
                </h2>
                <div className="mt-3 grid gap-3">
                  {criticas.map((a) => <AlertaCard key={a.id} alerta={a} />)}
                </div>
              </section>
            )}

            {/* Altas */}
            {altas.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "#ea580c" }}>
                  Alta prioridad ({altas.length})
                </h2>
                <div className="mt-3 grid gap-3">
                  {altas.map((a) => <AlertaCard key={a.id} alerta={a} />)}
                </div>
              </section>
            )}

            {/* Medias / Bajas */}
            {medias.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  Informativas ({medias.length})
                </h2>
                <div className="mt-3 grid gap-3">
                  {medias.map((a) => <AlertaCard key={a.id} alerta={a} />)}
                </div>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function AlertaCard({ alerta: a }: { alerta: AlertaItem }) {
  const sev = SEV_STYLES[a.severidad];
  const Icon = TIPO_ICONS[a.tipo];

  return (
    <article
      className="flex items-start gap-4 p-4"
      style={{ border: `1px solid ${sev.border}`, background: "var(--bg-card)" }}
    >
      <div
        className="mt-0.5 shrink-0 rounded-full p-2"
        style={{ background: "var(--bg-elevated)" }}
      >
        <Icon size={16} style={{ color: sev.icon }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-black uppercase">{a.titulo}</p>
          <SeveridadBadge sev={a.severidad} />
        </div>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{a.descripcion}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
            {a.entidad}
          </p>
          <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            {a.fecha}
          </p>
        </div>
      </div>
    </article>
  );
}
