import { OrdersTable } from "@/components/admin/OrdersTable";
import { getOrdersData } from "@/lib/orders";

export default async function AdminOrdenesPage() {
  const data = await getOrdersData();

  const enCurso = data.orders.filter(
    (o) => o.estado !== "ENTREGADO" && o.estado !== "CANCELADO",
  );

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="font-mono-tech inline-flex items-center gap-2 text-xs" style={{ color: "var(--color-gold)" }}>
              <span className="block h-px w-6" style={{ background: "var(--color-gold)" }} />
              Operaciones
            </p>
            <h1 className="font-display-kinetic--tight mt-3 text-3xl uppercase leading-tight sm:text-4xl">Órdenes</h1>
            <p className="mt-3 max-w-3xl leading-7" style={{ color: "var(--text-secondary)" }}>
              Control de despachos desde confirmacion hasta entrega. Avanza estados,
              registra responsable y revisa el historial completo de cada orden.
            </p>
          </div>

          <div className="p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
              Ordenes en curso
            </p>
            <div className="mt-4 grid gap-3">
              {enCurso.length ? (
                enCurso.slice(0, 4).map((o) => (
                  <article
                    className="flex items-center justify-between gap-3 p-3"
                    key={o.id}
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  >
                    <div>
                      <p className="font-mono font-bold" style={{ color: "var(--color-gold)" }}>{o.codigo}</p>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{o.cliente}</p>
                    </div>
                    <span
                      className="px-2 py-1 text-[10px] font-black uppercase"
                      style={{ background: "var(--bg-base)", color: "var(--text-secondary)" }}
                    >
                      {o.estado.replace("_", " ")}
                    </span>
                  </article>
                ))
              ) : (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sin ordenes activas.</p>
              )}
            </div>
          </div>
        </div>

        {data.isFallback ? (
          <div
            className="mt-8 p-4 text-sm"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderLeft: "2px solid var(--color-gold)",
              color: "var(--text-secondary)",
            }}
          >
            Ordenes en modo demo: conecta{" "}
            <code className="font-mono" style={{ color: "var(--color-gold)" }}>DATABASE_URL</code>, ejecuta{" "}
            <code className="font-mono" style={{ color: "var(--color-gold)" }}>npm run db:push</code> y{" "}
            <code className="font-mono" style={{ color: "var(--color-gold)" }}>npm run db:seed</code> para
            operar con datos reales.
          </div>
        ) : null}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {data.metrics.map((m) => (
            <article
              className="p-5"
              key={m.label}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>{m.label}</p>
              <p
                className="mt-3 font-mono text-3xl font-black"
                style={{ color: m.danger ? "var(--color-danger)" : "var(--text-primary)" }}
              >
                {m.value}
              </p>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{m.helper}</p>
            </article>
          ))}
        </section>

        <OrdersTable
          facturasSinOrden={data.facturasSinOrden}
          initialOrders={data.orders}
          isFallback={data.isFallback}
        />
      </section>
    </main>
  );
}
