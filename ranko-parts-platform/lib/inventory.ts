import type { ClasificacionABC } from "@prisma/client";

import { prisma } from "@/lib/db";

export type InventoryItem = {
  id: string;
  productoId: string;
  almacenId: string;
  sku: string;
  nombre: string;
  categoria: string;
  marca: string;
  almacen: string;
  ciudad: string;
  cantidad: number;
  stockMinimo: number;
  stockMaximo: number;
  ubicacion: string;
  clasificacion: ClasificacionABC;
  ultimaActualizacion: string;
  lowStock: boolean;
};

export type InventoryData = {
  items: InventoryItem[];
  metrics: {
    label: string;
    value: string;
    helper: string;
    danger?: boolean;
  }[];
  isFallback: boolean;
};

const fallbackItems: InventoryItem[] = [
  {
    id: "demo-inv-lm-ccs",
    productoId: "demo-product-lm-5w40",
    almacenId: "demo-almacen-ccs",
    sku: "LM-5W40-001",
    nombre: "Liqui-Moly 5W-40 Sintetico",
    categoria: "Aceites",
    marca: "Liqui-Moly",
    almacen: "Ranko Caracas",
    ciudad: "Caracas",
    cantidad: 18,
    stockMinimo: 6,
    stockMaximo: 60,
    ubicacion: "A-01-03",
    clasificacion: "A",
    ultimaActualizacion: "2026-05-10",
    lowStock: false,
  },
  {
    id: "demo-inv-lm-lch",
    productoId: "demo-product-lm-5w40",
    almacenId: "demo-almacen-lch",
    sku: "LM-5W40-001",
    nombre: "Liqui-Moly 5W-40 Sintetico",
    categoria: "Aceites",
    marca: "Liqui-Moly",
    almacen: "Ranko Lecheria",
    ciudad: "Lecheria",
    cantidad: 6,
    stockMinimo: 4,
    stockMaximo: 30,
    ubicacion: "A-01-01",
    clasificacion: "B",
    ultimaActualizacion: "2026-05-09",
    lowStock: false,
  },
  {
    id: "demo-inv-kn-ccs",
    productoId: "demo-product-kn-filter",
    almacenId: "demo-almacen-ccs",
    sku: "KN-33-2457",
    nombre: "K&N Filtro Alto Flujo",
    categoria: "Filtros",
    marca: "K&N",
    almacen: "Ranko Caracas",
    ciudad: "Caracas",
    cantidad: 9,
    stockMinimo: 5,
    stockMaximo: 40,
    ubicacion: "B-02-01",
    clasificacion: "A",
    ultimaActualizacion: "2026-05-10",
    lowStock: false,
  },
  {
    id: "demo-inv-kn-lch",
    productoId: "demo-product-kn-filter",
    almacenId: "demo-almacen-lch",
    sku: "KN-33-2457",
    nombre: "K&N Filtro Alto Flujo",
    categoria: "Filtros",
    marca: "K&N",
    almacen: "Ranko Lecheria",
    ciudad: "Lecheria",
    cantidad: 2,
    stockMinimo: 3,
    stockMaximo: 20,
    ubicacion: "B-01-02",
    clasificacion: "A",
    ultimaActualizacion: "2026-05-08",
    lowStock: true,
  },
  {
    id: "demo-inv-mop-ccs",
    productoId: "demo-product-mopar-brake",
    almacenId: "demo-almacen-ccs",
    sku: "MOP-68191349AC",
    nombre: "Mopar Pastillas Freno Delanteras",
    categoria: "Frenos",
    marca: "Mopar",
    almacen: "Ranko Caracas",
    ciudad: "Caracas",
    cantidad: 5,
    stockMinimo: 6,
    stockMaximo: 30,
    ubicacion: "C-03-02",
    clasificacion: "A",
    ultimaActualizacion: "2026-05-07",
    lowStock: true,
  },
  {
    id: "demo-inv-mop-lch",
    productoId: "demo-product-mopar-brake",
    almacenId: "demo-almacen-lch",
    sku: "MOP-68191349AC",
    nombre: "Mopar Pastillas Freno Delanteras",
    categoria: "Frenos",
    marca: "Mopar",
    almacen: "Ranko Lecheria",
    ciudad: "Lecheria",
    cantidad: 2,
    stockMinimo: 4,
    stockMaximo: 20,
    ubicacion: "C-01-01",
    clasificacion: "B",
    ultimaActualizacion: "2026-05-07",
    lowStock: true,
  },
];

export async function getInventoryData(): Promise<InventoryData> {
  try {
    const rows = await prisma.inventario.findMany({
      orderBy: [{ almacen: { ciudad: "asc" } }, { producto: { nombre: "asc" } }],
      include: {
        producto: {
          select: { sku: true, nombre: true, categoria: true, marca: true },
        },
        almacen: {
          select: { nombre: true, ciudad: true },
        },
      },
    });

    const items: InventoryItem[] = rows.map((row) => ({
      id: row.id,
      productoId: row.productoId,
      almacenId: row.almacenId,
      sku: row.producto.sku,
      nombre: row.producto.nombre,
      categoria: row.producto.categoria,
      marca: row.producto.marca,
      almacen: row.almacen.nombre,
      ciudad: row.almacen.ciudad,
      cantidad: row.cantidad,
      stockMinimo: row.stockMinimo,
      stockMaximo: row.stockMaximo,
      ubicacion: row.ubicacion ?? "",
      clasificacion: row.clasificacion,
      ultimaActualizacion: row.ultimaActualizacion.toISOString().slice(0, 10),
      lowStock: row.cantidad <= row.stockMinimo,
    }));

    return buildInventoryData(items, false);
  } catch {
    console.warn("Inventario fallback activo: base de datos no disponible.");
    return buildInventoryData(fallbackItems, true);
  }
}

function buildInventoryData(items: InventoryItem[], isFallback: boolean): InventoryData {
  const totalUnidades = items.reduce((sum, item) => sum + item.cantidad, 0);
  const lowStockCount = items.filter((item) => item.lowStock).length;
  const almacenesActivos = new Set(items.map((item) => item.almacenId)).size;
  const clasificacionA = items.filter((item) => item.clasificacion === "A").length;

  return {
    isFallback,
    items,
    metrics: [
      { label: "Unidades totales", value: String(totalUnidades), helper: "En todos los almacenes" },
      {
        label: "SKUs bajo minimo",
        value: String(lowStockCount),
        helper: "Requieren reposicion urgente",
        danger: lowStockCount > 0,
      },
      { label: "Almacenes activos", value: String(almacenesActivos), helper: "Con inventario registrado" },
      {
        label: "Registros clase A",
        value: String(clasificacionA),
        helper: "Alta rotacion / prioridad maxima",
      },
    ],
  };
}
