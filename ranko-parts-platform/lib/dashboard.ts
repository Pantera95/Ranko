import { EstadoFactura, EstadoLead, EstadoPago } from "@prisma/client";

import { prisma } from "@/lib/db";

export type DashboardMetric = {
  label: string;
  value: string;
  helper: string;
};

export type DashboardData = {
  metrics: DashboardMetric[];
  alerts: {
    title: string;
    value: string;
    tone: "neutral" | "warning" | "danger" | "success";
    href: string;
  }[];
  weeklyRevenue: { day: string; amount: number }[];
  recentLogs: number;
  isFallback: boolean;
};

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1);

function money(value?: unknown) {
  const number = Number(value ?? 0);
  return `$${number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const today = startOfToday();
    const monthStart = startOfMonth();

    // Build date range for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const [
      ventasHoy,
      ventasMes,
      leadsActivos,
      stockBajo,
      pagosAnomalos,
      facturasVencidas,
      clientesActivos,
      recentLogs,
      ventasSemana,
    ] = await Promise.all([
      prisma.factura.aggregate({
        _sum: { total: true },
        where: {
          estado: { in: [EstadoFactura.PAGADA, EstadoFactura.PARCIAL] },
          fechaEmision: { gte: today },
        },
      }),
      prisma.factura.aggregate({
        _sum: { total: true },
        where: {
          estado: { in: [EstadoFactura.PAGADA, EstadoFactura.PARCIAL] },
          fechaEmision: { gte: monthStart },
        },
      }),
      prisma.lead.count({
        where: {
          estado: {
            in: [
              EstadoLead.NUEVO,
              EstadoLead.CALIFICANDO,
              EstadoLead.COTIZADO,
              EstadoLead.EN_NEGOCIACION,
              EstadoLead.CIERRE_PENDIENTE,
            ],
          },
        },
      }),
      prisma.inventario.count({
        where: {
          cantidad: { lte: prisma.inventario.fields.stockMinimo },
        },
      }),
      prisma.pago.count({
        where: {
          OR: [{ esAnomalo: true }, { estado: EstadoPago.ANOMALO }],
        },
      }),
      prisma.factura.count({
        where: {
          estado: EstadoFactura.VENCIDA,
        },
      }),
      prisma.cliente.count({
        where: { activo: true },
      }),
      prisma.logFacturacion.count({
        where: { timestamp: { gte: today } },
      }),
      // Daily revenue for the last 7 days
      prisma.factura.groupBy({
        by: ["fechaEmision"],
        _sum: { total: true },
        where: {
          estado: { in: [EstadoFactura.PAGADA, EstadoFactura.PARCIAL] },
          fechaEmision: { gte: last7Days[0] },
        },
      }),
    ]);

    // Map groupBy results onto each of the 7 days
    const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const weeklyRevenue = last7Days.map((dayStart) => {
      const dayStr = dayStart.toISOString().slice(0, 10);
      const entry = ventasSemana.find(
        (r) => r.fechaEmision.toISOString().slice(0, 10) === dayStr,
      );
      return {
        day: DAY_LABELS[dayStart.getDay()],
        amount: Number(entry?._sum.total ?? 0),
      };
    });

    return {
      isFallback: false,
      recentLogs,
      weeklyRevenue,
      metrics: [
        {
          label: "Ventas hoy",
          value: money(ventasHoy._sum.total),
          helper: "Facturas pagadas o parciales desde medianoche",
        },
        {
          label: "Ventas del mes",
          value: money(ventasMes._sum.total),
          helper: "Ingresos confirmados del mes en curso",
        },
        {
          label: "Pipeline activo",
          value: `${leadsActivos} leads`,
          helper: "Oportunidades abiertas en CRM",
        },
        {
          label: "Clientes activos",
          value: String(clientesActivos),
          helper: "Base comercial disponible",
        },
      ],
      alerts: [
        {
          title: "Stock bajo",
          value: `${stockBajo} SKUs`,
          tone: stockBajo > 0 ? "warning" : "success",
          href: "/admin/inventario",
        },
        {
          title: "Pagos anomalos",
          value: String(pagosAnomalos),
          tone: pagosAnomalos > 0 ? "danger" : "success",
          href: "/admin/alertas",
        },
        {
          title: "Facturas vencidas",
          value: String(facturasVencidas),
          tone: facturasVencidas > 0 ? "danger" : "success",
          href: "/admin/deudas",
        },
      ],
    };
  } catch {
    console.warn("Dashboard fallback activo: base de datos no disponible.");

    return {
      isFallback: true,
      metrics: [
        { label: "Ventas hoy", value: "$0.00", helper: "Esperando conexion a Postgres" },
        { label: "Ventas del mes", value: "$0.00", helper: "Esperando conexion a Postgres" },
        { label: "Pipeline activo", value: "0 leads", helper: "Esperando seed o datos reales" },
        { label: "Clientes activos", value: "0", helper: "Esperando seed o datos reales" },
      ],
      recentLogs: 0,
      weeklyRevenue: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => ({ day, amount: 0 })),
      alerts: [
        { title: "Stock bajo", value: "0 SKUs", tone: "neutral", href: "/admin/inventario" },
        { title: "Pagos anomalos", value: "0", tone: "neutral", href: "/admin/alertas" },
        { title: "Facturas vencidas", value: "0", tone: "neutral", href: "/admin/deudas" },
      ],
    };
  }
}
