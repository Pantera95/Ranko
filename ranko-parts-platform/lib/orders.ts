import type { EstadoOrden } from "@prisma/client";

import { prisma } from "@/lib/db";

// ─── Shared types ─────────────────────────────────────────────────────────────

export type HistorialEntry = {
  estado: EstadoOrden;
  timestamp: string;
  responsable?: string;
  nota?: string;
};

export type OrderItem = {
  sku: string;
  nombre: string;
  cantidad: number;
  precioUnitario: string;
};

// ─── Admin list types ─────────────────────────────────────────────────────────

export type OrderRow = {
  id: string;
  codigo: string;
  facturaNumero: string;
  facturaId: string;
  cliente: string;
  empresa: string;
  estado: EstadoOrden;
  responsable: string;
  direccionEntrega: string;
  estimadoEntrega: string;
  notasDespacho: string;
  historial: HistorialEntry[];
  createdAt: string;
};

export type OrdersData = {
  orders: OrderRow[];
  facturasSinOrden: { id: string; numero: string; cliente: string; total: string }[];
  metrics: { label: string; value: string; helper: string; danger?: boolean }[];
  isFallback: boolean;
};

// ─── Public tracking type ────────────────────────────────────────────────────

export type TrackingData =
  | {
      found: true;
      codigo: string;
      cliente: string;
      estado: EstadoOrden;
      estimadoEntrega: string;
      direccionEntrega: string;
      historial: HistorialEntry[];
      items: OrderItem[];
    }
  | { found: false; codigo: string };

// ─── Fallbacks ────────────────────────────────────────────────────────────────

const fallbackOrders: OrderRow[] = [
  {
    id: "demo-ord-001",
    codigo: "ORD-20260508-0001",
    facturaNumero: "FAC-2026-0001",
    facturaId: "demo-fac-001",
    cliente: "Distribuidor Oriente",
    empresa: "Auto Partes Oriente S.R.L.",
    estado: "ENTREGADO",
    responsable: "Carlos R.",
    direccionEntrega: "Av. Principal, Lecheria",
    estimadoEntrega: "2026-05-10",
    notasDespacho: "Entregado en almacen del cliente.",
    historial: [
      { estado: "CONFIRMADO", timestamp: "2026-05-08T09:00:00Z", responsable: "Admin Ranko" },
      { estado: "EN_PREPARACION", timestamp: "2026-05-08T11:00:00Z", responsable: "Admin Ranko" },
      { estado: "EN_CAMINO", timestamp: "2026-05-09T08:30:00Z", responsable: "Carlos R." },
      { estado: "ENTREGADO", timestamp: "2026-05-10T14:00:00Z", responsable: "Carlos R.", nota: "Firma recibida." },
    ],
    createdAt: "2026-05-08",
  },
  {
    id: "demo-ord-002",
    codigo: "ORD-20260508-0002",
    facturaNumero: "FAC-2026-0002",
    facturaId: "demo-fac-002",
    cliente: "Taller Demo Caracas",
    empresa: "Taller Demo Caracas C.A.",
    estado: "EN_PREPARACION",
    responsable: "",
    direccionEntrega: "Av. Libertador, Caracas",
    estimadoEntrega: "2026-05-14",
    notasDespacho: "",
    historial: [
      { estado: "CONFIRMADO", timestamp: "2026-05-08T10:00:00Z", responsable: "Admin Ranko" },
      { estado: "EN_PREPARACION", timestamp: "2026-05-11T09:00:00Z", responsable: "Admin Ranko" },
    ],
    createdAt: "2026-05-08",
  },
];

// ─── Admin data ───────────────────────────────────────────────────────────────

export async function getOrdersData(): Promise<OrdersData> {
  try {
    const [orders, facturas] = await Promise.all([
      prisma.orden.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
          factura: { select: { numero: true } },
          cliente: { select: { nombre: true, empresa: true } },
        },
      }),
      prisma.factura.findMany({
        where: { estado: { in: ["PENDIENTE", "PARCIAL", "PAGADA"] }, orden: null },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          numero: true,
          total: true,
          cliente: { select: { nombre: true } },
        },
      }),
    ]);

    const rows: OrderRow[] = orders.map((o) => ({
      id: o.id,
      codigo: o.codigo,
      facturaNumero: o.factura.numero,
      facturaId: o.facturaId,
      cliente: o.cliente.nombre,
      empresa: o.cliente.empresa ?? "",
      estado: o.estado,
      responsable: o.responsable ?? "",
      direccionEntrega: o.direccionEntrega ?? "",
      estimadoEntrega: o.estimadoEntrega?.toISOString().slice(0, 10) ?? "",
      notasDespacho: o.notasDespacho ?? "",
      historial: (o.historialEstados as HistorialEntry[]) ?? [],
      createdAt: o.createdAt.toISOString().slice(0, 10),
    }));

    return buildOrdersData(
      rows,
      facturas.map((f) => ({
        id: f.id,
        numero: f.numero,
        cliente: f.cliente.nombre,
        total: `$${Number(f.total).toFixed(2)}`,
      })),
      false,
    );
  } catch {
    console.warn("Ordenes fallback activo: base de datos no disponible.");
    return buildOrdersData(fallbackOrders, [], true);
  }
}

function buildOrdersData(
  orders: OrderRow[],
  facturasSinOrden: OrdersData["facturasSinOrden"],
  isFallback: boolean,
): OrdersData {
  const enCurso = orders.filter(
    (o) => o.estado !== "ENTREGADO" && o.estado !== "CANCELADO",
  ).length;
  const enCamino = orders.filter((o) => o.estado === "EN_CAMINO").length;
  const canceladas = orders.filter((o) => o.estado === "CANCELADO").length;

  return {
    isFallback,
    orders,
    facturasSinOrden,
    metrics: [
      { label: "En curso", value: String(enCurso), helper: "Sin entregar ni cancelar" },
      { label: "En camino", value: String(enCamino), helper: "Despachos activos" },
      { label: "Entregadas", value: String(orders.filter((o) => o.estado === "ENTREGADO").length), helper: "Completadas" },
      { label: "Canceladas", value: String(canceladas), helper: "Ordenes canceladas", danger: canceladas > 0 },
    ],
  };
}

// ─── Public tracking ──────────────────────────────────────────────────────────

export async function getTrackingData(codigo: string): Promise<TrackingData> {
  try {
    const orden = await prisma.orden.findUnique({
      where: { codigo },
      include: {
        cliente: { select: { nombre: true } },
        factura: {
          include: {
            items: {
              include: {
                producto: { select: { sku: true, nombre: true } },
              },
            },
          },
        },
      },
    });

    if (!orden) return { found: false, codigo };

    return {
      found: true,
      codigo: orden.codigo,
      cliente: orden.cliente.nombre,
      estado: orden.estado,
      estimadoEntrega: orden.estimadoEntrega?.toISOString().slice(0, 10) ?? "",
      direccionEntrega: orden.direccionEntrega ?? "",
      historial: (orden.historialEstados as HistorialEntry[]) ?? [],
      items: orden.factura.items.map((item) => ({
        sku: item.producto.sku,
        nombre: item.producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: `$${Number(item.precioUnitario).toFixed(2)}`,
      })),
    };
  } catch {
    console.warn("Tracking fallback activo: base de datos no disponible.");
    return { found: false, codigo };
  }
}

// ─── Number generator ─────────────────────────────────────────────────────────

export async function generateOrderCode(): Promise<string> {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = await prisma.orden.count();
  return `ORD-${date}-${String(count + 1).padStart(4, "0")}`;
}
