import { ArrowRight, Globe, Package, ShoppingCart, Star, Tag, Truck } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: <Globe size={20} />,
    title: "Catálogo público",
    description: "Publica tus productos con imágenes, descripciones y compatibilidad de vehículos. SEO automático por SKU y marca.",
    status: "planned",
  },
  {
    icon: <ShoppingCart size={20} />,
    title: "Carrito de compras",
    description: "Flujo de compra completo con selección de productos, cantidades y método de pago. Soporta invitados y cuentas registradas.",
    status: "planned",
  },
  {
    icon: <Truck size={20} />,
    title: "Gestión de envíos",
    description: "Cálculo de flete por zona, integración con operadoras de delivery. Seguimiento en tiempo real para el cliente.",
    status: "planned",
  },
  {
    icon: <Tag size={20} />,
    title: "Precios y promociones",
    description: "Listas de precios por segmento, cupones de descuento, precio especial por volumen y precios de oferta por tiempo limitado.",
    status: "planned",
  },
  {
    icon: <Star size={20} />,
    title: "Reseñas y valoraciones",
    description: "Los clientes registrados pueden dejar reseñas verificadas de los productos que han comprado.",
    status: "planned",
  },
  {
    icon: <Package size={20} />,
    title: "Sincronización de inventario",
    description: "El stock del E-Commerce refleja en tiempo real el inventario del almacén. Reservas automáticas al confirmar pedidos.",
    status: "planned",
  },
];

const ROADMAP = [
  { quarter: "Q3 2026", milestone: "Catálogo público + SEO", done: false },
  { quarter: "Q3 2026", milestone: "Carrito y checkout básico", done: false },
  { quarter: "Q4 2026", milestone: "Pagos en línea (Stripe / Mercantil)", done: false },
  { quarter: "Q4 2026", milestone: "Integración de envíos", done: false },
  { quarter: "Q1 2027", milestone: "App móvil del cliente", done: false },
  { quarter: "Q2 2027", milestone: "Marketplace multivend", done: false },
];

export default function AdminEcommercePage() {
  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-5xl">

        {/* Header */}
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
            Módulo
          </p>
          <h1 className="mt-2 text-4xl font-black uppercase">E-Commerce</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            Canal de ventas en línea integrado al inventario, cotizaciones y portal de clientes de Ranko Parts.
          </p>
        </div>

        {/* Coming Soon banner */}
        <div
          className="relative mt-8 overflow-hidden p-8 text-center"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: "var(--color-gold)" }}
          />
          <div
            className="mx-auto flex size-16 items-center justify-center rounded-full"
            style={{ background: "var(--bg-elevated)" }}
          >
            <ShoppingCart size={28} style={{ color: "var(--color-gold)" }} />
          </div>
          <h2 className="mt-4 text-2xl font-black uppercase">Próximamente</h2>
          <p className="mt-2 max-w-md mx-auto text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            El módulo de E-Commerce está en desarrollo. Habilita el acceso anticipado desde{" "}
            <span className="font-bold" style={{ color: "var(--color-gold)" }}>Configuración → E-Commerce</span>{" "}
            cuando esté disponible.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/admin/configuracion"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-black transition hover:opacity-90"
              style={{ background: "var(--color-gold)" }}
            >
              Ir a Configuración <ArrowRight size={12} />
            </Link>
            <Link
              href="/admin/catalogo"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase transition"
              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              Ver catálogo actual
            </Link>
          </div>
        </div>

        {/* Features grid */}
        <section className="mt-10">
          <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Funcionalidades incluidas
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article
                key={f.title}
                className="p-5"
                style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
              >
                <div
                  className="flex size-9 items-center justify-center rounded-full"
                  style={{ background: "var(--bg-elevated)", color: "var(--color-gold)" }}
                >
                  {f.icon}
                </div>
                <p className="mt-3 font-black">{f.title}</p>
                <p className="mt-1 text-xs leading-5" style={{ color: "var(--text-muted)" }}>
                  {f.description}
                </p>
                <span
                  className="mt-3 inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-700"
                >
                  En desarrollo
                </span>
              </article>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="mt-10">
          <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Hoja de ruta
          </h2>
          <div
            className="mt-4 divide-y"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            {ROADMAP.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <div
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: item.done ? "var(--color-success)" : "var(--bg-elevated)", border: `1px solid ${item.done ? "var(--color-success)" : "var(--border)"}` }}
                />
                <p className="flex-1 text-sm font-bold" style={{ color: item.done ? "var(--text-muted)" : "var(--text-primary)" }}>
                  {item.milestone}
                </p>
                <span
                  className="shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-black uppercase"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                >
                  {item.quarter}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Current module links */}
        <section className="mt-10">
          <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Módulos actuales relacionados
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Catálogo de productos", href: "/admin/catalogo", icon: <Package size={14} /> },
              { label: "Inventario", href: "/admin/inventario", icon: <Package size={14} /> },
              { label: "Portal del cliente", href: "/cliente", icon: <Globe size={14} /> },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between p-4 transition hover:opacity-80"
                style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--color-gold)" }}>{link.icon}</span>
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{link.label}</span>
                </div>
                <ArrowRight size={12} style={{ color: "var(--text-muted)" }} />
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
