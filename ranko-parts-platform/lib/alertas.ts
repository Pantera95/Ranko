import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/formatters";

export type AlertaSeveridad = "CRITICA" | "ALTA" | "MEDIA" | "BAJA";

export type AlertaItem = {
  id: string;
  tipo: "PAGO_ANOMALO" | "FACTURA_VENCIDA" | "DEUDA_CRITICA" | "CLIENTE_INACTIVO" | "STOCK_BAJO";
  severidad: AlertaSeveridad;
  titulo: string;
  descripcion: string;
  entidad: string;
  entidadId: string;
  fecha: string;
  resuelta: boolean;
};

export type AlertasData = {
  alertas: AlertaItem[];
  resumen: { criticas: number; altas: number; medias: number; bajas: number; total: number };
  metrics: { label: string; value: string; helper: string; danger?: boolean }[];
  isFallback: boolean;
};

const hoy = new Date();

function diasDesde(fecha: string): number {
  return Math.floor((hoy.getTime() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Fallback demo ─────────────────────────────────────────────────────────────

const FALLBACK_ALERTAS: AlertaItem[] = [
  {
    id: "alt-001",
    tipo: "PAGO_ANOMALO",
    severidad: "CRITICA",
    titulo: "Pago anómalo detectado",
    descripcion: "Monto del comprobante no coincide con el saldo de la factura.",
    entidad: "FAC-2026-0003 / Carlos Mendoza",
    entidadId: "demo-fac-003",
    fecha: hoy.toISOString().slice(0, 10),
    resuelta: false,
  },
  {
    id: "alt-002",
    tipo: "FACTURA_VENCIDA",
    severidad: "ALTA",
    titulo: "Factura vencida +30 días",
    descripcion: "FAC-2026-0003 lleva 33 días sin cobrar. Considerar bloqueo comercial.",
    entidad: "Carlos Mendoza",
    entidadId: "demo-c2",
    fecha: hoy.toISOString().slice(0, 10),
    resuelta: false,
  },
  {
    id: "alt-003",
    tipo: "DEUDA_CRITICA",
    severidad: "ALTA",
    titulo: "Cartera crítica activa",
    descripcion: "Distribuidor Oriente tiene $118.00 en tramo 31-60 días sin gestión.",
    entidad: "Distribuidor Oriente",
    entidadId: "demo-c1",
    fecha: hoy.toISOString().slice(0, 10),
    resuelta: false,
  },
  {
    id: "alt-004",
    tipo: "STOCK_BAJO",
    severidad: "MEDIA",
    titulo: "Inventario bajo en 3 SKUs",
    descripcion: "Productos con stock menor al mínimo configurado: FIL-001, ACE-5W30, FRE-MOP.",
    entidad: "Almacen Caracas",
    entidadId: "",
    fecha: hoy.toISOString().slice(0, 10),
    resuelta: false,
  },
];

// ─── Main function ─────────────────────────────────────────────────────────────

export async function getAlertasData(): Promise<AlertasData> {
  try {
    const alertas: AlertaItem[] = [];

    const [pagosAnomalos, facturasVencidas, stockBajo] = await Promise.all([
      prisma.pago.findMany({
        where: { esAnomalo: true, estado: { not: "RECHAZADO" } },
        include: { factura: { select: { numero: true } }, cliente: { select: { nombre: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.factura.findMany({
        where: { estado: { in: ["VENCIDA", "PENDIENTE", "PARCIAL"] }, saldoPendiente: { gt: 0 } },
        include: { cliente: { select: { nombre: true } } },
        orderBy: { fechaVencimiento: "asc" },
        take: 100,
      }),
      prisma.inventario.findMany({
        where: { cantidad: { gt: 0 } },
        select: { id: true, cantidad: true, stockMinimo: true, producto: { select: { sku: true, nombre: true, id: true } } },
        take: 200,
      }),
    ]);

    // Pagos anómalos → CRITICA
    for (const p of pagosAnomalos) {
      alertas.push({
        id: `pago-${p.id}`,
        tipo: "PAGO_ANOMALO",
        severidad: "CRITICA",
        titulo: "Pago anómalo detectado",
        descripcion: p.razonAnomalia ?? "Comprobante requiere verificación manual.",
        entidad: `${p.factura.numero} / ${p.cliente.nombre}`,
        entidadId: p.facturaId,
        fecha: p.createdAt.toISOString().slice(0, 10),
        resuelta: false,
      });
    }

    // Facturas vencidas → ALTA / CRITICA según antigüedad
    for (const f of facturasVencidas) {
      const venc = f.fechaVencimiento.toISOString().slice(0, 10);
      const dias = Math.max(0, diasDesde(venc));
      if (dias < 1) continue; // aún vigentes

      const severidad: AlertaSeveridad = dias > 90 ? "CRITICA" : dias > 60 ? "ALTA" : "ALTA";
      alertas.push({
        id: `factura-${f.id}`,
        tipo: "FACTURA_VENCIDA",
        severidad,
        titulo: `Factura vencida ${dias > 90 ? "+90" : dias > 60 ? "+60" : "+30"} días`,
        descripcion: `${f.numero} — saldo ${formatUsd(Number(f.saldoPendiente))} — ${dias} días sin cobrar.`,
        entidad: f.cliente.nombre,
        entidadId: f.clienteId,
        fecha: venc,
        resuelta: false,
      });
    }

    // Stock bajo → MEDIA
    const bajosStock = stockBajo.filter((inv) => inv.cantidad <= inv.stockMinimo);
    if (bajosStock.length > 0) {
      alertas.push({
        id: "stock-bajo-group",
        tipo: "STOCK_BAJO",
        severidad: "MEDIA",
        titulo: `${bajosStock.length} SKU${bajosStock.length > 1 ? "s" : ""} bajo mínimo`,
        descripcion: bajosStock.slice(0, 5).map((inv) => `${inv.producto.sku} (${inv.cantidad} ud.)`).join(", ") + (bajosStock.length > 5 ? ` y ${bajosStock.length - 5} más.` : "."),
        entidad: "Inventario",
        entidadId: "",
        fecha: hoy.toISOString().slice(0, 10),
        resuelta: false,
      });
    }

    // Sort: CRITICA first
    const ORDER: AlertaSeveridad[] = ["CRITICA", "ALTA", "MEDIA", "BAJA"];
    alertas.sort((a, b) => ORDER.indexOf(a.severidad) - ORDER.indexOf(b.severidad));

    return buildAlertasData(alertas, false);
  } catch {
    console.warn("Alertas fallback activo.");
    return buildAlertasData(FALLBACK_ALERTAS, true);
  }
}

function buildAlertasData(alertas: AlertaItem[], isFallback: boolean): AlertasData {
  const criticas = alertas.filter((a) => a.severidad === "CRITICA").length;
  const altas = alertas.filter((a) => a.severidad === "ALTA").length;
  const medias = alertas.filter((a) => a.severidad === "MEDIA").length;
  const bajas = alertas.filter((a) => a.severidad === "BAJA").length;

  return {
    alertas,
    resumen: { criticas, altas, medias, bajas, total: alertas.length },
    isFallback,
    metrics: [
      { label: "Alertas activas", value: String(alertas.length), helper: "Sin resolver", danger: alertas.length > 0 },
      { label: "Criticas", value: String(criticas), helper: "Accion inmediata", danger: criticas > 0 },
      { label: "Pagos anomalos", value: String(alertas.filter((a) => a.tipo === "PAGO_ANOMALO").length), helper: "Requieren revision", danger: true },
      { label: "Facturas vencidas", value: String(alertas.filter((a) => a.tipo === "FACTURA_VENCIDA").length), helper: "Saldo sin cobrar", danger: true },
    ],
  };
}
