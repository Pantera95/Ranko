import { prisma } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MonthlyRevenue = {
  mes: string;
  ventas: number;
  facturas: number;
};

export type TopSku = {
  sku: string;
  nombre: string;
  categoria: string;
  unidades: number;
  revenue: number;
};

export type LeadFunnelItem = {
  estado: string;
  label: string;
  count: number;
};

export type ClienteSegmento = {
  segmento: string;
  count: number;
  fill: string;
};

export type InventoryTurnoverItem = {
  sku: string;
  nombre: string;
  vendidas: number;
  stock: number;
  rotacion: number;
};

export type ReportsSummary = {
  totalRevenue: number;
  totalFacturas: number;
  avgRevenuePerFactura: number;
  topMes: string;
  conversionRate: number; // VENTA_CERRADA / total leads %
};

export type ReportsData = {
  monthlyRevenue: MonthlyRevenue[];
  topSkus: TopSku[];
  leadFunnel: LeadFunnelItem[];
  clienteSegmentos: ClienteSegmento[];
  inventoryTurnover: InventoryTurnoverItem[];
  summary: ReportsSummary;
  isFallback: boolean;
};

// ─── Fallback data ────────────────────────────────────────────────────────────

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function buildFallback(): ReportsData {
  const now = new Date();

  const monthlyRevenue: MonthlyRevenue[] = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const base = 3200 + Math.round(Math.sin(i) * 800 + i * 220);
    return {
      mes: `${MESES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      ventas: base,
      facturas: Math.round(base / 320),
    };
  });

  const topSkus: TopSku[] = [
    { sku: "LM-5W40-001", nombre: "Liqui-Moly 5W-40", categoria: "Aceites", unidades: 84, revenue: 4032 },
    { sku: "KN-33-2457", nombre: "K&N Filtro Alto Flujo", categoria: "Filtros", unidades: 47, revenue: 3384 },
    { sku: "MOP-68191349AC", nombre: "Mopar Pastillas Freno", categoria: "Frenos", unidades: 31, revenue: 3658 },
    { sku: "LM-10W40-002", nombre: "Liqui-Moly 10W-40", categoria: "Aceites", unidades: 62, revenue: 2480 },
    { sku: "KN-HP-2009", nombre: "K&N Filtro de Aceite", categoria: "Filtros", unidades: 55, revenue: 1650 },
    { sku: "MOP-5085386AA", nombre: "Mopar Kit Juntas", categoria: "Juntas", unidades: 22, revenue: 1540 },
  ];

  const leadFunnel: LeadFunnelItem[] = [
    { estado: "NUEVO", label: "Nuevo", count: 18 },
    { estado: "CALIFICANDO", label: "Calificando", count: 12 },
    { estado: "COTIZADO", label: "Cotizado", count: 9 },
    { estado: "EN_NEGOCIACION", label: "Negociacion", count: 6 },
    { estado: "CIERRE_PENDIENTE", label: "Cierre", count: 4 },
    { estado: "VENTA_CERRADA", label: "Cerrado", count: 22 },
    { estado: "PERDIDO", label: "Perdido", count: 7 },
  ];

  const clienteSegmentos: ClienteSegmento[] = [
    { segmento: "A (76-100)", count: 14, fill: "#F5C518" },
    { segmento: "B (50-75)", count: 28, fill: "#6b7280" },
    { segmento: "C (0-49)", count: 11, fill: "#374151" },
  ];

  const inventoryTurnover: InventoryTurnoverItem[] = [
    { sku: "LM-5W40-001", nombre: "Liqui-Moly 5W-40", vendidas: 84, stock: 24, rotacion: 3.5 },
    { sku: "KN-33-2457", nombre: "K&N Filtro Alto Flujo", vendidas: 47, stock: 11, rotacion: 4.3 },
    { sku: "MOP-68191349AC", nombre: "Mopar Pastillas Freno", vendidas: 31, stock: 7, rotacion: 4.4 },
    { sku: "LM-10W40-002", nombre: "Liqui-Moly 10W-40", vendidas: 62, stock: 19, rotacion: 3.3 },
    { sku: "KN-HP-2009", nombre: "K&N Filtro Aceite", vendidas: 55, stock: 16, rotacion: 3.4 },
  ];

  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.ventas, 0);
  const totalFacturas = monthlyRevenue.reduce((s, m) => s + m.facturas, 0);
  const totalLeads = leadFunnel.reduce((s, l) => s + l.count, 0);
  const cerrados = leadFunnel.find((l) => l.estado === "VENTA_CERRADA")?.count ?? 0;

  return {
    isFallback: true,
    monthlyRevenue,
    topSkus,
    leadFunnel,
    clienteSegmentos,
    inventoryTurnover,
    summary: {
      totalRevenue,
      totalFacturas,
      avgRevenuePerFactura: totalFacturas > 0 ? Math.round(totalRevenue / totalFacturas) : 0,
      topMes: monthlyRevenue.reduce((a, b) => (b.ventas > a.ventas ? b : a)).mes,
      conversionRate: totalLeads > 0 ? Math.round((cerrados / totalLeads) * 100) : 0,
    },
  };
}

// ─── Real data ────────────────────────────────────────────────────────────────

export async function getReportsData(): Promise<ReportsData> {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [facturas, facturaItems, leads, clientes, inventarios] = await Promise.all([
      prisma.factura.findMany({
        where: { createdAt: { gte: twelveMonthsAgo }, estado: { not: "ANULADA" } },
        select: { total: true, createdAt: true },
      }),
      prisma.facturaItem.findMany({
        where: {
          factura: { createdAt: { gte: twelveMonthsAgo }, estado: { not: "ANULADA" } },
        },
        include: {
          producto: { select: { sku: true, nombre: true, categoria: true } },
        },
      }),
      prisma.lead.groupBy({
        by: ["estado"],
        _count: { id: true },
      }),
      prisma.cliente.findMany({
        where: { activo: true },
        select: { scoring: true },
      }),
      prisma.inventario.findMany({
        select: {
          cantidad: true,
          producto: { select: { sku: true, nombre: true } },
        },
        take: 50,
      }),
    ]);

    // ── Monthly revenue ──────────────────────────────────────────────────────
    const now = new Date();
    const monthMap = new Map<string, { ventas: number; facturas: number }>();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${MESES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      monthMap.set(key, { ventas: 0, facturas: 0 });
    }

    for (const f of facturas) {
      const d = new Date(f.createdAt);
      const key = `${MESES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      if (monthMap.has(key)) {
        const entry = monthMap.get(key)!;
        entry.ventas += Number(f.total);
        entry.facturas += 1;
      }
    }

    const monthlyRevenue: MonthlyRevenue[] = Array.from(monthMap.entries()).map(
      ([mes, v]) => ({ mes, ventas: Math.round(v.ventas * 100) / 100, facturas: v.facturas }),
    );

    // ── Top SKUs ─────────────────────────────────────────────────────────────
    const skuMap = new Map<
      string,
      { sku: string; nombre: string; categoria: string; unidades: number; revenue: number }
    >();

    for (const item of facturaItems) {
      const existing = skuMap.get(item.productoId) ?? {
        sku: item.producto.sku,
        nombre: item.producto.nombre,
        categoria: item.producto.categoria,
        unidades: 0,
        revenue: 0,
      };
      existing.unidades += item.cantidad;
      existing.revenue += Number(item.total);
      skuMap.set(item.productoId, existing);
    }

    const topSkus: TopSku[] = Array.from(skuMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
      .map((s) => ({ ...s, revenue: Math.round(s.revenue * 100) / 100 }));

    // ── Lead funnel ───────────────────────────────────────────────────────────
    const LEAD_LABELS: Record<string, string> = {
      NUEVO: "Nuevo",
      CALIFICANDO: "Calificando",
      COTIZADO: "Cotizado",
      EN_NEGOCIACION: "Negociacion",
      CIERRE_PENDIENTE: "Cierre",
      VENTA_CERRADA: "Cerrado",
      RECOMPRA: "Recompra",
      PERDIDO: "Perdido",
    };
    const LEAD_ORDER = ["NUEVO", "CALIFICANDO", "COTIZADO", "EN_NEGOCIACION", "CIERRE_PENDIENTE", "VENTA_CERRADA", "RECOMPRA", "PERDIDO"];

    const leadFunnel: LeadFunnelItem[] = LEAD_ORDER.map((estado) => {
      const found = leads.find((l) => l.estado === estado);
      return { estado, label: LEAD_LABELS[estado] ?? estado, count: found?._count.id ?? 0 };
    }).filter((l) => l.count > 0);

    // ── Cliente segmentos ─────────────────────────────────────────────────────
    const segA = clientes.filter((c) => c.scoring >= 76).length;
    const segB = clientes.filter((c) => c.scoring >= 50 && c.scoring < 76).length;
    const segC = clientes.filter((c) => c.scoring < 50).length;

    const clienteSegmentos: ClienteSegmento[] = [
      { segmento: "A (76-100)", count: segA, fill: "#F5C518" },
      { segmento: "B (50-75)", count: segB, fill: "#6b7280" },
      { segmento: "C (0-49)", count: segC, fill: "#374151" },
    ].filter((s) => s.count > 0);

    // ── Inventory turnover ────────────────────────────────────────────────────
    const stockMap = new Map<string, number>();
    for (const inv of inventarios) {
      const prev = stockMap.get(inv.producto.sku) ?? 0;
      stockMap.set(inv.producto.sku, prev + inv.cantidad);
    }

    const inventoryTurnover: InventoryTurnoverItem[] = topSkus
      .slice(0, 6)
      .map((s) => {
        const stock = stockMap.get(s.sku) ?? 1;
        return {
          sku: s.sku,
          nombre: s.nombre.length > 22 ? s.nombre.slice(0, 22) + "…" : s.nombre,
          vendidas: s.unidades,
          stock,
          rotacion: Math.round((s.unidades / stock) * 10) / 10,
        };
      })
      .sort((a, b) => b.rotacion - a.rotacion);

    // ── Summary ───────────────────────────────────────────────────────────────
    const totalRevenue = facturas.reduce((s, f) => s + Number(f.total), 0);
    const totalFacturasCount = facturas.length;
    const totalLeads = leads.reduce((s, l) => s + l._count.id, 0);
    const cerrados = leads.find((l) => l.estado === "VENTA_CERRADA")?._count.id ?? 0;
    const topMes = monthlyRevenue.reduce(
      (a, b) => (b.ventas > a.ventas ? b : a),
      monthlyRevenue[0] ?? { mes: "—", ventas: 0, facturas: 0 },
    ).mes;

    return {
      isFallback: false,
      monthlyRevenue,
      topSkus,
      leadFunnel,
      clienteSegmentos,
      inventoryTurnover,
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalFacturas: totalFacturasCount,
        avgRevenuePerFactura:
          totalFacturasCount > 0 ? Math.round(totalRevenue / totalFacturasCount) : 0,
        topMes,
        conversionRate:
          totalLeads > 0 ? Math.round((cerrados / totalLeads) * 100) : 0,
      },
    };
  } catch {
    console.warn("Reportes fallback activo: base de datos no disponible.");
    return buildFallback();
  }
}
