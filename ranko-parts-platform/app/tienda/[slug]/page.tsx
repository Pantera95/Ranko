import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, PackageCheck } from "lucide-react";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
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
        {/* Product visual — intentionally dark stage */}
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

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
            Producto
          </p>
          <h1 className="mt-3 text-5xl font-black uppercase leading-tight">{product.nombre}</h1>
          <p className="mt-4 leading-8" style={{ color: "var(--text-secondary)" }}>{product.descripcion}</p>

          <div className="mt-6 grid gap-4 py-6 sm:grid-cols-2" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
            <div>
              <p className="text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>Precio USD</p>
              <p className="mt-2 font-mono text-4xl font-black">{product.precio}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>Disponibilidad</p>
              <p className="mt-2 inline-flex items-center gap-2 font-bold">
                <PackageCheck size={18} />{" "}
                {product.stock > 0 ? `${product.stock} unidades` : "Consultar stock"}
              </p>
            </div>
          </div>

          <section className="mt-6">
            <h2 className="text-xl font-black uppercase">Compatibilidades</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.compatibilidades.length ? (
                product.compatibilidades.map((compatibilidad) => (
                  <span
                    key={compatibilidad}
                    className="px-3 py-2 text-sm font-bold"
                    style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
                  >
                    {compatibilidad}
                  </span>
                ))
              ) : (
                <span style={{ color: "var(--text-muted)" }}>Compatibilidad por confirmar con ventas.</span>
              )}
            </div>
          </section>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex h-12 items-center justify-center gap-2 rounded px-5 text-sm font-black uppercase text-white"
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              rel="noreferrer"
              style={{ background: "#25D366" }}
              target="_blank"
            >
              <MessageCircle size={18} /> Consultar por WhatsApp
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
