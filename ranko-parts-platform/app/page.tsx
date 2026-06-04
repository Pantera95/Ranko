import Link from "next/link";
import { ArrowRight, Droplets, Gauge, Mountain, PackageSearch, ShieldCheck, Wrench } from "lucide-react";

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
    body: "Catálogo con compatibilidad real para 4x4, SUVs y coupés. Marcas confiables y trazabilidad por orden.",
  },
  {
    icon: Droplets,
    title: "Lubricantes premium",
    body: "Liqui-Moly, Mopar y K&N. Aceites, aditivos y filtros para motor, transmisión y diferencial.",
  },
  {
    icon: PackageSearch,
    title: "Stock multi-almacén",
    body: "Caracas, Lechería y despacho nacional. Visibilidad por SKU y por almacén en tiempo real.",
  },
];

export default async function Home() {
  const home = await getPublicHomeData();

  return (
    <main className="min-h-screen bg-black text-white">
      <PublicNavbar />
      <section className="relative overflow-hidden border-b border-white/10">
        {/* Layered industrial backdrop: faint engineering grid + diagonal slash + gold light halo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,197,24,0.08)_1px,transparent_1px),linear-gradient(rgba(245,197,24,0.06)_1px,transparent_1px)] bg-[size:48px_48px]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,197,24,0.18),transparent_55%),radial-gradient(circle_at_top_right,rgba(245,197,24,0.25),transparent_60%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-32 top-1/2 hidden h-[600px] w-[600px] -translate-y-1/2 rotate-12 border-l-4 border-[var(--color-gold)]/30 lg:block"
          style={{
            background:
              "linear-gradient(135deg, transparent 0%, rgba(245,197,24,0.04) 40%, transparent 100%)",
          }}
        />
        {/* Vignette frame so the content sits on a darker stage */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]"
        />

        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-sm border border-[var(--color-gold)] bg-black/40 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-gold)] backdrop-blur-sm">
              <Mountain size={12} /> Caracas & Lechería · Envíos a toda Venezuela
            </p>
            <h1 className="font-display-kinetic--tight mt-6 max-w-4xl text-5xl uppercase leading-[0.95] text-white sm:text-6xl lg:text-[6.5rem]">
              Repuestos que <br />
              <span className="bg-gradient-to-r from-[var(--color-gold)] via-[#f5d34c] to-[var(--color-gold)] bg-clip-text text-transparent">
                no fallan.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Catálogo verificado para <span className="font-bold text-white">Jeep, Chrysler, Dodge, Ford</span>{" "}
              y demás 4x4, SUV y coupés — con <span className="font-bold text-[var(--color-gold)]">Liqui-Moly</span>,{" "}
              <span className="font-bold text-[var(--color-gold)]">Mopar</span>{" "}
              y <span className="font-bold text-[var(--color-gold)]">K&N</span>. Vendemos, cobramos, despachamos y medimos
              desde un mismo panel.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/tienda"
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-sm bg-[var(--color-gold)] px-8 text-sm font-black uppercase tracking-wider text-black shadow-[0_0_0_1px_rgba(245,197,24,0.5),0_8px_32px_-8px_rgba(245,197,24,0.6)] transition-all hover:shadow-[0_0_0_1px_rgba(245,197,24,0.8),0_12px_40px_-8px_rgba(245,197,24,0.8)]"
              >
                Ver catálogo
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/b2b"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-sm border border-white/25 bg-black/40 px-8 text-sm font-black uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)]"
              >
                <Wrench size={16} /> Cuenta B2B
              </Link>
            </div>
            {home.isFallback ? (
              <div className="mt-6 max-w-xl border-l-2 border-[var(--color-gold)] bg-black/70 px-4 py-3 text-sm text-zinc-300 backdrop-blur-sm">
                Landing en modo demo: conecta <code className="font-mono text-[var(--color-gold)]">DATABASE_URL</code> y ejecuta{" "}
                <code className="font-mono text-[var(--color-gold)]">npm run db:seed</code> para activar contadores y productos reales.
              </div>
            ) : null}
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-sm border border-white/10 bg-gradient-to-br from-[#141414] via-[#0e0e0e] to-black p-6 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.8)]">
            {/* gold corner accents */}
            <div aria-hidden="true" className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
            <div aria-hidden="true" className="absolute -left-px top-6 h-12 w-1 bg-[var(--color-gold)]" />
            <div aria-hidden="true" className="absolute -right-px bottom-6 h-12 w-1 bg-[var(--color-gold)]" />

            <div className="grid h-full content-between gap-8">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Plataforma operativa
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {["CRM", "Billing", "Inventario", "BI"].map((item) => (
                    <div
                      key={item}
                      className="group relative overflow-hidden border border-white/10 bg-black p-4 transition-colors hover:border-[var(--color-gold)]/60"
                    >
                      <div className="absolute -right-6 -top-6 size-12 rounded-full bg-[var(--color-gold)]/10 blur-xl transition-all group-hover:bg-[var(--color-gold)]/30" />
                      <p className="relative font-mono text-2xl font-black text-[var(--color-gold)]">
                        {item}
                      </p>
                      <p className="relative mt-2 text-xs uppercase tracking-wider text-zinc-500">Módulo activo</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-[var(--color-border)] bg-black p-5">
                <p className="flex items-center gap-2 text-sm uppercase tracking-wider text-zinc-400">
                  <Gauge size={14} className="text-[var(--color-gold)]" /> Especialistas en
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {especialidades.map((marca) => (
                    <Link
                      key={marca}
                      href={`/tienda?marca=${marca}`}
                      className="rounded-sm border border-[var(--color-gold)] px-3 py-2 font-mono text-sm font-bold text-[var(--color-gold)] transition-all hover:bg-[var(--color-gold)] hover:text-black hover:shadow-[0_0_24px_-4px_rgba(245,197,24,0.5)]"
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

      <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: "var(--bg-surface)", color: "var(--text-primary)" }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="font-mono-tech text-xs" style={{ color: "var(--color-gold)" }}>
              Por qué Ranko
            </p>
            <h2 className="font-display-kinetic mt-3 text-3xl uppercase leading-tight sm:text-4xl">Tres pilares para mantener tu motor en ruta</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {pilares.map((pilar, i) => (
              <article
                key={pilar.title}
                className="group relative overflow-hidden p-6 transition-all hover:-translate-y-0.5"
                style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
              >
                {/* index number watermark */}
                <span
                  aria-hidden="true"
                  className="absolute -right-2 -top-4 font-mono text-7xl font-black opacity-5 transition-opacity group-hover:opacity-10"
                  style={{ color: "var(--color-gold)" }}
                >
                  0{i + 1}
                </span>
                <div
                  className="flex size-12 items-center justify-center"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                >
                  <pilar.icon size={22} style={{ color: "var(--color-gold)" }} />
                </div>
                <h3 className="relative mt-5 text-xl font-black uppercase">{pilar.title}</h3>
                <p className="relative mt-3 leading-7" style={{ color: "var(--text-secondary)" }}>
                  {pilar.body}
                </p>
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                  style={{ background: "var(--color-gold)" }}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="font-mono-tech text-xs text-[var(--color-gold)]">
              Busqueda por compatibilidad
            </p>
            <h2 className="font-display-kinetic mt-3 text-3xl uppercase leading-tight text-white sm:text-4xl">Encuentra el repuesto correcto</h2>
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
              <p className="font-mono-tech text-xs" style={{ color: "var(--color-gold)" }}>
                Catalogo destacado
              </p>
              <h2 className="font-display-kinetic mt-3 text-3xl uppercase leading-tight sm:text-4xl">Productos más consultados</h2>
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

      <section className="relative overflow-hidden bg-black px-4 py-20 text-white sm:px-6 lg:px-8">
        {/* Tire-tread inspired diagonal stripes pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, var(--color-gold) 0px, var(--color-gold) 2px, transparent 2px, transparent 16px)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-sm border border-[var(--color-gold)]/50 bg-[var(--color-gold)]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-gold)]">
              <Wrench size={12} /> Talleres y distribuidores
            </p>
            <h2 className="font-display-kinetic mt-4 text-3xl uppercase leading-tight sm:text-5xl">
              Compra con <br /> <span className="text-[var(--color-gold)]">precios por volumen</span>
            </h2>
            <p className="mt-5 leading-8 text-zinc-300">
              Cuentas B2B con crédito comercial, historial de facturas, seguimiento de
              pedidos y atención prioritaria del equipo Ranko Parts.
            </p>
            <Link
              href="/b2b"
              className="group mt-7 inline-flex h-12 items-center justify-center gap-2 px-7 text-sm font-black uppercase tracking-wider text-black shadow-[0_8px_32px_-8px_rgba(245,197,24,0.6)] transition-all hover:shadow-[0_12px_40px_-8px_rgba(245,197,24,0.9)]"
              style={{ background: "var(--color-gold)" }}
            >
              Solicitar cuenta B2B
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Precios por volumen", "Crédito comercial", "Facturas en portal", "Despacho priorizado"].map(
              (benefit, i) => (
                <div
                  key={benefit}
                  className="group relative overflow-hidden border border-white/10 bg-white/5 p-6 transition-all hover:border-[var(--color-gold)]/40 hover:bg-white/10"
                >
                  <span
                    aria-hidden="true"
                    className="absolute right-3 top-2 font-mono text-xs font-bold opacity-30"
                    style={{ color: "var(--color-gold)" }}
                  >
                    0{i + 1}
                  </span>
                  <p className="font-black uppercase tracking-wide text-[var(--color-gold)]">{benefit}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <footer
        className="relative overflow-hidden border-t-4 px-4 py-10 text-black sm:px-6 lg:px-8"
        style={{ background: "var(--color-gold)", borderColor: "#000" }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #000 0px, #000 1px, transparent 1px, transparent 14px)",
          }}
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-[var(--font-display)] text-3xl font-black uppercase tracking-tight">
              Ranko <span className="text-black/60">Parts</span>
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-black/70">
              Tu socio en repuestos 4x4 · 2026
            </p>
          </div>
          <div className="flex flex-col gap-1 text-sm font-bold uppercase sm:text-right">
            <a href="https://wa.me/584147903498" className="hover:underline">
              WhatsApp +58 414-7903498
            </a>
            <a href="https://instagram.com/ranko_parts" className="hover:underline">
              Instagram @ranko_parts
            </a>
          </div>
        </div>
      </footer>
      <WhatsAppFloating />
    </main>
  );
}
