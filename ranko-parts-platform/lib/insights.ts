import "server-only";

import { prisma } from "@/lib/db";

/**
 * Motor de insights heurísticos para el módulo BI Reportes.
 *
 * Todas las funciones son DETERMINÍSTICAS — sin IA, solo SQL + matemática
 * sobre las tablas VentaImportada / GastoImportado / EstadoFinanciero.
 * Los outputs alimentan el dashboard de /admin/reportes.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Tipos

export type DateRange = { from: Date; to: Date };

export type KpiCard = {
  label: string;
  value: string;
  raw: number;
  delta?: { vsLabel: string; pct: number; absolute: number; positive: boolean };
  meta?: { target: number; achievementPct: number };
  tone: "neutral" | "success" | "warning" | "danger";
};

export type TopPerformer<T = Record<string, unknown>> = {
  rank: number;
  label: string;
  value: number;
  displayValue: string;
  pctOfTotal: number;
  meta?: T;
};

export type Alerta = {
  severidad: "info" | "warning" | "critical";
  titulo: string;
  descripcion: string;
  accion?: string;
};

export type TrendPoint = { period: string; value: number };

export type InsightsSnapshot = {
  range: DateRange;
  kpis: KpiCard[];
  topSkus: TopPerformer[];
  topClientes: TopPerformer[];
  topVendedores: TopPerformer[];
  alertas: Alerta[];
  trends: {
    revenueMensual: TrendPoint[];
    ticketPromedio: TrendPoint[];
    transaccionesMensuales: TrendPoint[];
  };
  proyeccion: {
    revenueRunRateMes: number;
    diasRestantesMes: number;
    proyeccionFinMes: number;
  };
  mixVendedores: { vendedor: string; revenue: number; pct: number }[];
  abc: { clase: "A" | "B" | "C"; skus: number; pctRevenue: number }[];
  concentracion: { cliente: string; pct: number; riesgo: boolean }[];
  estacionalidad: { mes: number; revenuePromedio: number; nombre: string }[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades

function money(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pct(n: number, total: number): number {
  return total > 0 ? (n / total) * 100 : 0;
}

function daysBetween(a: Date, b: Date): number {
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

const MONTH_NAMES_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

// ─────────────────────────────────────────────────────────────────────────────
// Snapshot principal

export async function buildInsightsSnapshot(range: DateRange): Promise<InsightsSnapshot> {
  const [ventas, ventasAnt, metas] = await Promise.all([
    loadVentas(range),
    loadVentas(previousRange(range)),
    loadMetas(),
  ]);

  const validas = ventas.filter((v) => !v.anulada);
  const validasAnt = ventasAnt.filter((v) => !v.anulada);

  const revenueActual = sum(validas, "neto");
  const revenueAnterior = sum(validasAnt, "neto");
  const ticketActual = validas.length > 0 ? revenueActual / validas.length : 0;
  const ticketAnterior = validasAnt.length > 0 ? revenueAnterior / validasAnt.length : 0;
  const txActual = validas.length;
  const txAnterior = validasAnt.length;

  // Costo estimado: si no hay gastos importados, usamos 70% del revenue como costo
  // típico para revenue-based businesses. Cuando GastoImportado tenga data real,
  // sustituye este placeholder.
  const costoEstimado = revenueActual * 0.7;
  const utilidadEstimada = revenueActual - costoEstimado;
  const margenEstimado = revenueActual > 0 ? (utilidadEstimada / revenueActual) * 100 : 0;

  return {
    range,
    kpis: buildKpis({
      revenueActual, revenueAnterior,
      ticketActual, ticketAnterior,
      txActual, txAnterior,
      utilidadEstimada, margenEstimado,
      metas,
    }),
    topSkus: topSkus(validas),
    topClientes: topClientes(validas),
    topVendedores: topVendedores(validas),
    alertas: buildAlertas({
      ventas: validas,
      revenueActual, revenueAnterior,
      ticketActual,
      margenEstimado,
      metas,
    }),
    trends: {
      revenueMensual: trendMensual(validas, (v) => v.neto),
      ticketPromedio: trendTicket(validas),
      transaccionesMensuales: trendMensual(validas, () => 1),
    },
    proyeccion: buildProyeccion(validas, range),
    mixVendedores: mixVendedores(validas),
    abc: abcAnalysis(validas),
    concentracion: concentracionClientes(validas),
    estacionalidad: estacionalidadMensual(validas),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Data loading

type VentaRow = {
  fecha: Date;
  sku: string | null;
  producto: string | null;
  cliente: string | null;
  vendedor: string | null;
  cantidad: number;
  neto: number;
  anulada: boolean;
};

async function loadVentas(range: DateRange): Promise<VentaRow[]> {
  try {
    const rows = await prisma.ventaImportada.findMany({
      where: { fecha: { gte: range.from, lte: range.to } },
      select: {
        fecha: true, sku: true, producto: true, cliente: true, vendedor: true,
        cantidad: true, neto: true, anulada: true,
      },
    });
    return rows.map((r) => ({
      ...r,
      cantidad: Number(r.cantidad),
      neto: Number(r.neto),
    }));
  } catch {
    return [];
  }
}

async function loadMetas(): Promise<Record<string, number>> {
  try {
    const rows = await prisma.metaFinanciera.findMany({ where: { activa: true } });
    return Object.fromEntries(rows.map((r) => [r.tipo, Number(r.valor)]));
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// KPIs

function buildKpis(input: {
  revenueActual: number; revenueAnterior: number;
  ticketActual: number; ticketAnterior: number;
  txActual: number; txAnterior: number;
  utilidadEstimada: number; margenEstimado: number;
  metas: Record<string, number>;
}): KpiCard[] {
  const out: KpiCard[] = [];

  // Revenue
  const revDelta = pctChange(input.revenueActual, input.revenueAnterior);
  out.push({
    label: "Revenue del período",
    value: money(input.revenueActual),
    raw: input.revenueActual,
    delta: {
      vsLabel: "vs período anterior",
      pct: revDelta,
      absolute: input.revenueActual - input.revenueAnterior,
      positive: revDelta >= 0,
    },
    meta: input.metas.REVENUE_MENSUAL
      ? { target: input.metas.REVENUE_MENSUAL, achievementPct: pct(input.revenueActual, input.metas.REVENUE_MENSUAL) }
      : undefined,
    tone: revDelta >= 0 ? "success" : "warning",
  });

  // Ticket promedio
  const tDelta = pctChange(input.ticketActual, input.ticketAnterior);
  const ticketMin = input.metas.TICKET_PROMEDIO_MIN ?? 0;
  const ticketMax = input.metas.TICKET_PROMEDIO_MAX ?? 0;
  let ticketTone: KpiCard["tone"] = "neutral";
  if (ticketMin && input.ticketActual < ticketMin) ticketTone = "warning";
  else if (ticketMax && input.ticketActual > ticketMax) ticketTone = "success";
  else if (ticketMin) ticketTone = "success";
  out.push({
    label: "Ticket promedio",
    value: money(input.ticketActual),
    raw: input.ticketActual,
    delta: {
      vsLabel: "vs período anterior",
      pct: tDelta,
      absolute: input.ticketActual - input.ticketAnterior,
      positive: tDelta >= 0,
    },
    tone: ticketTone,
  });

  // Transacciones
  const txDelta = pctChange(input.txActual, input.txAnterior);
  out.push({
    label: "Transacciones",
    value: input.txActual.toLocaleString("en-US"),
    raw: input.txActual,
    delta: {
      vsLabel: "vs período anterior",
      pct: txDelta,
      absolute: input.txActual - input.txAnterior,
      positive: txDelta >= 0,
    },
    meta: input.metas.TRANSACCIONES_MENSUAL_MIN
      ? { target: input.metas.TRANSACCIONES_MENSUAL_MIN, achievementPct: pct(input.txActual, input.metas.TRANSACCIONES_MENSUAL_MIN) }
      : undefined,
    tone: txDelta >= 0 ? "success" : "warning",
  });

  // Utilidad estimada
  out.push({
    label: "Utilidad estimada",
    value: money(input.utilidadEstimada),
    raw: input.utilidadEstimada,
    meta: input.metas.UTILIDAD_NETA_MENSUAL
      ? { target: input.metas.UTILIDAD_NETA_MENSUAL, achievementPct: pct(input.utilidadEstimada, input.metas.UTILIDAD_NETA_MENSUAL) }
      : undefined,
    tone: input.metas.UTILIDAD_NETA_MENSUAL && input.utilidadEstimada >= input.metas.UTILIDAD_NETA_MENSUAL
      ? "success" : "neutral",
  });

  // Margen estimado
  const margenMeta = input.metas.MARGEN_BRUTO_PCT ?? 0;
  out.push({
    label: "Margen estimado",
    value: `${input.margenEstimado.toFixed(1)}%`,
    raw: input.margenEstimado,
    meta: margenMeta ? { target: margenMeta, achievementPct: (input.margenEstimado / margenMeta) * 100 } : undefined,
    tone: margenMeta && input.margenEstimado < margenMeta ? "danger" : "success",
  });

  return out;
}

function pctChange(actual: number, anterior: number): number {
  if (anterior === 0) return actual > 0 ? 100 : 0;
  return ((actual - anterior) / anterior) * 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// Top performers

function topSkus(ventas: VentaRow[], n = 10): TopPerformer[] {
  const byKey = new Map<string, { neto: number; cantidad: number; producto: string | null }>();
  for (const v of ventas) {
    if (!v.sku) continue;
    const prev = byKey.get(v.sku) ?? { neto: 0, cantidad: 0, producto: v.producto };
    prev.neto += v.neto;
    prev.cantidad += v.cantidad;
    byKey.set(v.sku, prev);
  }
  const total = Array.from(byKey.values()).reduce((s, x) => s + x.neto, 0);
  return Array.from(byKey.entries())
    .sort((a, b) => b[1].neto - a[1].neto)
    .slice(0, n)
    .map((entry, idx) => ({
      rank: idx + 1,
      label: entry[1].producto ?? entry[0],
      value: entry[1].neto,
      displayValue: money(entry[1].neto),
      pctOfTotal: pct(entry[1].neto, total),
      meta: { sku: entry[0], cantidad: entry[1].cantidad },
    }));
}

function topClientes(ventas: VentaRow[], n = 10): TopPerformer[] {
  const byKey = new Map<string, number>();
  for (const v of ventas) {
    if (!v.cliente) continue;
    byKey.set(v.cliente, (byKey.get(v.cliente) ?? 0) + v.neto);
  }
  const total = Array.from(byKey.values()).reduce((s, x) => s + x, 0);
  return Array.from(byKey.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map((entry, idx) => ({
      rank: idx + 1,
      label: entry[0],
      value: entry[1],
      displayValue: money(entry[1]),
      pctOfTotal: pct(entry[1], total),
    }));
}

function topVendedores(ventas: VentaRow[], n = 10): TopPerformer[] {
  const byKey = new Map<string, number>();
  for (const v of ventas) {
    if (!v.vendedor) continue;
    byKey.set(v.vendedor, (byKey.get(v.vendedor) ?? 0) + v.neto);
  }
  const total = Array.from(byKey.values()).reduce((s, x) => s + x, 0);
  return Array.from(byKey.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map((entry, idx) => ({
      rank: idx + 1,
      label: entry[0],
      value: entry[1],
      displayValue: money(entry[1]),
      pctOfTotal: pct(entry[1], total),
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Alertas heurísticas

function buildAlertas(input: {
  ventas: VentaRow[];
  revenueActual: number; revenueAnterior: number;
  ticketActual: number;
  margenEstimado: number;
  metas: Record<string, number>;
}): Alerta[] {
  const out: Alerta[] = [];

  // Caída de revenue significativa
  if (input.revenueAnterior > 0) {
    const delta = pctChange(input.revenueActual, input.revenueAnterior);
    if (delta < -10) {
      out.push({
        severidad: delta < -25 ? "critical" : "warning",
        titulo: `Revenue cayó ${Math.abs(delta).toFixed(1)}%`,
        descripcion: `De ${money(input.revenueAnterior)} a ${money(input.revenueActual)} vs período anterior.`,
        accion: "Revisar pipeline de ventas y mix de productos.",
      });
    }
  }

  // Margen bajo meta
  if (input.metas.MARGEN_BRUTO_PCT && input.margenEstimado < input.metas.MARGEN_BRUTO_PCT) {
    const gap = input.metas.MARGEN_BRUTO_PCT - input.margenEstimado;
    out.push({
      severidad: gap > 5 ? "critical" : "warning",
      titulo: `Margen ${gap.toFixed(1)}pp debajo de meta`,
      descripcion: `Margen actual ${input.margenEstimado.toFixed(1)}% vs meta ${input.metas.MARGEN_BRUTO_PCT.toFixed(1)}%.`,
      accion: "Revisar descuentos otorgados y costos por SKU.",
    });
  }

  // Concentración de cliente (riesgo si 1 cliente > 30%)
  const conc = concentracionClientes(input.ventas);
  const top = conc[0];
  if (top && top.pct > 30) {
    out.push({
      severidad: top.pct > 50 ? "critical" : "warning",
      titulo: "Concentración de revenue en 1 cliente",
      descripcion: `${top.cliente} representa ${top.pct.toFixed(1)}% del revenue total. Riesgo de dependencia.`,
      accion: "Diversificar base de clientes activos.",
    });
  }

  // Revenue vs meta mensual
  if (input.metas.REVENUE_MENSUAL && input.revenueActual < input.metas.REVENUE_MENSUAL * 0.8) {
    const gap = pct(input.metas.REVENUE_MENSUAL - input.revenueActual, input.metas.REVENUE_MENSUAL);
    out.push({
      severidad: gap > 30 ? "critical" : "warning",
      titulo: `Revenue ${gap.toFixed(0)}% debajo de meta`,
      descripcion: `${money(input.revenueActual)} de ${money(input.metas.REVENUE_MENSUAL)} esperados.`,
      accion: "Activar campañas de cierre del período.",
    });
  }

  // Ticket promedio fuera de rango
  if (input.metas.TICKET_PROMEDIO_MIN && input.ticketActual < input.metas.TICKET_PROMEDIO_MIN) {
    out.push({
      severidad: "warning",
      titulo: "Ticket promedio bajo",
      descripcion: `${money(input.ticketActual)} (rango objetivo: ${money(input.metas.TICKET_PROMEDIO_MIN)}–${money(input.metas.TICKET_PROMEDIO_MAX ?? 0)}).`,
      accion: "Considerar upsell o bundles para subir ticket.",
    });
  }

  return out.slice(0, 10); // máximo 10 alertas visibles
}

// ─────────────────────────────────────────────────────────────────────────────
// Trends temporales

function trendMensual(ventas: VentaRow[], extract: (v: VentaRow) => number): TrendPoint[] {
  const byMonth = new Map<string, number>();
  for (const v of ventas) {
    const key = `${v.fecha.getUTCFullYear()}-${String(v.fecha.getUTCMonth() + 1).padStart(2, "0")}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + extract(v));
  }
  return Array.from(byMonth.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([period, value]) => ({ period, value }));
}

function trendTicket(ventas: VentaRow[]): TrendPoint[] {
  const byMonth = new Map<string, { total: number; count: number }>();
  for (const v of ventas) {
    const key = `${v.fecha.getUTCFullYear()}-${String(v.fecha.getUTCMonth() + 1).padStart(2, "0")}`;
    const prev = byMonth.get(key) ?? { total: 0, count: 0 };
    prev.total += v.neto;
    prev.count += 1;
    byMonth.set(key, prev);
  }
  return Array.from(byMonth.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([period, x]) => ({ period, value: x.count > 0 ? x.total / x.count : 0 }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Proyecciones

function buildProyeccion(ventas: VentaRow[], range: DateRange) {
  const totalNeto = ventas.reduce((s, v) => s + v.neto, 0);
  const diasTranscurridos = daysBetween(range.from, range.to);
  const runRateDiario = totalNeto / diasTranscurridos;

  // Si el range es un mes, proyectar al fin del mes.
  // Si no, usar el run-rate como ritmo mensual estimado.
  const finMes = new Date(range.to.getUTCFullYear(), range.to.getUTCMonth() + 1, 0);
  const diasRestantesMes = Math.max(0, daysBetween(range.to, finMes));
  const proyeccionFinMes = totalNeto + runRateDiario * diasRestantesMes;

  return {
    revenueRunRateMes: runRateDiario * 30,
    diasRestantesMes,
    proyeccionFinMes,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mix por vendedor

function mixVendedores(ventas: VentaRow[]) {
  const byKey = new Map<string, number>();
  for (const v of ventas) {
    if (!v.vendedor) continue;
    byKey.set(v.vendedor, (byKey.get(v.vendedor) ?? 0) + v.neto);
  }
  const total = Array.from(byKey.values()).reduce((s, x) => s + x, 0);
  return Array.from(byKey.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([vendedor, revenue]) => ({
      vendedor,
      revenue,
      pct: pct(revenue, total),
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Análisis ABC (regla 80/20)

function abcAnalysis(ventas: VentaRow[]) {
  const bySku = new Map<string, number>();
  for (const v of ventas) {
    if (!v.sku) continue;
    bySku.set(v.sku, (bySku.get(v.sku) ?? 0) + v.neto);
  }
  const sorted = Array.from(bySku.values()).sort((a, b) => b - a);
  const total = sorted.reduce((s, x) => s + x, 0);
  let acumulado = 0;
  const buckets = { A: 0, B: 0, C: 0 };
  const revenue = { A: 0, B: 0, C: 0 };
  for (const value of sorted) {
    acumulado += value;
    const pctAcum = (acumulado / total) * 100;
    if (pctAcum <= 80) { buckets.A++; revenue.A += value; }
    else if (pctAcum <= 95) { buckets.B++; revenue.B += value; }
    else { buckets.C++; revenue.C += value; }
  }
  return (["A", "B", "C"] as const).map((clase) => ({
    clase,
    skus: buckets[clase],
    pctRevenue: pct(revenue[clase], total),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Concentración de clientes

function concentracionClientes(ventas: VentaRow[]) {
  const byKey = new Map<string, number>();
  for (const v of ventas) {
    if (!v.cliente) continue;
    byKey.set(v.cliente, (byKey.get(v.cliente) ?? 0) + v.neto);
  }
  const total = Array.from(byKey.values()).reduce((s, x) => s + x, 0);
  return Array.from(byKey.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cliente, revenue]) => ({
      cliente,
      pct: pct(revenue, total),
      riesgo: pct(revenue, total) > 30,
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Estacionalidad

function estacionalidadMensual(ventas: VentaRow[]) {
  const byMes = new Map<number, { total: number; count: number }>();
  for (const v of ventas) {
    const mes = v.fecha.getUTCMonth();
    const prev = byMes.get(mes) ?? { total: 0, count: 0 };
    prev.total += v.neto;
    prev.count += 1;
    byMes.set(mes, prev);
  }
  const out = [];
  for (let mes = 0; mes < 12; mes++) {
    const x = byMes.get(mes);
    out.push({
      mes: mes + 1,
      revenuePromedio: x && x.count > 0 ? x.total : 0,
      nombre: MONTH_NAMES_ES[mes],
    });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers compartidos

function sum<T>(items: T[], key: keyof T): number {
  return items.reduce((s, it) => s + Number(it[key]), 0);
}

function previousRange(range: DateRange): DateRange {
  const days = daysBetween(range.from, range.to);
  return {
    from: new Date(range.from.getTime() - days * 86_400_000),
    to: new Date(range.from.getTime() - 1),
  };
}
