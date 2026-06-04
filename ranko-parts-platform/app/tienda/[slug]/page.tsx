import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, PackageCheck } from "lucide-react";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { ProductGallery } from "@/components/public/ProductGallery";
import { getProductBySlug } from "@/lib/catalog";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "584147903498";
  const whatsappMessage = encodeURIComponent(
    `Hola Ranko Parts, quiero consultar el producto ${product.nombre} (${product.sku}).`,
  );

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <PublicNavbar />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Product visual — real images when available, fallback to dark text card */}
        {product.imagenes.length > 0 ? (
          <ProductGallery imagenes={product.imagenes} alt={product.nombre} />
        ) : (
          <div
            className="grid aspect-square place-items-center p-8 text-center"
            style={{ border: "1px solid var(--border)", background: "#1a1a1a" }}
          >
            <div>
              <p className="font-mono text-sm font-black uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
                {product.marca}
              </p>
              <p className="mt-5 text-5xl font-black uppercase leading-none">{product.categoria}</p>
              <p className="mt-4 font-mono text-sm" style={{ color: "var(--text-muted)" }}>{product.sku}</p>
            </div>
          </div>
        )}

        <div>
          {/* SKU + brand bar — replaces single "Producto" eyebrow with technical tag-bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="font-mono-tech rounded-sm px-3 py-1 text-xs"
              style={{ border: "1px solid var(--color-gold)", color: "var(--color-gold)" }}
            >
              {product.marca}
            </span>
            <span
              className="font-mono-tech px-2 py-1 text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              SKU {product.sku}
            </span>
            <span
              className="font-mono-tech px-2 py-1 text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              · {product.categoria}
            </span>
          </div>
          <h1 className="font-display-kinetic--tight mt-4 text-4xl uppercase leading-[1.05] sm:text-5xl">
            {product.nombre}
          </h1>
          <p className="mt-5 max-w-prose leading-8" style={{ color: "var(--text-secondary)" }}>
            {product.descripcion}
          </p>

          {/* Spec band — heavier visual weight, gold left rule for "data section" */}
          <div
            className="mt-7 grid gap-0 sm:grid-cols-2"
            style={{
              border: "1px solid var(--border)",
              borderLeft: "3px solid var(--color-gold)",
              background: "var(--bg-card)",
            }}
          >
            <div className="border-r p-5" style={{ borderColor: "var(--border)" }}>
              <p className="font-mono-tech text-[10px]" style={{ color: "var(--text-muted)" }}>
                Precio USD
              </p>
              <p className="mt-2 font-mono text-4xl font-black leading-none">{product.precio}</p>
            </div>
            <div className="p-5">
              <p className="font-mono-tech text-[10px]" style={{ color: "var(--text-muted)" }}>
                Disponibilidad
              </p>
              <p
                className={[
                  "mt-2 inline-flex items-center gap-2 text-lg font-black",
                  product.stock > 0 ? "" : "",
                ].join(" ")}
                style={{ color: product.stock > 0 ? "var(--color-success)" : "var(--text-muted)" }}
              >
                <PackageCheck size={20} />
                {product.stock > 0 ? `${product.stock} unidades en stock` : "Consultar stock"}
              </p>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="font-mono-tech flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <span className="block h-px w-8" style={{ background: "var(--color-gold)" }} />
              Compatibilidades verificadas
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.compatibilidades.length ? (
                product.compatibilidades.map((compatibilidad) => (
                  <span
                    key={compatibilidad}
                    className="rounded-sm px-3 py-2 text-sm font-bold transition-colors hover:border-[var(--color-gold)]"
                    style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
                  >
                    {compatibilidad}
                  </span>
                ))
              ) : (
                <span className="text-sm italic" style={{ color: "var(--text-muted)" }}>
                  Compatibilidad por confirmar con ventas.
                </span>
              )}
            </div>
          </section>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              className="group inline-flex h-13 items-center justify-center gap-2 rounded-sm px-7 py-4 text-sm font-black uppercase tracking-wider text-white shadow-[0_8px_32px_-8px_rgba(37,211,102,0.5)] transition-all hover:shadow-[0_12px_40px_-8px_rgba(37,211,102,0.9)]"
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              rel="noreferrer"
              style={{ background: "#25D366" }}
              target="_blank"
            >
              <MessageCircle size={18} />
              Consultar por WhatsApp
            </a>
            <Link
              href="/tienda"
              className="inline-flex h-12 items-center justify-center px-5 text-sm font-black uppercase transition"
              style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}
            >
              Volver al catalogo
            </Link>
          </div>
        </div>
      </section>
      <WhatsAppFloating />
    </main>
  );
}
