import { AlertTriangle, Ban, MessageSquare, PhoneCall, TrendingDown } from "lucide-react"; // Ban kept for bloqueado icon in card header
import Link from "next/link";

import { BloquearButton } from "@/components/admin/BloquearButton";
import { getDeudasData } from "@/lib/deudas";
import { cn } from "@/lib/utils";
import type { DeudaCliente } from "@/lib/deudas";

const BUCKET_LABEL: Record<string, string> = {
  corriente: "Corriente",
  "30": "31-60 d",
  "60": "61-90 d",
  "90": "+90 d",
  critica: "Crítica",
};

const BUCKET_COLOR: Record<string, string> = {
  corriente: "bg-zinc-100 text-zinc-600",
  "30": "bg-amber-100 text-amber-700",
  "60": "bg-orange-100 text-orange-700",
  "90": "bg-red-100 text-red-700",
  critica: "bg-red-600 text-white",
};

const BUCKET_BAR: Record<string, string> = {
  corriente: "#6b7280",
  "30": "#f59e0b",
  "60": "#ea580c",
  "90": "#dc2626",
  critica: "#991b1b",
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#f59e0b" : "#dc2626";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full" style={{ background: "var(--bg-elevated)" }}>
        <div className="h-1.5 rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="font-mono text-xs font-black" style={{ color }}>{score}</span>
    </div>
  );
}

function BucketBadge({ bucket }: { bucket: string }) {
  return (
    <span className={cn("rounded px-2 py-0.5 text-[10px] font-black uppercase", BUCKET_COLOR[bucket] ?? BUCKET_COLOR.corriente)}>
      {BUCKET_LABEL[bucket] ?? bucket}
    </span>
  );
}

export default async function AdminDeudasPage() {
  const data = await getDeudasData();
  const { clientes, totales } = data;

  const totalCartera = totales.total;
  const pctCritica = totalCartera > 0 ? Math.round(((totales.critica + totales.dias90) / totalCartera) * 100) : 0;

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-7xl">

        {/* Header */}
        <div>
          <p className="font-mono-tech text-xs" style={{ color: "var(--color-gold)" }}>
            Finanzas
          </p>
          <h1 className="mt-2 font-display-kinetic--tight text-3xl uppercase leading-tight sm:text-4xl">Panel de deudas</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            Antigüedad de saldos, gestión de cobranza y bloqueo comercial por cliente.
          </p>
        </div>

        {data.isFallback && (
          <div
            className="mt-5 p-4 text-sm"
            style={{ border: "1px solid var(--border)", borderLeft: "2px solid var(--color-gold)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
          >
            Modo demo — conecta <code className="rounded px-1 font-mono" style={{ background: "var(--bg-elevated)", color: "var(--color-gold)" }}>DATABASE_URL</code> para operar con datos reales.
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
              {m.danger && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-red-500" />
              )}
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

        {/* Aging breakdown */}
        <section className="mt-8">
          <h2 className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
            Distribución de antigüedad
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-5">
            {(
              [
                { key: "corriente", label: "Corriente", monto: totales.corriente },
                { key: "30", label: "31-60 días", monto: totales.dias30 },
                { key: "60", label: "61-90 días", monto: totales.dias60 },
                { key: "90", label: "+90 días", monto: totales.dias90 },
                { key: "critica", label: "Crítica", monto: totales.critica },
              ] as const
            ).map((band) => {
              const pct = totalCartera > 0 ? Math.round((band.monto / totalCartera) * 100) : 0;
              return (
                <article
                  key={band.key}
                  className="p-4"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>{band.label}</p>
                    <span className="font-mono text-xs font-black" style={{ color: band.monto > 0 ? BUCKET_BAR[band.key] : "var(--text-muted)" }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="mt-2 h-1 w-full rounded-full" style={{ background: "var(--bg-elevated)" }}>
                    <div
                      className="h-1 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: BUCKET_BAR[band.key] }}
                    />
                  </div>
                  <p
                    className="mt-3 font-mono text-lg font-black"
                    style={{ color: band.monto > 0 ? BUCKET_BAR[band.key] : "var(--text-muted)" }}
                  >
                    {band.monto > 0 ? `$${band.monto.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Alert banner if critical % high */}
        {pctCritica > 20 && (
          <div
            className="mt-6 flex items-start gap-3 p-4 text-sm"
            style={{ border: "1px solid var(--color-danger)", background: "color-mix(in srgb, var(--color-danger) 6%, var(--bg-card))", color: "var(--text-primary)" }}
          >
            <AlertTriangle className="mt-0.5 shrink-0" size={16} style={{ color: "var(--color-danger)" }} />
            <p>
              <strong>{pctCritica}%</strong> de la cartera está en tramos críticos (+60 días). Se recomienda revisar bloqueo comercial en clientes de mayor riesgo.
            </p>
          </div>
        )}

        {/* Client debt table */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
              Cartera por cliente ({clientes.length})
            </h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Ordenado por tramo más crítico
            </p>
          </div>

          {clientes.length === 0 ? (
            <div
              className="mt-4 p-8 text-center"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <TrendingDown className="mx-auto" size={36} style={{ color: "var(--text-muted)" }} />
              <p className="mt-3 font-bold uppercase" style={{ color: "var(--text-muted)" }}>Sin deuda activa</p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Todos los saldos están al día.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {clientes.map((c) => (
                <DeudaCard key={c.id} cliente={c} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function DeudaCard({ cliente: c }: { cliente: DeudaCliente }) {
  const whatsappMsg = encodeURIComponent(
    `Hola ${c.nombre}, te contactamos de Ranko Parts para recordarte el saldo pendiente de $${c.deudaTotal.toFixed(2)}. Por favor comunícate con nosotros para coordinar el pago.`,
  );
  const waHref = c.whatsapp
    ? `https://wa.me/${c.whatsapp.replace(/\D/g, "")}?text=${whatsappMsg}`
    : undefined;

  return (
    <article style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          {c.bloqueado && (
            <span title="Bloqueado comercialmente">
              <Ban size={14} style={{ color: "var(--color-danger)" }} />
            </span>
          )}
          <div>
            <Link
              href={`/admin/clientes/${c.id}`}
              className="font-black uppercase transition hover:opacity-80"
              style={{ color: "var(--text-primary)" }}
            >
              {c.nombre}
            </Link>
            {c.empresa && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{c.empresa}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ScoreBar score={c.scoring} />
          <BucketBadge bucket={c.peorBucket} />
          <p className="font-mono text-lg font-black" style={{ color: "var(--color-danger)" }}>
            {c.deudaTotalStr}
          </p>
        </div>
      </div>

      {/* Facturas */}
      <div className="grid gap-0">
        {c.facturas.map((f) => (
          <div
            key={f.id}
            className="flex items-center justify-between px-5 py-3 text-sm"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-3">
              <BucketBadge bucket={f.bucket} />
              <Link
                href={`/admin/facturacion/${f.id}`}
                className="font-mono font-bold transition hover:opacity-80"
                style={{ color: "var(--text-secondary)" }}
              >
                {f.numero}
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {f.diasVencida > 0 && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  +{f.diasVencida} días
                </p>
              )}
              <p className="font-mono font-black text-red-600">{f.saldoStr}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
        {waHref && (
          <a
            href={waHref}
            rel="noopener noreferrer"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
            style={{ background: "#25D366" }}
          >
            <MessageSquare size={12} /> Recordatorio WA
          </a>
        )}
        {c.telefono && (
          <a
            href={`tel:${c.telefono}`}
            className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <PhoneCall size={12} /> {c.telefono}
          </a>
        )}
        <BloquearButton clienteId={c.id} bloqueado={c.bloqueado} />
      </div>
    </article>
  );
}
