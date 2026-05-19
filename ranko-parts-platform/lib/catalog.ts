import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/formatters";

export type CatalogFilters = {
  categoria?: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  sistema?: string;
};

export type CatalogProduct = {
  sku: string;
  slug: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  marca: string;
  precio: string;
  stock: number;
  destacado: boolean;
  imageUrl?: string;
  compatibilidades: string[];
};

export type CatalogOptions = {
  categorias: string[];
  marcas: string[];
  modelos: string[];
  sistemas: string[];
  anios: number[];
};

export type CatalogPageData = {
  products: CatalogProduct[];
  options: CatalogOptions;
  total: number;
  isFallback: boolean;
};

const fallbackProducts: CatalogProduct[] = [
  {
    sku: "LM-5W40-001",
    slug: "liqui-moly-5w40-sintetico",
    nombre: "Liqui-Moly 5W-40 Sintetico",
    descripcion: "Lubricante premium para motores Jeep, Dodge, Chrysler y Ford.",
    categoria: "Aceites",
    marca: "Liqui-Moly",
    precio: "$48.00",
    stock: 24,
    destacado: true,
    compatibilidades: ["Jeep Grand Cherokee 2011-2020", "Dodge Durango 2011-2020"],
  },
  {
    sku: "KN-33-2457",
    slug: "kn-filtro-alto-flujo-jeep-dodge",
    nombre: "K&N Filtro Alto Flujo",
    descripcion: "Filtro reutilizable para mejor respiracion del motor.",
    categoria: "Filtros",
    marca: "K&N",
    precio: "$72.00",
    stock: 11,
    destacado: true,
    compatibilidades: ["Jeep Wrangler 2012-2018", "Dodge Charger 2011-2020"],
  },
  {
    sku: "MOP-68191349AC",
    slug: "mopar-pastillas-freno-delanteras",
    nombre: "Mopar Pastillas Freno Delanteras",
    descripcion: "Pastillas de freno delanteras OEM para tren delantero.",
    categoria: "Frenos",
    marca: "Mopar",
    precio: "$118.00",
    stock: 7,
    destacado: false,
    compatibilidades: ["Jeep Grand Cherokee 2014-2021"],
  },
];

const fallbackOptions: CatalogOptions = {
  categorias: ["Aceites", "Filtros", "Frenos", "Suspension", "Motor", "Performance"],
  marcas: ["Jeep", "Chrysler", "Dodge", "Ford"],
  modelos: ["Grand Cherokee", "Wrangler", "Durango", "Charger", "Explorer"],
  sistemas: ["Motor", "Frenos", "Filtros", "Suspension"],
  anios: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014],
};

export async function getCatalogPageData(filters: CatalogFilters): Promise<CatalogPageData> {
  try {
    const where = buildProductWhere(filters);

    const [products, compatibilidades] = await Promise.all([
      prisma.producto.findMany({
        where,
        orderBy: [{ destacado: "desc" }, { nombre: "asc" }],
        take: 24,
        include: {
          compatibilidades: {
            take: 4,
            orderBy: [{ marca: "asc" }, { modelo: "asc" }],
          },
          inventarios: {
            select: { cantidad: true },
          },
        },
      }),
      prisma.productoCompatibilidad.findMany({
        distinct: ["marca", "modelo", "sistema"],
        select: {
          marca: true,
          modelo: true,
          sistema: true,
          anioDesde: true,
          anioHasta: true,
          producto: {
            select: { categoria: true },
          },
        },
        where: {
          producto: { activo: true },
        },
        orderBy: [{ marca: "asc" }, { modelo: "asc" }],
      }),
    ]);

    const mappedProducts = products.map((product) => ({
      sku: product.sku,
      slug: product.slug,
      nombre: product.nombre,
      descripcion: product.descripcion ?? "Producto Ranko Parts con compatibilidad verificada.",
      categoria: product.categoria,
      marca: product.marca,
      precio: formatUsd(product.precio.toString()),
      stock: product.inventarios.reduce((total, item) => total + item.cantidad, 0),
      destacado: product.destacado,
      imageUrl: product.imagenes[0],
      compatibilidades: product.compatibilidades.map(
        (item) => `${item.marca} ${item.modelo} ${item.anioDesde}-${item.anioHasta}`,
      ),
    }));

    const categorias = Array.from(
      new Set(compatibilidades.map((item) => item.producto.categoria).filter(Boolean)),
    ).sort();

    const marcas = Array.from(new Set(compatibilidades.map((item) => item.marca))).sort();
    const modelos = Array.from(new Set(compatibilidades.map((item) => item.modelo))).sort();
    const sistemas = Array.from(
      new Set(compatibilidades.map((item) => item.sistema).filter(Boolean) as string[]),
    ).sort();
    const anios = Array.from(
      new Set(compatibilidades.flatMap((item) => [item.anioDesde, item.anioHasta])),
    ).sort((a, b) => b - a);

    return {
      products: mappedProducts,
      options: {
        categorias: categorias.length ? categorias : fallbackOptions.categorias,
        marcas: marcas.length ? marcas : fallbackOptions.marcas,
        modelos: modelos.length ? modelos : fallbackOptions.modelos,
        sistemas: sistemas.length ? sistemas : fallbackOptions.sistemas,
        anios: anios.length ? anios : fallbackOptions.anios,
      },
      total: mappedProducts.length,
      isFallback: false,
    };
  } catch {
    console.warn("Catalog fallback activo: base de datos no disponible.");

    const products = applyFallbackFilters(fallbackProducts, filters);

    return {
      products,
      options: fallbackOptions,
      total: products.length,
      isFallback: true,
    };
  }
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  try {
    const product = await prisma.producto.findUnique({
      where: { slug },
      include: {
        compatibilidades: {
          orderBy: [{ marca: "asc" }, { modelo: "asc" }],
        },
        inventarios: {
          select: { cantidad: true },
        },
      },
    });

    if (!product || !product.activo) {
      return null;
    }

    return {
      sku: product.sku,
      slug: product.slug,
      nombre: product.nombre,
      descripcion: product.descripcion ?? "Producto Ranko Parts con compatibilidad verificada.",
      categoria: product.categoria,
      marca: product.marca,
      precio: formatUsd(product.precio.toString()),
      stock: product.inventarios.reduce((total, item) => total + item.cantidad, 0),
      destacado: product.destacado,
      imageUrl: product.imagenes[0],
      compatibilidades: product.compatibilidades.map(
        (item) => `${item.marca} ${item.modelo} ${item.anioDesde}-${item.anioHasta}`,
      ),
    };
  } catch {
    console.warn("Product fallback activo: base de datos no disponible.");
    return fallbackProducts.find((product) => product.slug === slug) ?? null;
  }
}

function buildProductWhere(filters: CatalogFilters): Prisma.ProductoWhereInput {
  const compatibilidadFilters: Prisma.ProductoCompatibilidadWhereInput[] = [];

  if (filters.marca) {
    compatibilidadFilters.push({ marca: { equals: filters.marca, mode: "insensitive" } });
  }

  if (filters.modelo) {
    compatibilidadFilters.push({ modelo: { equals: filters.modelo, mode: "insensitive" } });
  }

  if (filters.sistema) {
    compatibilidadFilters.push({ sistema: { equals: filters.sistema, mode: "insensitive" } });
  }

  if (filters.anio) {
    compatibilidadFilters.push({
      anioDesde: { lte: filters.anio },
      anioHasta: { gte: filters.anio },
    });
  }

  return {
    activo: true,
    ...(filters.categoria
      ? { categoria: { equals: filters.categoria, mode: "insensitive" as const } }
      : {}),
    ...(compatibilidadFilters.length
      ? {
          compatibilidades: {
            some: { AND: compatibilidadFilters },
          },
        }
      : {}),
  };
}

function applyFallbackFilters(products: CatalogProduct[], filters: CatalogFilters) {
  return products.filter((product) => {
    if (filters.categoria && product.categoria.toLowerCase() !== filters.categoria.toLowerCase()) {
      return false;
    }

    if (filters.marca) {
      const marca = filters.marca.toLowerCase();
      return product.compatibilidades.some((compatibilidad) =>
        compatibilidad.toLowerCase().includes(marca),
      );
    }

    return true;
  });
}
