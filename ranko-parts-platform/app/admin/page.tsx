import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Boxes,
  FileText,
  FileClock,
  HandCoins,
  LayoutGrid,
  Package,
  Receipt,
  Truck,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { getDashboardData } from "@/lib/dashboard";

const MODULES = [
  { href: "/admin/crm", label: "CRM / Pipeline", icon: LayoutGrid, group: "Ventas" },
  { href: "/admin/clientes", label: "Clientes", icon: Users, group: "Ventas" },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: FileText, group: "Ventas" },
  { href: "/admin/facturacion", label: "Facturación", icon: Receipt, group: "Ventas" },
  { href: "/admin/deudas", label: "Panel de deudas", icon: HandCoins, group: "Finanzas" },
  { href: "/admin/pagos", label: "Pagos", icon: HandCoins, group: "Finanzas" },
  { href: "/admin/alertas", label: "Alertas", icon: AlertTriangle, group: "Finanzas" },
  { href: "/admin/inventario", label: "Inventario", icon: Boxes, group: "Ops" },
  { href: "/admin/catalogo", label: "Catálogo", icon: Package, group: "Ops" },
  { href: "/admin/ordenes", label: "Órdenes", icon: Truck, group: "Ops" },
  { href: "/admin/reportes", label: "Reportes / BI", icon: BarChart3, group: "Intel" },
  { href: "/admin/automatizacion", label: "Automatización", icon: Bot, group: "Intel" },
  { href: "/admin/usuarios", label: "Usuarios", icon: UserCog, group: "Sistema" },
  { href: "/admin/logs", label: "Logs", icon: FileClock, group: "Sistema" },
] as const;

const TONE_COLORS: Record<string, string> = {
  neutral: "var(--border)",
  warning: "#b45309",
  danger: "var(--color-danger)",
  success: "var(--color-success)",
};

const TONE_VALUE_COLORS: Record<string, string> = {
  neutral: "var(--text-primary)",
  warning: "#b45309",
  danger: "var(--color-danger)",
  success: "var(--color-success)",
};

function RevenueBar({ amount, max }: { amount: number; max: number }) {
  const pct = max > 0 ? Math.round((amount / max) * 100) : 0;
  return (
    <div className="flex h-20 flex-col items-center justify-end gap-1">
      <div className="w-7 rounded-t-sm" style={{ height: `${Math.max(pct, 2)}%`, background: "var(--color-gold)", opacity: pct > 0 ? 1 : 0.2 }} />
    </div>
  );
}

export default async function AdminPage() {
  const [session, dashboard] = await Promise.all([auth(), getDashboardData()]);

  const maxRevenue = Math.max(...dashboard.weeklyRevenue.map((d) => d.amount), 1);
  const totalWeek = dashboard.weeklyRevenue.reduce((s, d) => s + d.amount, 0);

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono-tech inline-flex items-center gap-2 text-xs" style={{ color: "var(--color-gold)" }}>
              <span className="block h-px w-6" style={{ background: "var(--color-gold)" }} />
              Ranko Parts SaaS
            </p>
            <h1 className="font-display-kinetic--tight mt-3 text-3xl uppercase leading-tight sm:text-4xl">Dashboard ejecutivo</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              {session?.user?.name ?? session?.user?.email} ·{" "}
              <span className="font-mono font-bold" style={{ color: "var(--color-gold)" }}>
                {session?.user?.rol}
              </span>
            </p>
          </div>
          <Link
            href="/admin/reportes"
            className="group hidden shrink-0 items-center gap-2 rounded-sm px-5 py-3 text-xs font-black uppercase tracking-wider text-black shadow-[0_8px_24px_-8px_rgba(245,197,24,0.5)] transition-all hover:shadow-[0_12px_32px_-8px_rgba(245,197,24,0.8)] sm:inline-flex"
            style={{ background: "var(--color-gold)" }}
          >
            <BarChart3 size={14} />
            <span>Reportes completos</span>
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {dashboard.isFallback && (
          <div
            className="mt-5 p-4 text-sm"
            style={{ border: "1px solid var(--border)", borderLeft: "2px solid var(--color-gold)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
          >
            Modo demo — conecta{" "}
            <code className="rounded px-1 font-mono" style={{ background: "var(--bg-elevated)", color: "var(--color-gold)" }}>DATABASE_URL</code>
            , ejecuta{" "}
            <code className="rounded px-1 font-mono" style={{ background: "var(--bg-elevated)", color: "var(--color-gold)" }}>npm run db:push</code>
            {" "}y{" "}
            <code className="rounded px-1 font-mono" style={{ background: "var(--bg-elevated)", color: "var(--color-gold)" }}>npm run db:seed</code>
            {" "}para activar datos reales.
          </div>
        )}

        {/* KPI band — "Data-Dense" treatment recommended by ui-ux-pro-max for
            admin/financial dashboards. Gold left rule + small index + value
            front-and-center, lighter helper. */}
        <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {dashboard.metrics.map((m, idx) => (
            <article
              key={m.label}
              className="group relative overflow-hidden p-5 transition-colors hover:border-[var(--color-gold)]/40"
              style={{
                border: "1px solid var(--border)",
                borderLeft: "2px solid var(--color-gold)",
                background: "var(--bg-card)",
              }}
            >
              <span
                aria-hidden="true"
                className="font-mono-tech absolute right-3 top-3 text-[10px] opacity-50"
                style={{ color: "var(--color-gold)" }}
              >
                K{String(idx + 1).padStart(2, "0")}
              </span>
              <p
                className="font-mono-tech text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                {m.label}
              </p>
              <p className="mt-3 font-mono text-3xl font-black leading-none">{m.value}</p>
              <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>{m.helper}</p>
            </article>
          ))}
        </section>

        {/* Revenue chart + Alerts row */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">

          {/* Weekly revenue mini-chart */}
          <article
            className="p-5"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <div className="flex items-center justify-between">
              <p className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
                Ingresos — últimos 7 días
              </p>
              <p className="font-mono text-sm font-black" style={{ color: "var(--color-gold)" }}>
                ${totalWeek.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="mt-4 flex items-end justify-between gap-1">
              {dashboard.weeklyRevenue.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <RevenueBar amount={d.amount} max={maxRevenue} />
                  <span className="text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </article>

          {/* Attention needed */}
          <article
            className="min-w-[220px] p-5"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <p className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
              Atención requerida
            </p>
            <div className="mt-4 grid gap-2">
              {dashboard.alerts.map((a) => (
                <Link
                  key={a.title}
                  href={a.href}
                  className="flex items-center justify-between gap-4 rounded px-3 py-2.5 transition hover:opacity-80"
                  style={{
                    border: `1px solid ${TONE_COLORS[a.tone]}`,
                    background: "var(--bg-elevated)",
                  }}
                >
                  <p className="text-xs font-bold uppercase" style={{ color: "var(--text-secondary)" }}>
                    {a.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-black" style={{ color: TONE_VALUE_COLORS[a.tone] }}>
                      {a.value}
                    </p>
                    <ArrowRight size={10} style={{ color: "var(--text-muted)" }} />
                  </div>
                </Link>
              ))}
              <Link
                href="/admin/logs"
                className="flex items-center justify-between gap-4 rounded px-3 py-2.5 transition hover:opacity-80"
                style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)" }}
              >
                <p className="text-xs font-bold uppercase" style={{ color: "var(--text-secondary)" }}>
                  Logs hoy
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-black">{dashboard.recentLogs}</p>
                  <ArrowRight size={10} style={{ color: "var(--text-muted)" }} />
                </div>
              </Link>
            </div>
          </article>
        </div>

        {/* Module quick-access */}
        <section className="mt-8">
          <p className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
            Módulos
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="flex flex-col gap-3 p-4 transition hover:opacity-80"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
                >
                  <div
                    className="flex size-8 items-center justify-center"
                    style={{ background: "var(--bg-elevated)" }}
                  >
                    <Icon size={15} style={{ color: "var(--color-gold)" }} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase leading-tight">{mod.label}</p>
                    <p className="mt-0.5 text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>
                      {mod.group}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}
