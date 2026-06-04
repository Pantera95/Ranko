import { ArrowRight, FileText, Receipt, Truck } from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { CopyButton } from "@/components/public/CopyButton";
import { getClientPortalData } from "@/lib/client-portal";

export default async function ClientePage() {
  const session = await auth();
  const portal = await getClientPortalData(session?.user?.id);

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-6xl">
        <p className="font-mono-tech inline-flex items-center gap-2 text-xs" style={{ color: "var(--color-gold)" }}>
          <span className="block h-px w-6" style={{ background: "var(--color-gold)" }} />
          Portal del cliente
        </p>
        <h1 className="font-display-kinetic--tight mt-3 text-3xl uppercase leading-tight sm:text-4xl">
          Bienvenido, <span style={{ color: "var(--color-gold)" }}>{portal.clienteNombre}</span>
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          {portal.empresa ?? session?.user?.email ?? "Cuenta cliente Ranko Parts"}
        </p>
        {portal.isFallback ? (
          <div
            className="mt-5 p-4 text-sm"
            style={{
              border: "1px solid var(--border)",
              borderLeft: "2px solid var(--color-gold)",
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
            }}
          >
            Portal en modo demo hasta conectar la base de datos y ejecutar el seed.
          </div>
        ) : null}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {portal.metrics.map((item) => (
            <article
              key={item.label}
              className="p-5"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <p className="text-sm font-bold uppercase" style={{ color: "var(--text-muted)" }}>{item.label}</p>
              <p className="mt-3 font-mono text-3xl font-black">{item.value}</p>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{item.helper}</p>
            </article>
          ))}
        </div>

        {/* Quick actions — most common cliente tasks, deep-linked. The metric
            cards above show the same numbers but aren't clickable. These cards
            also raise a red-dot badge when items need attention. */}
        <section className="mt-4 grid gap-3 md:grid-cols-3">
          <ActionCard
            href="/cliente/cotizaciones"
            icon={<FileText size={16} />}
            title="Mis cotizaciones"
            description={
              portal.counts.cotizacionesPendientes > 0
                ? `${portal.counts.cotizacionesPendientes} esperando tu respuesta`
                : "Sin cotizaciones pendientes"
            }
            badge={portal.counts.cotizacionesPendientes}
            badgeTone="warning"
          />
          <ActionCard
            href="/cliente/facturas"
            icon={<Receipt size={16} />}
            title="Mis facturas"
            description={
              portal.counts.facturasPendientes > 0
                ? `${portal.counts.facturasPendientes} factura${portal.counts.facturasPendientes === 1 ? "" : "s"} por pagar`
                : "Todo al día"
            }
            badge={portal.counts.facturasPendientes}
            badgeTone="danger"
          />
          <ActionCard
            href="/cliente/pedidos"
            icon={<Truck size={16} />}
            title="Mis pedidos"
            description={
              portal.counts.ordenesActivas > 0
                ? `${portal.counts.ordenesActivas} pedido${portal.counts.ordenesActivas === 1 ? "" : "s"} en camino`
                : "Sin pedidos activos"
            }
            badge={portal.counts.ordenesActivas}
            badgeTone="neutral"
          />
        </section>
        <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article
            className="p-5"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <h2 className="font-display-kinetic text-xl uppercase">Mis vehículos</h2>
            <div className="mt-4 grid gap-3">
              {portal.vehicles.map((vehicle) => (
                <div
                  key={`${vehicle.marca}-${vehicle.modelo}-${vehicle.anio}`}
                  className="p-4"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)" }}
                >
                  <p className="font-black uppercase">
                    {vehicle.marca} {vehicle.modelo}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {vehicle.anio} · {vehicle.motor ?? "Motor por completar"}
                  </p>
                </div>
              ))}
            </div>
          </article>
          <article
            className="p-5"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <h2 className="font-display-kinetic text-xl uppercase">Código de referido</h2>
            <div className="mt-4 flex items-center gap-3">
              <p
                className="flex-1 p-4 font-mono text-2xl font-black"
                style={{
                  border: "1px dashed var(--border)",
                  background: "var(--bg-elevated)",
                }}
              >
                {portal.codigoReferido ?? "PENDIENTE"}
              </p>
              {portal.codigoReferido && (
                <CopyButton text={portal.codigoReferido} />
              )}
            </div>
            <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              Comparte este codigo con talleres o distribuidores para acumular beneficios comerciales.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
  badge,
  badgeTone,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: number;
  badgeTone: "warning" | "danger" | "neutral";
}) {
  const badgeColor =
    badgeTone === "danger"
      ? "var(--color-danger)"
      : badgeTone === "warning"
        ? "var(--color-gold)"
        : "var(--text-muted)";
  const showBadge = badge > 0;

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 p-4 transition hover:opacity-90"
      style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
    >
      <div
        className="relative flex size-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: "var(--bg-elevated)", color: "var(--color-gold)" }}
      >
        {icon}
        {showBadge && (
          <span
            className="absolute -right-1 -top-1 grid min-w-[18px] h-[18px] place-items-center rounded-full px-1 font-mono text-[10px] font-black text-white"
            style={{ background: badgeColor }}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black uppercase" style={{ color: "var(--text-primary)" }}>{title}</p>
        <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{description}</p>
      </div>
      <ArrowRight
        size={14}
        className="shrink-0 transition-transform group-hover:translate-x-1"
        style={{ color: "var(--text-muted)" }}
      />
    </Link>
  );
}
