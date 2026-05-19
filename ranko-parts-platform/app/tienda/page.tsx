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
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
              Tienda Ranko Parts
            </p>
            <h1 className="mt-3 text-5xl font-black uppercase">Catalogo automotriz</h1>
            <p className="mt-4 leading-8" style={{ color: "var(--text-secondary)" }}>
              Productos para Jeep, Chrysler, Dodge y Ford con busqueda por compatibilidad,
              precio USD, stock y consulta directa por WhatsApp.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Jeep", "Chrysler", "Dodge", "Ford", "Liqui-Moly", "Mopar", "K&N"].map((brand) => (
                <span
                  key={brand}
                  className="px-3 py-2 text-xs font-black uppercase"
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

        <div className="mt-8 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black uppercase">Productos disponibles</h2>
          <p className="font-mono text-sm font-black" style={{ color: "var(--text-muted)" }}>
            {catalog.total} resultados
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
            <h2 className="text-2xl font-black uppercase">Sin resultados</h2>
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
