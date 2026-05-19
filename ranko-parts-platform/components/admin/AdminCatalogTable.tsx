"use client";

import { Eye, EyeOff, ExternalLink, Search, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { AdminCatalogProduct } from "@/lib/admin-catalog";
import { cn } from "@/lib/utils";

type AdminCatalogTableProps = {
  initialProducts: AdminCatalogProduct[];
  isFallback: boolean;
};

export function AdminCatalogTable({ initialProducts, isFallback }: AdminCatalogTableProps) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) =>
      [
        product.sku,
        product.nombre,
        product.marca,
        product.categoria,
        product.compatibilidades.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [products, query]);

  async function updateProduct(id: string, data: Partial<Pick<AdminCatalogProduct, "activo" | "destacado">>) {
    const previousProducts = products;

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === id
          ? {
              ...product,
              ...data,
            }
          : product,
      ),
    );
    setMessage("");

    const response = await fetch(`/api/admin/productos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      setProducts(previousProducts);
      setMessage(
        isFallback
          ? "Cambio visual solamente: conecta la base y autentica un usuario admin para persistir."
          : "No se pudo guardar el cambio del producto.",
      );
    }
  }

  return (
    <section className="mt-8">
      <div
        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <label className="relative block w-full sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            size={18}
            style={{ color: "var(--text-muted)" }}
          />
          <input
            className="h-11 w-full pl-10 pr-3 text-sm outline-none transition focus:border-[var(--color-gold)]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar SKU, marca, categoria o compatibilidad"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            value={query}
          />
        </label>
        <p className="font-mono text-sm font-black" style={{ color: "var(--text-muted)" }}>
          {filteredProducts.length} / {products.length} SKUs
        </p>
      </div>

      {message ? (
        <div
          className="mt-4 p-4 text-sm"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          {message}
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto" style={{ border: "1px solid var(--border)" }}>
        <table
          className="min-w-[1040px] w-full border-collapse text-left text-sm"
          style={{ background: "var(--bg-card)" }}
        >
          <thead className="text-xs uppercase" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Margen</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Compatibilidad</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="align-top"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <td className="px-4 py-4">
                  <Link
                    href={`/admin/catalogo/${product.id}`}
                    className="inline-flex items-center gap-1.5 font-black uppercase transition hover:opacity-80"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {product.nombre} <ExternalLink size={11} style={{ color: "var(--text-muted)" }} />
                  </Link>
                  <p className="mt-1 font-mono text-xs text-[var(--color-gold)]">{product.sku}</p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{product.marca}</p>
                </td>
                <td className="px-4 py-4" style={{ color: "var(--text-secondary)" }}>{product.categoria}</td>
                <td className="px-4 py-4">
                  <p className="font-mono font-black" style={{ color: "var(--text-primary)" }}>{product.precio}</p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>Costo {product.costo}</p>
                </td>
                <td className="px-4 py-4 font-mono font-black text-[var(--color-success)]">
                  {product.margen}
                </td>
                <td className="px-4 py-4">
                  <p
                    className="font-mono text-lg font-black"
                    style={{
                      color:
                        product.stockTotal <= product.stockMinimo
                          ? "var(--color-danger)"
                          : "var(--text-primary)",
                    }}
                  >
                    {product.stockTotal}
                  </p>
                  <div className="mt-2 grid gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    {product.almacenes.map((warehouse) => (
                      <span key={`${product.id}-${warehouse.nombre}`}>
                        {warehouse.ciudad}: {warehouse.cantidad} / min {warehouse.stockMinimo} (
                        {warehouse.clasificacion})
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex max-w-[260px] flex-wrap gap-2">
                    {product.compatibilidades.length ? (
                      product.compatibilidades.map((compatibility) => (
                        <span
                          key={`${product.id}-${compatibility}`}
                          className="rounded px-2 py-1 text-xs"
                          style={{
                            background: "var(--bg-input)",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {compatibility}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>Sin compatibilidad cargada</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge active={product.activo} label={product.activo ? "Activo" : "Oculto"} />
                    <StatusBadge active={product.destacado} label="Destacado" />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      aria-label={product.destacado ? "Quitar destacado" : "Marcar destacado"}
                      className="inline-flex size-10 items-center justify-center border transition"
                      onClick={() => updateProduct(product.id, { destacado: !product.destacado })}
                      style={
                        product.destacado
                          ? {
                              border: "1px solid var(--color-gold)",
                              background: "var(--color-gold)",
                              color: "var(--bg-base)",
                            }
                          : {
                              border: "1px solid var(--border)",
                              background: "var(--bg-input)",
                              color: "var(--text-muted)",
                            }
                      }
                      title={product.destacado ? "Quitar destacado" : "Marcar destacado"}
                      type="button"
                    >
                      <Star size={18} />
                    </button>
                    <button
                      aria-label={product.activo ? "Ocultar producto" : "Activar producto"}
                      className="inline-flex size-10 items-center justify-center border transition"
                      onClick={() => updateProduct(product.id, { activo: !product.activo })}
                      style={{
                        border: "1px solid var(--border)",
                        background: "var(--bg-input)",
                        color: product.activo ? "var(--text-secondary)" : "var(--color-danger)",
                      }}
                      title={product.activo ? "Ocultar producto" : "Activar producto"}
                      type="button"
                    >
                      {product.activo ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className="rounded px-2 py-1 text-[10px] font-black uppercase"
      style={
        active
          ? { background: "var(--color-success)", color: "var(--bg-base)" }
          : { background: "var(--bg-elevated)", color: "var(--text-muted)" }
      }
    >
      {label}
    </span>
  );
}
