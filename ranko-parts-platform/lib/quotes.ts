import type { EstadoCotizacion } from "@prisma/client";

import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/formatters";

// ─── List types ──────────────────────────────────────────────────────────────

export type QuoteRow = {
  id: string;
  numero: string;
  cliente: string;
  empresa: string;
  total: string;
  subtotal: string;
  descuento: string;
  estado: EstadoCotizacion;
  validezDias: number;
  convertidaAFactura: boolean;
  vendedor: string;
  notas: string;
  createdAt: string;
};

export type QuotesListData = {
  filterClienteNombre?: string;
  quotes: QuoteRow[];
  metrics: { label: string; value: string; helper: string; danger?: boolean }[];
  isFallback: boolean;
};

// ─── Builder types ───────────────────────────────────────────────────────────

export type BuilderCliente = { id: string; nombre: string; empresa: string; tipo: string };
export type BuilderProducto = { id: string; sku: string; nombre: string; precio: number; categoria: string };

export type QuoteBuilderData = {
  clientes: BuilderCliente[];
  productos: BuilderProducto[];
  isFallback: boolean;
};

// ─── Fallbacks ───────────────────────────────────────────────────────────────

const fallbackQuotes: QuoteRow[] = [
  {
    id: "demo-cot-001",
    numero: "COT-2026-0001",
    cliente: "Taller Demo Caracas",
    empresa: "Taller Demo Caracas C.A.",
    total: "$248.00",
    subtotal: "$248.00",
    descuento: "$0.00",
    estado: "ENVIADA",
    validezDias: 7,
    convertidaAFactura: false,
    vendedor: "Admin Ranko",
    notas: "Aceites y filtros para flota de 3 unidades.",
    createdAt: "2026-05-08",
  },
  {
    id: "demo-cot-002",
    numero: "COT-2026-0002",
    cliente: "Distribuidor Oriente",
    empresa: "Auto Partes Oriente S.R.L.",
    total: "$1,540.00",
    subtotal: "$1,600.00",
    descuento: "$60.00",
    estado: "ACEPTADA",
    validezDias: 14,
    convertidaAFactura: true,
    vendedor: "Admin Ranko",
    notas: "Pedido mensual Liqui-Moly.",
    createdAt: "2026-05-05",
  },
  {
    id: "demo-cot-003",
    numero: "COT-2026-0003",
    cliente: "Carlos Mendoza",
    empresa: "",
    total: "$118.00",
    subtotal: "$118.00",
    descuento: "$0.00",
    estado: "BORRADOR",
    validezDias: 7,
    convertidaAFactura: false,
    vendedor: "Admin Ranko",
    notas: "",
    createdAt: "2026-05-11",
  },
];

const fallbackBuilderData: QuoteBuilderData = {
  isFallback: true,
  clientes: [
    { id: "demo-cliente-taller", nombre: "Taller Demo Caracas", empresa: "Taller Demo Caracas C.A.", tipo: "TALLER" },
    { id: "demo-cliente-dist", nombre: "Distribuidor Oriente", empresa: "Auto Partes Oriente S.R.L.", tipo: "DISTRIBUIDOR_REGIONAL" },
    { id: "demo-cliente-minorista", nombre: "Carlos Mendoza", empresa: "", tipo: "MINORISTA" },
  ],
  productos: [
    { id: "demo-product-lm-5w40", sku: "LM-5W40-001", nombre: "Liqui-Moly 5W-40 Sintetico", precio: 48, categoria: "Aceites" },
    { id: "demo-product-kn-filter", sku: "KN-33-2457", nombre: "K&N Filtro Alto Flujo", precio: 72, categoria: "Filtros" },
    { id: "demo-product-mopar-brake", sku: "MOP-68191349AC", nombre: "Mopar Pastillas Freno Delanteras", precio: 118, categoria: "Frenos" },
  ],
};

// ─── Data functions ───────────────────────────────────────────────────────────

export async function getQuotesListData(clienteId?: string): Promise<QuotesListData> {
  try {
    const quotes = await prisma.cotizacion.findMany({
      where: clienteId ? { clienteId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        cliente: { select: { nombre: true, empresa: true } },
        usuario: { select: { nombre: true } },
      },
    });
    const filterClienteNombre = clienteId && quotes.length > 0 ? quotes[0].cliente.nombre : undefined;

    const rows: QuoteRow[] = quotes.map((q) => ({
      id: q.id,
      numero: q.numero,
      cliente: q.cliente.nombre,
      empresa: q.cliente.empresa ?? "",
      total: formatUsd(q.total.toString()),
      subtotal: formatUsd(q.subtotal.toString()),
      descuento: formatUsd(q.descuento.toString()),
      estado: q.estado,
      validezDias: q.validezDias,
      convertidaAFactura: q.convertidaAFactura,
      vendedor: q.usuario.nombre,
      notas: q.notas ?? "",
      createdAt: q.createdAt.toISOString().slice(0, 10),
    }));

    return { ...buildListData(rows, false), filterClienteNombre };
  } catch {
    console.warn("Cotizaciones fallback activo: base de datos no disponible.");
    return buildListData(fallbackQuotes, true);
  }
}

function buildListData(quotes: QuoteRow[], isFallback: boolean): QuotesListData {
  const borradores = quotes.filter((q) => q.estado === "BORRADOR").length;
  const enviadas = quotes.filter((q) => q.estado === "ENVIADA").length;
  const vencidas = quotes.filter((q) => q.estado === "VENCIDA").length;

  return {
    isFallback,
    quotes,
    metrics: [
      { label: "Total cotizaciones", value: String(quotes.length), helper: "Historial completo" },
      { label: "Borradores", value: String(borradores), helper: "Pendientes de enviar" },
      { label: "Enviadas", value: String(enviadas), helper: "Esperando respuesta" },
      { label: "Vencidas", value: String(vencidas), helper: "Sin cierre a tiempo", danger: vencidas > 0 },
    ],
  };
}

export async function getQuoteBuilderData(): Promise<QuoteBuilderData> {
  try {
    const [clientes, productos] = await Promise.all([
      prisma.cliente.findMany({
        where: { activo: true, bloqueado: false },
        orderBy: { nombre: "asc" },
        take: 300,
        select: { id: true, nombre: true, empresa: true, tipo: true },
      }),
      prisma.producto.findMany({
        where: { activo: true },
        orderBy: [{ categoria: "asc" }, { nombre: "asc" }],
        take: 500,
        select: { id: true, sku: true, nombre: true, precio: true, categoria: true },
      }),
    ]);

    return {
      isFallback: false,
      clientes: clientes.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        empresa: c.empresa ?? "",
        tipo: c.tipo,
      })),
      productos: productos.map((p) => ({
        id: p.id,
        sku: p.sku,
        nombre: p.nombre,
        precio: Number(p.precio),
        categoria: p.categoria,
      })),
    };
  } catch {
    console.warn("Quote builder fallback activo: base de datos no disponible.");
    return fallbackBuilderData;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.cotizacion.count();
  return `COT-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.factura.count();
  return `FAC-${year}-${String(count + 1).padStart(4, "0")}`;
}
