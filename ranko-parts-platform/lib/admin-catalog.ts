import type { ClasificacionABC } from "@prisma/client";

import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/formatters";

export type AdminCatalogWarehouse = {
  nombre: string;
  ciudad: string;
  cantidad: number;
  stockMinimo: number;
  clasificacion: ClasificacionABC;
};

export type AdminCatalogProduct = {
  id: string;
  sku: string;
  slug: string;
  nombre: string;
  categoria: string;
  marca: string;
  precio: string;
  costo: string;
  margen: string;
  stockTotal: number;
  stockMinimo: number;
  activo: boolean;
  destacado: boolean;
  compatibilidades: string[];
  almacenes: AdminCatalogWarehouse[];
};

export type AdminCatalogData = {
  products: AdminCatalogProduct[];
  metrics: {
    label: string;
    value: string;
    helper: string;
  }[];
  lowStock: AdminCatalogProduct[];
  isFallback: boolean;
};

const fallbackProducts: AdminCatalogProduct[] = [
  {
    id: "demo-product-lm-5w40",
    sku: "LM-5W40-001",
    slug: "liqui-moly-5w40-sintetico",
    nombre: "Liqui-Moly 5W-40 Sintetico",
    categoria: "Aceites",
    marca: "Liqui-Moly",
    precio: "$48.00",
    costo: "$31.00",
    margen: "35.4%",
    stockTotal: 24,
    stockMinimo: 10,
    activo: true,
    destacado: true,
    compatibilidades: ["Jeep Grand Cherokee 2011-2020", "Dodge Durango 2011-2020"],
    almacenes: [
      { nombre: "Ranko Caracas", ciudad: "Caracas", cantidad: 18, stockMinimo: 6, clasificacion: "A" },
      { nombre: "Ranko Lecheria", ciudad: "Lecheria", cantidad: 6, stockMinimo: 4, clasificacion: "B" },
    ],
  },
  {
    id: "demo-product-kn-filter",
    sku: "KN-33-2457",
    slug: "kn-filtro-alto-flujo-jeep-dodge",
    nombre: "K&N Filtro Alto Flujo",
    categoria: "Filtros",
    marca: "K&N",
    precio: "$72.00",
    costo: "$48.00",
    margen: "33.3%",
    stockTotal: 11,
    stockMinimo: 8,
    activo: true,
    destacado: true,
    compatibilidades: ["Jeep Wrangler 2012-2018", "Dodge Charger 2011-2020"],
    almacenes: [
      { nombre: "Ranko Caracas", ciudad: "Caracas", cantidad: 9, stockMinimo: 5, clasificacion: "A" },
      { nombre: "Ranko Lecheria", ciudad: "Lecheria", cantidad: 2, stockMinimo: 3, clasificacion: "A" },
    ],
  },
  {
    id: "demo-product-mopar-brake",
    sku: "MOP-68191349AC",
    slug: "mopar-pastillas-freno-delanteras",
    nombre: "Mopar Pastillas Freno Delanteras",
    categoria: "Frenos",
    marca: "Mopar",
    precio: "$118.00",
    costo: "$82.00",
    margen: "30.5%",
    stockTotal: 7,
    stockMinimo: 10,
    activo: true,
    destacado: false,
    compatibilidades: ["Jeep Grand Cherokee 2014-2021"],
    almacenes: [
      { nombre: "Ranko Caracas", ciudad: "Caracas", cantidad: 5, stockMinimo: 6, clasificacion: "A" },
      { nombre: "Ranko Lecheria", ciudad: "Lecheria", cantidad: 2, stockMinimo: 4, clasificacion: "B" },
    ],
  },
];

export async function getAdminCatalogData(): Promise<AdminCatalogData> {
  try {
    const products = await prisma.producto.findMany({
      orderBy: [{ activo: "desc" }, { destacado: "desc" }, { nombre: "asc" }],
      take: 150,
      include: {
        compatibilidades: {
          take: 4,
          orderBy: [{ marca: "asc" }, { modelo: "asc" }],
        },
        inventarios: {
          include: {
            almacen: true,
          },
          orderBy: [{ almacen: { ciudad: "asc" } }],
        },
      },
    });

    const mappedProducts = products.map((product) => {
      const stockTotal = product.inventarios.reduce((total, item) => total + item.cantidad, 0);
      const stockMinimo = product.inventarios.reduce((total, item) => total + item.stockMinimo, 0);

      return {
        id: product.id,
        sku: product.sku,
        slug: product.slug,
        nombre: product.nombre,
        categoria: product.categoria,
        marca: product.marca,
        precio: formatUsd(product.precio.toString()),
        costo: formatUsd(product.costo.toString()),
        margen: formatMargin(product.precio.toString(), product.costo.toString()),
        stockTotal,
        stockMinimo,
        activo: product.activo,
        destacado: product.destacado,
        compatibilidades: product.compatibilidades.map(
          (item) => `${item.marca} ${item.modelo} ${item.anioDesde}-${item.anioHasta}`,
        ),
        almacenes: product.inventarios.map((item) => ({
          nombre: item.almacen.nombre,
          ciudad: item.almacen.ciudad,
          cantidad: item.cantidad,
          stockMinimo: item.stockMinimo,
          clasificacion: item.clasificacion,
        })),
      };
    });

    return buildCatalogData(mappedProducts, false);
  } catch {
    console.warn("Admin catalog fallback activo: base de datos no disponible.");
    return buildCatalogData(fallbackProducts, true);
  }
}

function buildCatalogData(products: AdminCatalogProduct[], isFallback: boolean): AdminCatalogData {
  const activeProducts = products.filter((product) => product.activo);
  const lowStock = products.filter((product) => product.stockTotal <= product.stockMinimo);
  const featured = products.filter((product) => product.destacado);
  const stockTotal = products.reduce((total, product) => total + product.stockTotal, 0);

  return {
    isFallback,
    products,
    lowStock,
    metrics: [
      { label: "SKUs activos", value: String(activeProducts.length), helper: "Publicables en tienda" },
      { label: "Destacados", value: String(featured.length), helper: "Aparecen primero en catalogo" },
      { label: "Stock total", value: String(stockTotal), helper: "Unidades en almacenes" },
      { label: "Bajo minimo", value: String(lowStock.length), helper: "Requieren reposicion" },
    ],
  };
}

function formatMargin(priceValue: string, costValue: string) {
  const price = Number(priceValue);
  const cost = Number(costValue);

  if (!price || price <= 0) {
    return "0.0%";
  }

  return `${(((price - cost) / price) * 100).toFixed(1)}%`;
}
