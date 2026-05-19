import { EstadoFactura } from "@prisma/client";

import { getCatalogPageData, type CatalogOptions, type CatalogProduct } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { compactNumberFormatter, formatUsd } from "@/lib/formatters";

export type PublicHomeData = {
  stats: {
    label: string;
    value: string;
    helper: string;
  }[];
  featuredProducts: CatalogProduct[];
  options: CatalogOptions;
  isFallback: boolean;
};

export async function getPublicHomeData(): Promise<PublicHomeData> {
  const catalog = await getCatalogPageData({});

  try {
    const [ventasCompletadas, productosDisponibles, totalFacturado] = await Promise.all([
      prisma.factura.count({
        where: {
          estado: { in: [EstadoFactura.PAGADA, EstadoFactura.PARCIAL] },
        },
      }),
      prisma.producto.count({
        where: { activo: true },
      }),
      prisma.factura.aggregate({
        _sum: { total: true },
        where: {
          estado: { in: [EstadoFactura.PAGADA, EstadoFactura.PARCIAL] },
        },
      }),
    ]);

    return {
      isFallback: catalog.isFallback,
      featuredProducts: catalog.products.filter((product) => product.destacado).slice(0, 3),
      options: catalog.options,
      stats: [
        {
          label: "Ventas completadas",
          value: compactNumberFormatter.format(ventasCompletadas),
          helper: "Historico confirmado",
        },
        {
          label: "Productos disponibles",
          value: compactNumberFormatter.format(productosDisponibles),
          helper: "SKUs activos",
        },
        {
          label: "Facturacion registrada",
          value: formatUsd(totalFacturado._sum.total?.toString() ?? "0"),
          helper: "Base operativa",
        },
      ],
    };
  } catch {
    console.warn("Public home fallback activo: base de datos no disponible.");

    return {
      isFallback: true,
      featuredProducts: catalog.products.filter((product) => product.destacado).slice(0, 3),
      options: catalog.options,
      stats: [
        {
          label: "Ventas completadas",
          value: "0",
          helper: "Conectar base real",
        },
        {
          label: "Productos disponibles",
          value: String(catalog.total),
          helper: "Catalogo demo",
        },
        {
          label: "Facturacion registrada",
          value: "$0.00",
          helper: "Conectar billing",
        },
      ],
    };
  }
}
