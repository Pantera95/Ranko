import { InventoryTable } from "@/components/admin/InventoryTable";
import { getInventoryData } from "@/lib/inventory";

export default async function AdminInventarioPage() {
  const inventory = await getInventoryData();

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
              Almacenes
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase">Inventario</h1>
            <p className="mt-3 max-w-3xl leading-7" style={{ color: "var(--text-secondary)" }}>
              Control de stock por almacen. Ajusta cantidades, minimos, maximos, ubicacion y
              clasificacion ABC directamente desde la tabla.
            </p>
          </div>

          <div className="p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
              Reposicion urgente
            </p>
            <div className="mt-4 grid gap-3">
              {inventory.items.filter((item) => item.lowStock).length ? (
                inventory.items
                  .filter((item) => item.lowStock)
                  .slice(0, 4)
                  .map((item) => (
                    <article
                      className="flex items-center justify-between gap-3 p-3"
                      key={item.id}
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                    >
                      <div>
                        <p className="font-bold" style={{ color: "var(--text-primary)" }}>{item.nombre}</p>
                        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                          {item.almacen} · {item.ciudad}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-black" style={{ color: "var(--color-danger)" }}>
                          {item.cantidad} / {item.stockMinimo}
                        </p>
                        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>actual / min</p>
                      </div>
                    </article>
                  ))
              ) : (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Todos los SKUs estan sobre el minimo.</p>
              )}
            </div>
          </div>
        </div>

        {inventory.isFallback ? (
          <div
            className="mt-8 p-4 text-sm"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderLeft: "2px solid var(--color-gold)",
              color: "var(--text-secondary)",
            }}
          >
            Inventario en modo demo: conecta{" "}
            <code className="font-mono" style={{ color: "var(--color-gold)" }}>DATABASE_URL</code>, ejecuta{" "}
            <code className="font-mono" style={{ color: "var(--color-gold)" }}>npm run db:push</code> y{" "}
            <code className="font-mono" style={{ color: "var(--color-gold)" }}>npm run db:seed</code> para operar
            con datos reales.
          </div>
        ) : null}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {inventory.metrics.map((metric) => (
            <article
              className="p-5"
              key={metric.label}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>{metric.label}</p>
              <p
                className="mt-3 font-mono text-3xl font-black"
                style={{ color: metric.danger ? "var(--color-danger)" : "var(--text-primary)" }}
              >
                {metric.value}
              </p>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{metric.helper}</p>
            </article>
          ))}
        </section>

        <InventoryTable initialItems={inventory.items} isFallback={inventory.isFallback} />
      </section>
    </main>
  );
}
