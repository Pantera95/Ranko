import Link from "next/link";
import { MessageCircle, PackageCheck } from "lucide-react";

import type { CatalogProduct } from "@/lib/catalog";

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const stockLabel = product.stock > 0 ? `${product.stock} disponibles` : "Consultar stock";
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "584147903498";
  const whatsappMessage = encodeURIComponent(
    `Hola Ranko Parts, quiero consultar el producto ${product.nombre} (${product.sku}).`,
  );

  return (
    <article
      className="grid overflow-hidden"
      style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
    >
      {/* Product image placeholder — intentionally dark stage */}
      <Link
        href={`/tienda/${product.slug}`}
        className="grid aspect-[4/3] place-items-center p-6 text-center text-white"
        style={{ background: "#1a1a1a" }}
      >
        <div>
          <p className="font-mono text-xs font-black uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
            {product.marca}
          </p>
          <p className="mt-3 text-2xl font-black uppercase leading-tight" style={{ color: "var(--text-primary)" }}>
            {product.categoria}
          </p>
          <p className="mt-2 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{product.sku}</p>
        </div>
      </Link>

      <div className="grid gap-4 p-5">
        <div>
          <div className="flex items-center justify-between gap-3">
            <span
              className="px-2 py-1 text-xs font-bold uppercase"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              {product.categoria}
            </span>
            {product.destacado ? (
              <span className="px-2 py-1 text-xs font-black uppercase text-black" style={{ background: "var(--color-gold)" }}>
                Destacado
              </span>
            ) : null}
          </div>
          <Link href={`/tienda/${product.slug}`}>
            <h2 className="mt-4 text-xl font-black uppercase leading-tight">{product.nombre}</h2>
          </Link>
          <p className="mt-2 line-clamp-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            {product.descripcion}
          </p>
        </div>
        <div
          className="flex items-center justify-between gap-4 pt-4"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <div>
            <p className="font-mono text-2xl font-black">{product.precio}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
              <PackageCheck size={14} /> {stockLabel}
            </p>
          </div>
          <a
            aria-label={`Consultar ${product.nombre} por WhatsApp`}
            className="grid h-11 w-11 place-items-center rounded text-white transition hover:scale-105"
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            rel="noreferrer"
            style={{ background: "#25D366" }}
            target="_blank"
          >
            <MessageCircle size={20} />
          </a>
        </div>
      </div>
    </article>
  );
}
