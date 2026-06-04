import Link from "next/link";
import { MessageCircle, PackageCheck, Sparkles } from "lucide-react";

import type { CatalogProduct } from "@/lib/catalog";

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const stockLabel = product.stock > 0 ? `${product.stock} disponibles` : "Consultar stock";
  const inStock = product.stock > 0;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "584147903498";
  const whatsappMessage = encodeURIComponent(
    `Hola Ranko Parts, quiero consultar el producto ${product.nombre} (${product.sku}).`,
  );

  return (
    <article
      className="group relative grid overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(245,197,24,0.4)]"
      style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
    >
      {/* Destacado ribbon — corner badge for visibility on grid */}
      {product.destacado && (
        <span
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[10px] font-black uppercase tracking-wider text-black shadow-md"
          style={{ background: "var(--color-gold)" }}
        >
          <Sparkles size={10} /> Destacado
        </span>
      )}

      {/* Product image — uses the first uploaded image when available,
          otherwise falls back to a dark text card with engineering-grid texture. */}
      <Link
        href={`/tienda/${product.slug}`}
        className="relative grid aspect-[4/3] place-items-center overflow-hidden p-0 text-center text-white"
        style={{ background: "#1a1a1a" }}
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.nombre}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <>
            {/* faint blueprint grid */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,197,24,0.06)_1px,transparent_1px),linear-gradient(rgba(245,197,24,0.06)_1px,transparent_1px)] bg-[size:24px_24px]"
            />
            {/* gold glow on hover */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,197,24,0.18),transparent_60%)] opacity-0 transition-opacity group-hover:opacity-100"
            />
            <div className="relative p-6">
              <p
                className="font-mono-tech text-xs"
                style={{ color: "var(--color-gold)" }}
              >
                {product.marca}
              </p>
              <p
                className="mt-3 text-2xl font-black uppercase leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {product.categoria}
              </p>
              <p className="mt-2 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                {product.sku}
              </p>
            </div>
          </>
        )}

        {/* Stock pill overlaying image */}
        <span
          className={[
            "absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-sm px-2 py-1 font-mono text-[10px] font-black uppercase tracking-wider",
            inStock ? "bg-black/80 text-[var(--color-gold)] backdrop-blur-sm" : "bg-zinc-800/90 text-zinc-300 backdrop-blur-sm",
          ].join(" ")}
        >
          <PackageCheck size={11} /> {stockLabel}
        </span>
      </Link>

      <div className="grid gap-4 p-5">
        <div>
          <div className="flex items-center justify-between gap-3">
            <span
              className="rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              {product.categoria}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {product.sku}
            </span>
          </div>
          <Link href={`/tienda/${product.slug}`} className="group/title">
            <h2 className="mt-4 text-xl font-black uppercase leading-tight transition-colors group-hover/title:text-[var(--color-gold)]">
              {product.nombre}
            </h2>
          </Link>
          <p className="mt-2 line-clamp-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            {product.descripcion}
          </p>
        </div>
        <div
          className="flex items-end justify-between gap-4 pt-4"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Precio USD
            </p>
            <p className="mt-1 font-mono text-2xl font-black leading-none">{product.precio}</p>
          </div>
          <a
            aria-label={`Consultar ${product.nombre} por WhatsApp`}
            className="group/wa relative grid size-11 place-items-center rounded-sm text-white shadow-md transition-all hover:scale-110 hover:shadow-[0_8px_24px_-4px_rgba(37,211,102,0.6)]"
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            rel="noreferrer"
            style={{ background: "#25D366" }}
            target="_blank"
          >
            <MessageCircle size={20} />
            <span
              aria-hidden="true"
              className="absolute -right-1 -top-1 size-3 animate-pulse rounded-full bg-white opacity-0 group-hover/wa:opacity-100"
            />
          </a>
        </div>
      </div>

      {/* hover top-edge accent */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ background: "var(--color-gold)" }}
      />
    </article>
  );
}
