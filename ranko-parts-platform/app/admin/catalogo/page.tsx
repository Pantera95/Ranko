import { Plus } from "lucide-react";
import Link from "next/link";

import { AdminCatalogTable } from "@/components/admin/AdminCatalogTable";
import { getAdminCatalogData } from "@/lib/admin-catalog";

export default async function AdminCatalogoPage() {
  const catalog = await getAdminCatalogData();

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
              Productos
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <h1 className="text-4xl font-black uppercase">Catálogo y SKUs</h1>
              <Link
                href="/admin/catalogo/nuevo"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase text-black transition hover:opacity-90"
                style={{ background: "var(--color-gold)" }}
              >
                <Plus size={13} /> Nuevo producto
              </Link>
            </div>
            <p className="mt-3 max-w-3xl leading-7" style={{ color: "var(--text-secondary)" }}>
              Control interno de productos, compatibilidades, margen y visibilidad en tienda.
            </p>
          </div>

          <div className="p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
              Reposicion prioritaria
            </p>
            <div className="mt-4 grid gap-3">
              {catalog.lowStock.length ? (
                catalog.lowStock.slice(0, 4).map((product) => (
                  <article
                    className="flex items-center justify-between gap-3 p-3"
                    key={product.id}
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  >
                    <div>
                      <p className="font-bold" style={{ color: "var(--text-primary)" }}>{product.nombre}</p>
                      <p className="mt-1 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{product.sku}</p>
                    </div>
                    <p className="font-mono text-sm font-black" style={{ color: "var(--color-danger)" }}>
                      {product.stockTotal}/{product.stockMinimo}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No hay SKUs por debajo del minimo.</p>
              )}
            </div>
          </div>
        </div>

        {catalog.isFallback ? (
          <div
            className="mt-8 p-4 text-sm"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderLeft: "2px solid var(--color-gold)",
              color: "var(--text-secondary)",
            }}
          >
            Catalogo admin en modo demo: conecta `DATABASE_URL`, ejecuta `npm run db:push` y
            `npm run db:seed` para operar con productos reales.
          </div>
        ) : null}

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          {catalog.metrics.map((metric) => (
            <article
              className="p-5"
              key={metric.label}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>{metric.label}</p>
              <p className="mt-3 font-mono text-3xl font-black">{metric.value}</p>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{metric.helper}</p>
            </article>
          ))}
        </section>

        <AdminCatalogTable initialProducts={catalog.products} isFallback={catalog.isFallback} />
      </section>
    </main>
  );
}
