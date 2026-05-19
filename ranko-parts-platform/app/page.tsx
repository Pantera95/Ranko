import Link from "next/link";
import { ArrowRight, Gauge, PackageSearch, ShieldCheck } from "lucide-react";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { CompatibilitySearch } from "@/components/public/CompatibilitySearch";
import { ProductCard } from "@/components/public/ProductCard";
import { PublicStatBand } from "@/components/public/PublicStatBand";
import { getPublicHomeData } from "@/lib/public-home";

const especialidades = ["Jeep", "Chrysler", "Dodge", "Ford"];

const pilares = [
  {
    icon: ShieldCheck,
    title: "Repuestos verificados",
    body: "Catalogo pensado para compatibilidad real, marcas confiables y trazabilidad de cada orden.",
  },
  {
    icon: PackageSearch,
    title: "Inventario multi-almacen",
    body: "Base lista para Caracas, Lecheria y despacho nacional con control por SKU.",
  },
  {
    icon: Gauge,
    title: "Operacion en vivo",
    body: "CRM, facturacion, pagos, deudas, alertas y reportes en un mismo panel.",
  },
];

export default async function Home() {
  const home = await getPublicHomeData();

  return (
    <main className="min-h-screen bg-black text-white">
      <PublicNavbar />
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,197,24,0.10)_1px,transparent_1px),linear-gradient(rgba(245,197,24,0.08)_1px,transparent_1px)] bg-[size:42px_42px]" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(245,197,24,0.22),transparent_62%)]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="inline-flex rounded border border-[var(--color-gold)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-gold)]">
              Caracas & Lecheria · Envios a toda Venezuela
            </p>
            <h1 className="mt-6 max-w-4xl font-[var(--font-display)] text-6xl font-black uppercase leading-none tracking-normal text-white sm:text-7xl lg:text-8xl">
              Repuestos que no fallan.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Jeep, Chrysler, Dodge y Ford con lubricantes Liqui-Moly, K&N y un
              sistema operativo completo para vender, cobrar, despachar y medir.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/tienda"
                className="inline-flex h-12 items-center justify-center gap-2 rounded bg-[var(--color-gold)] px-6 text-sm font-black uppercase text-black transition hover:bg-[var(--color-gold-hover)]"
              >
                Ver catalogo <ArrowRight size={18} />
              </Link>
              <Link
                href="/b2b"
                className="inline-flex h-12 items-center justify-center rounded border border-white/20 px-6 text-sm font-black uppercase text-white transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                Cuenta B2B
              </Link>
            </div>
            {home.isFallback ? (
              <div className="mt-6 max-w-xl border border-[var(--color-gold)] bg-black/70 p-4 text-sm text-zinc-300">
                Landing en modo demo: conecta `DATABASE_URL` y ejecuta `npm run db:seed`
                para activar contadores y productos reales.
              </div>
            ) : null}
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded border border-white/10 bg-[#111111] p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-[var(--color-gold)]" />
            <div className="grid h-full content-between gap-8">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">
                  Plataforma Enterprise
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {["CRM", "Billing", "Inventario", "BI"].map((item) => (
                    <div key={item} className="border border-white/10 bg-black p-4">
                      <p className="font-mono text-2xl font-black text-[var(--color-gold)]">
                        {item}
                      </p>
                      <p className="mt-2 text-xs uppercase text-zinc-500">Modulo activo</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-[var(--color-border)] bg-black p-5">
                <p className="text-sm uppercase text-zinc-400">Especialistas en</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {especialidades.map((marca) => (
                    <Link
                      key={marca}
                      href={`/tienda?marca=${marca}`}
                      className="rounded border border-[var(--color-gold)] px-3 py-2 font-mono text-sm font-bold text-[var(--color-gold)] transition hover:bg-[var(--color-gold)] hover:text-black"
                    >
                      {marca}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicStatBand stats={home.stats} />

      <section className="px-4 py-16 sm:px-6 lg:px-8" style={{ background: "var(--bg-surface)", color: "var(--text-primary)" }}>
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          {pilares.map((pilar) => (
            <article
              key={pilar.title}
              className="p-6"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <pilar.icon size={28} style={{ color: "var(--color-gold)" }} />
              <h2 className="mt-5 text-xl font-black uppercase">{pilar.title}</h2>
              <p className="mt-3 leading-7" style={{ color: "var(--text-secondary)" }}>{pilar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-black px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-gold)]">
              Busqueda por compatibilidad
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase text-white">Encuentra el repuesto correcto</h2>
            <p className="mt-4 leading-8 text-zinc-400">
              Filtra por marca, modelo, ano y sistema. La misma estructura alimenta el
              catalogo publico, el portal del cliente y el CRM interno.
            </p>
          </div>
          <CompatibilitySearch options={home.options} />
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8" style={{ background: "var(--bg-surface)", color: "var(--text-primary)" }}>
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
                Catalogo destacado
              </p>
              <h2 className="mt-3 text-4xl font-black uppercase">Productos mas consultados</h2>
            </div>
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded px-5 text-sm font-black uppercase transition hover:opacity-80"
              href="/tienda"
              style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
            >
              Ver tienda <ArrowRight size={18} />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {home.featuredProducts.map((product) => (
              <ProductCard key={product.sku} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-gold)]">
              Talleres y distribuidores
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase">Compra con precios por volumen</h2>
            <p className="mt-4 leading-8 text-zinc-300">
              Cuentas B2B con credito comercial, historial de facturas, seguimiento de
              pedidos y atencion prioritaria del equipo Ranko Parts.
            </p>
            <Link
              href="/b2b"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 px-6 text-sm font-black uppercase text-black transition hover:opacity-90"
              style={{ background: "var(--color-gold)" }}
            >
              Solicitar cuenta B2B <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Precios por volumen", "Credito comercial", "Facturas en portal", "Despacho priorizado"].map(
              (benefit) => (
                <div key={benefit} className="border border-white/10 bg-white/5 p-5">
                  <p className="font-black uppercase text-[var(--color-gold)]">{benefit}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <footer className="bg-[var(--color-gold)] px-4 py-8 text-black sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 font-bold uppercase sm:flex-row">
          <p>Ranko Parts · 2026</p>
          <p>WhatsApp +58 414-7903498 · Instagram @ranko_parts</p>
        </div>
      </footer>
      <WhatsAppFloating />
    </main>
  );
}
