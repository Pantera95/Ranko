import { CatalogFilters } from "@/components/public/CatalogFilters";
import { ProductCard } from "@/components/public/ProductCard";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { getCatalogPageData, type CatalogFilters as CatalogFilterState } from "@/lib/catalog";

type TiendaPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TiendaPage({ searchParams }: TiendaPageProps) {
  const params = await searchParams;
  const filters = parseCatalogFilters(params);
  const catalog = await getCatalogPageData(filters);

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <PublicNavbar />
      {/* Header band — sits on a darker stage with subtle blueprint grid to
          echo the hero, then transitions to the lighter list surface below. */}
      <section
        className="relative overflow-hidden border-b"
        style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-50 bg-[linear-gradient(90deg,rgba(245,197,24,0.06)_1px,transparent_1px),linear-gradient(rgba(245,197,24,0.05)_1px,transparent_1px)] bg-[size:42px_42px]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-32 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 lg:block"
          style={{
            background:
              "radial-gradient(circle at center, rgba(245,197,24,0.18), transparent 65%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="font-mono-tech inline-flex items-center gap-2 text-xs" style={{ color: "var(--color-gold)" }}>
                <span className="block h-px w-8" style={{ background: "var(--color-gold)" }} />
                Tienda Ranko Parts
              </p>
              <h1 className="font-display-kinetic--tight mt-4 text-4xl uppercase leading-[1.05] sm:text-5xl">
                Catálogo <br />
                <span style={{ color: "var(--color-gold)" }}>automotriz</span>
              </h1>
              <p className="mt-5 max-w-prose leading-8" style={{ color: "var(--text-secondary)" }}>
                Repuestos verificados para <strong className="text-[var(--text-primary)]">4×4, SUVs y coupés</strong>{" "}
                + aceites, aditivos y filtros de motor.
                Búsqueda por compatibilidad, stock real y consulta directa por WhatsApp.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Jeep", "Chrysler", "Dodge", "Ford", "Liqui-Moly", "Mopar", "K&N"].map((brand) => (
                  <span
                    key={brand}
                    className="font-mono-tech rounded-sm px-3 py-1.5 text-[10px] transition-colors hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                    style={{
                      border: "1px solid var(--border)",
                      background: "var(--bg-card)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
            <CatalogFilters filters={filters} options={catalog.options} />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

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
            Catalogo en modo demo: conecta `DATABASE_URL`, ejecuta `npm run db:push` y
            `npm run db:seed` para mostrar productos reales desde Postgres/Supabase.
          </div>
        ) : null}

        <div className="mt-8 flex items-end justify-between gap-4 border-b pb-4" style={{ borderColor: "var(--border)" }}>
          <div>
            <p className="font-mono-tech text-[10px]" style={{ color: "var(--text-muted)" }}>
              Resultados
            </p>
            <h2 className="font-display-kinetic mt-1 text-2xl uppercase">Productos disponibles</h2>
          </div>
          <p className="font-mono text-sm font-black" style={{ color: "var(--color-gold)" }}>
            {catalog.total} {catalog.total === 1 ? "resultado" : "resultados"}
          </p>
        </div>

        {catalog.products.length ? (
          <section className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {catalog.products.map((product) => (
              <ProductCard key={product.sku} product={product} />
            ))}
          </section>
        ) : (
          <section
            className="mt-5 p-8 text-center"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <h2 className="font-display-kinetic text-2xl uppercase">Sin resultados</h2>
            <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
              Ajusta los filtros o escribe por WhatsApp para ubicar el repuesto exacto.
            </p>
          </section>
        )}
      </section>
      <WhatsAppFloating />
    </main>
  );
}

function parseCatalogFilters(params: Record<string, string | string[] | undefined>): CatalogFilterState {
  const anio = pickString(params.anio);
  return {
    categoria: pickString(params.categoria),
    marca: pickString(params.marca),
    modelo: pickString(params.modelo),
    sistema: pickString(params.sistema),
    anio: anio ? Number(anio) : undefined,
  };
}

function pickString(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}
