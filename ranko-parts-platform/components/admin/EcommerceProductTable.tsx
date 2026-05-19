"use client";

import { ExternalLink, Image as ImageIcon, Star, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { EcommerceProduct } from "@/lib/ecommerce-admin";
import { cn } from "@/lib/utils";

type Props = { initialProducts: EcommerceProduct[] };

const CATEGORIA_COLORS: Record<string, string> = {
  Aceites: "bg-yellow-100 text-yellow-700",
  Filtros: "bg-blue-100 text-blue-700",
  Frenos: "bg-red-100 text-red-700",
  Suspensión: "bg-purple-100 text-purple-700",
  Motor: "bg-orange-100 text-orange-700",
  Performance: "bg-green-100 text-green-700",
};

export function EcommerceProductTable({ initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [filter, setFilter] = useState<"todos" | "activos" | "destacados" | "sin_imagen">("todos");
  const [loading, setLoading] = useState<string | null>(null);

  const visible = products.filter((p) => {
    if (filter === "activos") return p.activo;
    if (filter === "destacados") return p.destacado && p.activo;
    if (filter === "sin_imagen") return p.activo && p.imagenes.length === 0;
    return true;
  });

  async function toggle(id: string, field: "activo" | "destacado", current: boolean) {
    setLoading(`${id}-${field}`);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: !current } : p)),
    );
    try {
      const res = await fetch(`/api/admin/productos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !current }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // revert
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: current } : p)),
      );
    } finally {
      setLoading(null);
    }
  }

  const FILTERS: { key: typeof filter; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "activos", label: "En tienda" },
    { key: "destacados", label: "Destacados" },
    { key: "sin_imagen", label: "Sin imagen" },
  ];

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 text-xs font-black uppercase transition"
            style={{
              border: `1px solid ${filter === f.key ? "var(--color-gold)" : "var(--border)"}`,
              background: filter === f.key ? "var(--color-gold)" : "var(--bg-elevated)",
              color: filter === f.key ? "#000" : "var(--text-muted)",
            }}
          >
            {f.label}
            <span className="ml-1.5 font-mono">
              ({products.filter((p) => {
                if (f.key === "activos") return p.activo;
                if (f.key === "destacados") return p.destacado && p.activo;
                if (f.key === "sin_imagen") return p.activo && p.imagenes.length === 0;
                return true;
              }).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
              {["SKU", "Producto", "Categoría", "Precio", "Stock", "En tienda", "Destacado", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => {
              const isLowStock = p.stockTotal < p.stockMinimo;
              return (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    background: "var(--bg-card)",
                    opacity: p.activo ? 1 : 0.55,
                  }}
                >
                  {/* SKU */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {p.sku}
                    </span>
                  </td>

                  {/* Nombre */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.imagenes.length > 0 ? (
                        <div
                          className="size-8 shrink-0 rounded overflow-hidden bg-cover bg-center"
                          style={{ backgroundImage: `url(${p.imagenes[0]})`, border: "1px solid var(--border)" }}
                        />
                      ) : (
                        <div
                          className="flex size-8 shrink-0 items-center justify-center rounded"
                          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                        >
                          <ImageIcon size={12} style={{ color: "var(--text-muted)" }} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold truncate max-w-[160px]" style={{ color: "var(--text-primary)" }}>
                          {p.nombre}
                        </p>
                        {p.compatibilidades[0] && (
                          <p className="text-[10px] truncate max-w-[160px]" style={{ color: "var(--text-muted)" }}>
                            {p.compatibilidades[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Categoría */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-black uppercase",
                        CATEGORIA_COLORS[p.categoria] ?? "bg-zinc-100 text-zinc-600",
                      )}
                    >
                      {p.categoria}
                    </span>
                  </td>

                  {/* Precio */}
                  <td className="px-4 py-3">
                    <span className="font-mono font-black">{p.precio}</span>
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3">
                    <span
                      className="font-mono font-black"
                      style={{ color: isLowStock ? "var(--color-danger)" : "var(--text-primary)" }}
                    >
                      {p.stockTotal}
                    </span>
                    {isLowStock && (
                      <span className="ml-1.5 text-[9px] font-black uppercase" style={{ color: "var(--color-danger)" }}>
                        bajo
                      </span>
                    )}
                  </td>

                  {/* Activo toggle */}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={loading === `${p.id}-activo`}
                      onClick={() => toggle(p.id, "activo", p.activo)}
                      className="flex items-center gap-1 text-xs font-bold transition disabled:opacity-40"
                      style={{ color: p.activo ? "var(--color-success)" : "var(--text-muted)" }}
                    >
                      {p.activo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      {p.activo ? "Sí" : "No"}
                    </button>
                  </td>

                  {/* Destacado toggle */}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={loading === `${p.id}-destacado` || !p.activo}
                      onClick={() => toggle(p.id, "destacado", p.destacado)}
                      className="flex items-center gap-1 text-xs font-bold transition disabled:opacity-30"
                      style={{ color: p.destacado ? "var(--color-gold)" : "var(--text-muted)" }}
                    >
                      <Star size={15} fill={p.destacado ? "currentColor" : "none"} />
                      {p.destacado ? "Sí" : "No"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/catalogo/${p.id}`}
                        className="rounded p-1.5 transition hover:opacity-70"
                        style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                        title="Editar producto"
                      >
                        <ExternalLink size={11} />
                      </Link>
                      <Link
                        href={`/tienda/${p.slug}`}
                        target="_blank"
                        className="rounded p-1.5 transition hover:opacity-70"
                        style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                        title="Ver en tienda"
                      >
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {visible.length === 0 && (
          <div className="px-6 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No hay productos en este filtro.
          </div>
        )}
      </div>
    </div>
  );
}
