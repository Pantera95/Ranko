"use client";

import { AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Target, TrendingUp, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { InsightsSnapshot } from "@/lib/insights";

/**
 * Cliente component que renderiza el snapshot completo de insights BI.
 * El server pasa los datos pre-calculados; este componente sólo presenta.
 */

const TONE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  neutral: {
    bg: "var(--bg-card)",
    border: "var(--border)",
    text: "var(--text-primary)",
  },
  success: {
    bg: "color-mix(in srgb, var(--color-success) 6%, var(--bg-card))",
    border: "var(--color-success)",
    text: "var(--color-success)",
  },
  warning: {
    bg: "color-mix(in srgb, var(--color-gold) 8%, var(--bg-card))",
    border: "var(--color-gold)",
    text: "var(--color-gold)",
  },
  danger: {
    bg: "color-mix(in srgb, var(--color-danger) 6%, var(--bg-card))",
    border: "var(--color-danger)",
    text: "var(--color-danger)",
  },
};

const SEVERIDAD_STYLES: Record<string, { icon: string; border: string }> = {
  info: { icon: "var(--text-muted)", border: "var(--border)" },
  warning: { icon: "var(--color-gold)", border: "var(--color-gold)" },
  critical: { icon: "var(--color-danger)", border: "var(--color-danger)" },
};

function money(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(2)}`;
}

export function InsightsBI({ snapshot, hasData }: { snapshot: InsightsSnapshot; hasData: boolean }) {
  if (!hasData) {
    return (
      <section className="grid place-items-center p-12 text-center" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
        <BarChart3 size={40} style={{ color: "var(--text-muted)" }} />
        <p className="mt-4 font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
          Aún no hay reportes de ventas importados
        </p>
        <p className="mt-2 text-xs leading-5" style={{ color: "var(--text-muted)" }}>
          Sube tu primer archivo arriba y los insights aparecerán aquí automáticamente.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-6">
      {/* KPI Band */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {snapshot.kpis.map((kpi, idx) => {
          const tone = TONE_STYLES[kpi.tone];
          return (
            <article
              key={kpi.label + idx}
              className="relative overflow-hidden p-5"
              style={{
                background: tone.bg,
                border: `1px solid ${tone.border}`,
                borderLeft: `2px solid ${tone.border}`,
              }}
            >
              <p className="font-mono-tech text-[10px]" style={{ color: "var(--text-muted)" }}>
                {kpi.label}
              </p>
              <p className="mt-3 font-mono text-2xl font-black leading-none" style={{ color: tone.text }}>
                {kpi.value}
              </p>
              {kpi.delta && (
                <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: kpi.delta.positive ? "var(--color-success)" : "var(--color-danger)" }}>
                  {kpi.delta.positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  {Math.abs(kpi.delta.pct).toFixed(1)}%
                  <span className="opacity-70">{kpi.delta.vsLabel}</span>
                </p>
              )}
              {kpi.meta && (
                <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Meta: {typeof kpi.meta.target === "number" ? (kpi.label.includes("Margen") ? `${kpi.meta.target.toFixed(1)}%` : money(kpi.meta.target)) : kpi.meta.target}
                  {" · "}{kpi.meta.achievementPct.toFixed(0)}% logro
                </p>
              )}
            </article>
          );
        })}
      </section>

      {/* Alertas */}
      {snapshot.alertas.length > 0 && (
        <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <div
            className="flex items-center gap-2 px-5 py-3"
            style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
          >
            <AlertTriangle size={13} style={{ color: "var(--color-gold)" }} />
            <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>
              Requiere atención ({snapshot.alertas.length})
            </p>
          </div>
          <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {snapshot.alertas.map((a, i) => {
              const sev = SEVERIDAD_STYLES[a.severidad];
              return (
                <li key={i} className="flex items-start gap-3 px-5 py-3">
                  <span
                    className="grid size-7 shrink-0 place-items-center"
                    style={{ background: "var(--bg-elevated)", border: `1px solid ${sev.border}`, color: sev.icon }}
                  >
                    <AlertTriangle size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase" style={{ color: "var(--text-primary)" }}>
                      {a.titulo}
                    </p>
                    <p className="mt-1 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
                      {a.descripcion}
                    </p>
                    {a.accion && (
                      <p className="mt-1 text-[10px] italic" style={{ color: "var(--text-muted)" }}>
                        → {a.accion}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Charts row 1: Revenue + Transacciones */}
      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue mensual" subtitle="Tendencia del período" icon={<TrendingUp size={13} />}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={snapshot.trends.revenueMensual}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="period" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                formatter={(v: unknown) => money(Number(v))}
              />
              <Line type="monotone" dataKey="value" stroke="var(--color-gold)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--color-gold)" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Transacciones mensuales" subtitle="Volumen por mes" icon={<BarChart3 size={13} />}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={snapshot.trends.transaccionesMensuales}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="period" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                formatter={(v: unknown) => Number(v).toLocaleString("en-US")}
              />
              <Bar dataKey="value" fill="var(--color-gold)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Top performers */}
      <section className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Top SKUs" subtitle="Por revenue del período" icon={<BarChart3 size={13} />}>
          <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {snapshot.topSkus.slice(0, 8).map((p) => (
              <li key={p.rank} className="flex items-center gap-3 py-2 text-xs">
                <span className="font-mono-tech text-[10px] w-5" style={{ color: "var(--color-gold)" }}>
                  #{p.rank}
                </span>
                <span className="min-w-0 flex-1 truncate" style={{ color: "var(--text-secondary)" }}>{p.label}</span>
                <span className="font-mono font-black text-[11px]" style={{ color: "var(--text-primary)" }}>{p.displayValue}</span>
                <span className="font-mono text-[10px] w-12 text-right" style={{ color: "var(--text-muted)" }}>{p.pctOfTotal.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </ChartCard>

        <ChartCard title="Top clientes" subtitle="Por compra del período" icon={<Users size={13} />}>
          <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {snapshot.topClientes.slice(0, 8).map((p) => (
              <li key={p.rank} className="flex items-center gap-3 py-2 text-xs">
                <span className="font-mono-tech text-[10px] w-5" style={{ color: "var(--color-gold)" }}>
                  #{p.rank}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono" style={{ color: "var(--text-secondary)" }}>{p.label}</span>
                <span className="font-mono font-black text-[11px]" style={{ color: "var(--text-primary)" }}>{p.displayValue}</span>
              </li>
            ))}
          </ul>
        </ChartCard>

        <ChartCard title="Top vendedores" subtitle="Por revenue generado" icon={<Users size={13} />}>
          <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {snapshot.topVendedores.slice(0, 8).map((p) => (
              <li key={p.rank} className="flex items-center gap-3 py-2 text-xs">
                <span className="font-mono-tech text-[10px] w-5" style={{ color: "var(--color-gold)" }}>
                  #{p.rank}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono" style={{ color: "var(--text-secondary)" }}>{p.label}</span>
                <span className="font-mono font-black text-[11px]" style={{ color: "var(--text-primary)" }}>{p.displayValue}</span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </section>

      {/* Proyección + ABC + Concentración */}
      <section className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Proyección" subtitle="Run-rate y cierre estimado" icon={<TrendingUp size={13} />}>
          <div className="grid gap-3 text-sm">
            <Row
              label="Run-rate mensual"
              value={money(snapshot.proyeccion.revenueRunRateMes)}
              hint="Ritmo mensual basado en período actual"
            />
            <Row
              label="Días restantes"
              value={String(snapshot.proyeccion.diasRestantesMes)}
              hint="Hasta cierre del mes calendario"
            />
            <Row
              label="Proyección fin de mes"
              value={money(snapshot.proyeccion.proyeccionFinMes)}
              hint="Si mantienes el ritmo actual"
              highlight
            />
          </div>
        </ChartCard>

        <ChartCard title="Análisis ABC" subtitle="Concentración de inventario por revenue" icon={<BarChart3 size={13} />}>
          <ul className="grid gap-2">
            {snapshot.abc.map((c) => (
              <li key={c.clase} className="flex items-center gap-3 px-3 py-2 text-xs" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                <span
                  className="grid size-8 place-items-center font-mono text-sm font-black"
                  style={{ background: c.clase === "A" ? "var(--color-gold)" : c.clase === "B" ? "var(--text-muted)" : "var(--border)", color: c.clase === "A" ? "#000" : "var(--bg-base)" }}
                >
                  {c.clase}
                </span>
                <div className="flex-1">
                  <p className="font-bold" style={{ color: "var(--text-primary)" }}>
                    {c.skus.toLocaleString("en-US")} SKUs
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {c.pctRevenue.toFixed(1)}% del revenue
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </ChartCard>

        <ChartCard title="Concentración de clientes" subtitle="Top 5 — riesgo si >30%" icon={<Target size={13} />}>
          <ul className="grid gap-1">
            {snapshot.concentracion.map((c, i) => (
              <li key={i} className="flex items-center justify-between gap-2 px-3 py-2 text-xs" style={{ background: c.riesgo ? "color-mix(in srgb, var(--color-danger) 6%, var(--bg-elevated))" : "var(--bg-elevated)", border: `1px solid ${c.riesgo ? "var(--color-danger)" : "var(--border-subtle)"}` }}>
                <span className="min-w-0 truncate font-mono" style={{ color: "var(--text-secondary)" }}>{c.cliente}</span>
                <span className="font-mono font-black" style={{ color: c.riesgo ? "var(--color-danger)" : "var(--text-primary)" }}>
                  {c.pct.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </section>

      {/* Mix vendedores + Estacionalidad */}
      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Mix por vendedor" subtitle="Distribución del revenue" icon={<Users size={13} />}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={snapshot.mixVendedores.slice(0, 8)} layout="vertical">
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="vendedor" type="category" stroke="var(--text-muted)" tick={{ fontSize: 10 }} width={70} />
              <Tooltip
                contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                formatter={(v: unknown) => money(Number(v))}
              />
              <Bar dataKey="revenue" fill="var(--color-gold)" radius={[0, 4, 4, 0]}>
                {snapshot.mixVendedores.slice(0, 8).map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "var(--color-gold)" : "var(--text-muted)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Estacionalidad" subtitle="Revenue acumulado por mes" icon={<BarChart3 size={13} />}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={snapshot.estacionalidad}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="nombre" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                formatter={(v: unknown) => money(Number(v))}
              />
              <Bar dataKey="revenuePromedio" fill="var(--color-gold)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
      <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
        <span style={{ color: "var(--color-gold)" }}>{icon}</span>
        <div>
          <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>{title}</p>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </article>
  );
}

function Row({ label, value, hint, highlight }: { label: string; value: string; hint: string; highlight?: boolean }) {
  return (
    <div className="flex items-end justify-between gap-3" style={highlight ? { borderTop: "1px solid var(--color-gold)", paddingTop: "0.75rem" } : undefined}>
      <div>
        <p className="text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>{label}</p>
        <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>{hint}</p>
      </div>
      <p className="font-mono text-lg font-black" style={{ color: highlight ? "var(--color-gold)" : "var(--text-primary)" }}>
        {value}
      </p>
    </div>
  );
}
