import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/formatters";

export type EcommerceProduct = {
  id: string;
  sku: string;
  slug: string;
  nombre: string;
  categoria: string;
  marca: string;
  precio: string;
  stockTotal: number;
  stockMinimo: number;
  activo: boolean;
  destacado: boolean;
  imagenes: string[];
  compatibilidades: string[];
};

export type EcommerceWebLead = {
  id: string;
  clienteNombre: string;
  clienteTelefono: string;
  ciudad: string;
  productosInteresados: string[];
  estado: string;
  fechaCreacion: string;
  valorEstimado: string | null;
};

export type EcommerceAdminData = {
  products: EcommerceProduct[];
  webLeads: EcommerceWebLead[];
  metrics: { label: string; value: string; helper: string }[];
  isFallback: boolean;
};

// ─── Fallback data ─────────────────────────────────────────────────────────────

const FALLBACK_PRODUCTS: EcommerceProduct[] = [
  {
    id: "demo-p1",
    sku: "LM-5W40-001",
    slug: "liqui-moly-5w40-sintetico",
    nombre: "Liqui-Moly 5W-40 Sintético",
    categoria: "Aceites",
    marca: "Liqui-Moly",
    precio: "$48.00",
    stockTotal: 24,
    stockMinimo: 10,
    activo: true,
    destacado: true,
    imagenes: [],
    compatibilidades: ["Jeep Grand Cherokee 2011-2020", "Dodge Durango 2011-2020"],
  },
  {
    id: "demo-p2",
    sku: "KN-33-2457",
    slug: "kn-filtro-alto-flujo-jeep-dodge",
    nombre: "K&N Filtro Alto Flujo",
    categoria: "Filtros",
    marca: "K&N",
    precio: "$72.00",
    stockTotal: 11,
    stockMinimo: 8,
    activo: true,
    destacado: true,
    imagenes: [],
    compatibilidades: ["Jeep Wrangler 2012-2018", "Dodge Charger 2011-2020"],
  },
  {
    id: "demo-p3",
    sku: "MOP-68191349AC",
    slug: "mopar-pastillas-freno-delanteras",
    nombre: "Mopar Pastillas Freno Delanteras",
    categoria: "Frenos",
    marca: "Mopar",
    precio: "$118.00",
    stockTotal: 7,
    stockMinimo: 10,
    activo: true,
    destacado: false,
    imagenes: [],
    compatibilidades: ["Jeep Grand Cherokee 2014-2021"],
  },
  {
    id: "demo-p4",
    sku: "OCA-KIT-001",
    slug: "kit-cambio-aceite-jeep-2-8",
    nombre: "Kit Cambio Aceite Jeep 2.8",
    categoria: "Aceites",
    marca: "Mopar",
    precio: "$65.00",
    stockTotal: 3,
    stockMinimo: 5,
    activo: false,
    destacado: false,
    imagenes: [],
    compatibilidades: ["Jeep Cherokee 2014-2019"],
  },
];

const FALLBACK_LEADS: EcommerceWebLead[] = [
  {
    id: "demo-wl1",
    clienteNombre: "Carlos Mendoza",
    clienteTelefono: "+58 414-9901234",
    ciudad: "Caracas",
    productosInteresados: ["Liqui-Moly 5W-40"],
    estado: "NUEVO",
    fechaCreacion: "2026-05-17",
    valorEstimado: "$48.00",
  },
  {
    id: "demo-wl2",
    clienteNombre: "Laura Torrealba",
    clienteTelefono: "+58 424-8801234",
    ciudad: "Valencia",
    productosInteresados: ["K&N Filtro Alto Flujo", "Mopar Pastillas"],
    estado: "COTIZADO",
    fechaCreacion: "2026-05-15",
    valorEstimado: "$190.00",
  },
];

// ─── Main fetch ────────────────────────────────────────────────────────────────

export async function getEcommerceAdminData(): Promise<EcommerceAdminData> {
  try {
    const [products, webLeads] = await Promise.all([
      prisma.producto.findMany({
        orderBy: [{ destacado: "desc" }, { activo: "desc" }, { nombre: "asc" }],
        take: 200,
        include: {
          compatibilidades: {
            take: 3,
            orderBy: [{ marca: "asc" }, { modelo: "asc" }],
          },
          inventarios: {
            select: { cantidad: true, stockMinimo: true },
          },
        },
      }),
      prisma.lead.findMany({
        where: { cliente: { fuente: "TIENDA_WEB" } },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          cliente: {
            select: { nombre: true, telefono: true, ciudad: true },
          },
        },
      }),
    ]);

    const mappedProducts: EcommerceProduct[] = products.map((p) => ({
      id: p.id,
      sku: p.sku,
      slug: p.slug,
      nombre: p.nombre,
      categoria: p.categoria,
      marca: p.marca,
      precio: formatUsd(p.precio.toString()),
      stockTotal: p.inventarios.reduce((s, i) => s + i.cantidad, 0),
      stockMinimo: p.inventarios.reduce((s, i) => s + i.stockMinimo, 0),
      activo: p.activo,
      destacado: p.destacado,
      imagenes: p.imagenes,
      compatibilidades: p.compatibilidades.map(
        (c) => `${c.marca} ${c.modelo} ${c.anioDesde}-${c.anioHasta}`,
      ),
    }));

    const mappedLeads: EcommerceWebLead[] = webLeads.map((l) => ({
      id: l.id,
      clienteNombre: l.cliente.nombre,
      clienteTelefono: l.cliente.telefono,
      ciudad: l.cliente.ciudad ?? "—",
      productosInteresados: l.productosInteresados,
      estado: l.estado,
      fechaCreacion: l.createdAt.toISOString().slice(0, 10),
      valorEstimado: l.valorEstimado ? formatUsd(l.valorEstimado.toString()) : null,
    }));

    return buildData(mappedProducts, mappedLeads, false);
  } catch {
    console.warn("EcommerceAdmin fallback activo.");
    return buildData(FALLBACK_PRODUCTS, FALLBACK_LEADS, true);
  }
}

function buildData(
  products: EcommerceProduct[],
  webLeads: EcommerceWebLead[],
  isFallback: boolean,
): EcommerceAdminData {
  const activos = products.filter((p) => p.activo).length;
  const destacados = products.filter((p) => p.destacado && p.activo).length;
  const sinImagen = products.filter((p) => p.activo && p.imagenes.length === 0).length;
  const bajStock = products.filter((p) => p.activo && p.stockTotal < p.stockMinimo).length;

  return {
    products,
    webLeads,
    isFallback,
    metrics: [
      { label: "Productos en tienda", value: String(activos), helper: "SKUs activos visibles" },
      { label: "Destacados", value: String(destacados), helper: "Aparecen primero en catálogo" },
      { label: "Leads web", value: String(webLeads.length), helper: "Consultas desde tienda online" },
      { label: "Sin imagen", value: String(sinImagen), helper: "Activos que necesitan foto" },
    ],
  };
}
