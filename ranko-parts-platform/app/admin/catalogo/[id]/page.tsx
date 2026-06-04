import {
  AlertTriangle,
  Box,
  ChevronLeft,
  Settings,
  Star,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import CompatibilidadesPanel from "@/components/admin/CompatibilidadesPanel";
import { ProductEditPanel } from "@/components/admin/ProductEditPanel";
import ProductImagesPanel from "@/components/admin/ProductImagesPanel";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

const ABC_STYLES: Record<string, string> = {
  A: "bg-green-100 text-green-700",
  B: "bg-amber-100 text-amber-700",
  C: "bg-zinc-100 text-zinc-500",
};

async function getProducto(id: string) {
  try {
    return await prisma.producto.findUnique({
      where: { id },
      include: {
        compatibilidades: {
          orderBy: [{ marca: "asc" }, { modelo: "asc" }, { anioDesde: "asc" }],
        },
        inventarios: {
          include: { almacen: { select: { id: true, nombre: true, ciudad: true } } },
          orderBy: { almacen: { nombre: "asc" } },
        },
      },
    });
  } catch {
    return null;
  }
}

export default async function ProductoDetailPage({ params }: Props) {
  const { id } = await params;
  const p = await getProducto(id);

  if (!p) notFound();

  const precio = Number(p.precio);
  const costo = Number(p.costo);
  const margen = precio > 0 ? Math.round(((precio - costo) / precio) * 100) : 0;
  const stockTotal = p.inventarios.reduce((s, inv) => s + inv.cantidad, 0);
  const stockMinimo = p.inventarios.reduce((s, inv) => s + inv.stockMinimo, 0);
  const lowStock = stockTotal <= stockMinimo;

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <div className="mx-auto max-w-6xl">

        {/* Breadcrumb */}
        <Link
          href="/admin/catalogo"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition hover:opacity-100"
          style={{ color: "var(--text-muted)", opacity: 0.7 }}
        >
          <ChevronLeft size={13} /> Catálogo
        </Link>

        {/* Header */}
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono-tech text-xs" style={{ color: "var(--color-gold)" }}>
                {p.sku}
              </p>
              {p.destacado && (
                <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-700">
                  <Star size={9} fill="currentColor" /> Destacado
                </span>
              )}
              {!p.activo && (
                <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-black uppercase text-zinc-500">
                  Oculto
                </span>
              )}
            </div>
            <h1 className="font-display-kinetic--tight mt-3 text-2xl uppercase leading-tight sm:text-3xl">{p.nombre}</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {p.marca} · {p.categoria}
              {p.subcategoria ? ` / ${p.subcategoria}` : ""}
            </p>
          </div>
        </div>

        {/* Low stock banner */}
        {lowStock && (
          <div
            className="mt-4 flex items-center gap-3 p-3 text-sm"
            style={{ border: "1px solid var(--color-danger)", background: "color-mix(in srgb, var(--color-danger) 6%, var(--bg-card))" }}
          >
            <AlertTriangle size={14} style={{ color: "var(--color-danger)" }} />
            <p>
              Stock bajo: <strong>{stockTotal}</strong> unidades en total (mínimo configurado:{" "}
              <strong>{stockMinimo}</strong>)
            </p>
          </div>
        )}

        {/* KPI band */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Precio de venta",
              value: `$${precio.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
              helper: "USD",
            },
            {
              label: "Costo",
              value: `$${costo.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
              helper: "USD",
            },
            {
              label: "Margen bruto",
              value: `${margen}%`,
              helper: `$${(precio - costo).toFixed(2)} por unidad`,
              highlight: margen < 20,
            },
            {
              label: "Stock total",
              value: String(stockTotal),
              helper: `${p.inventarios.length} almacén(es)`,
              highlight: lowStock,
            },
          ].map((m) => (
            <article
              key={m.label}
              className="p-5"
              style={{
                border: `1px solid ${m.highlight ? "var(--color-danger)" : "var(--border)"}`,
                background: "var(--bg-card)",
              }}
            >
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                {m.label}
              </p>
              <p
                className="mt-3 font-mono text-2xl font-black"
                style={{ color: m.highlight ? "var(--color-danger)" : "var(--text-primary)" }}
              >
                {m.value}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{m.helper}</p>
            </article>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* LEFT — Edit panel */}
          <div className="grid gap-6">
            <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <div
                className="flex items-center gap-2 px-5 py-3"
                style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
              >
                <Settings size={13} style={{ color: "var(--color-gold)" }} />
                <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>
                  Datos del producto
                </p>
              </div>
              <ProductEditPanel
                productoId={p.id}
                initialData={{
                  nombre: p.nombre,
                  descripcion: p.descripcion ?? "",
                  precio,
                  costo,
                  categoria: p.categoria,
                  subcategoria: p.subcategoria ?? "",
                  marca: p.marca,
                  codigoOEM: p.codigoOEM ?? "",
                  codigoAftermarket: p.codigoAftermarket ?? "",
                  activo: p.activo,
                  destacado: p.destacado,
                }}
              />
            </section>

            {/* Images */}
            <ProductImagesPanel productoId={p.id} initial={p.imagenes ?? []} />

            {/* Compatibilities */}
            <CompatibilidadesPanel
              productoId={p.id}
              initial={p.compatibilidades.map((c) => ({
                id: c.id,
                marca: c.marca,
                modelo: c.modelo,
                anioDesde: c.anioDesde,
                anioHasta: c.anioHasta,
                motor: c.motor ?? null,
                sistema: c.sistema ?? null,
              }))}
            />
          </div>

          {/* RIGHT — Inventory per warehouse */}
          <div className="grid gap-6 self-start">
            <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <div
                className="flex items-center gap-2 px-5 py-3"
                style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
              >
                <Warehouse size={13} style={{ color: "var(--color-gold)" }} />
                <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>
                  Inventario por almacén
                </p>
              </div>
              {p.inventarios.length === 0 ? (
                <p className="p-5 text-sm" style={{ color: "var(--text-muted)" }}>
                  Sin almacenes configurados.
                </p>
              ) : (
                <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                  {p.inventarios.map((inv) => {
                    const pct = inv.stockMaximo > 0
                      ? Math.min(Math.round((inv.cantidad / inv.stockMaximo) * 100), 100)
                      : 0;
                    const isLow = inv.cantidad <= inv.stockMinimo;
                    return (
                      <div key={inv.id} className="px-5 py-4">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-bold" style={{ color: "var(--text-primary)" }}>
                              {inv.almacen.nombre}
                            </p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                              {inv.almacen.ciudad}
                              {inv.ubicacion ? ` · ${inv.ubicacion}` : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className="font-mono text-lg font-black"
                              style={{ color: isLow ? "var(--color-danger)" : "var(--text-primary)" }}
                            >
                              {inv.cantidad}
                            </p>
                            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                              min {inv.stockMinimo} · max {inv.stockMaximo}
                            </p>
                          </div>
                        </div>
                        {/* Stock bar */}
                        <div className="mt-2 h-1.5 w-full rounded-full" style={{ background: "var(--bg-elevated)" }}>
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: isLow ? "var(--color-danger)" : "var(--color-gold)",
                            }}
                          />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-black uppercase", ABC_STYLES[inv.clasificacion] ?? ABC_STYLES.C)}>
                            Clase {inv.clasificacion}
                          </span>
                          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            {pct}% del máximo
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* OEM codes */}
            {(p.codigoOEM || p.codigoAftermarket) && (
              <section className="p-5" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div className="flex items-center gap-2">
                  <Box size={13} style={{ color: "var(--color-gold)" }} />
                  <p className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
                    Referencias
                  </p>
                </div>
                <div className="mt-3 grid gap-2">
                  {p.codigoOEM && (
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>OEM</p>
                      <p className="font-mono text-sm font-black">{p.codigoOEM}</p>
                    </div>
                  )}
                  {p.codigoAftermarket && (
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Aftermarket</p>
                      <p className="font-mono text-sm font-black">{p.codigoAftermarket}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Slug</p>
                    <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{p.slug}</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
