import type { EstadoFactura, MetodoPago } from "@prisma/client";

import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/formatters";

export type InvoiceRow = {
  id: string;
  numero: string;
  cliente: string;
  empresa: string;
  total: string;
  montoPagado: string;
  saldoPendiente: string;
  saldoNum: number;
  estado: EstadoFactura;
  metodoPago: MetodoPago | null;
  fechaEmision: string;
  fechaVencimiento: string;
  diasVencida: number;
  agingBucket: "corriente" | "30" | "60" | "90" | "critica";
  cotizacionNumero: string;
  totalItems: number;
};

export type AgingBand = {
  label: string;
  count: number;
  monto: string;
  montoNum: number;
  bucket: InvoiceRow["agingBucket"];
};

export type InvoicesData = {
  invoices: InvoiceRow[];
  aging: AgingBand[];
  metrics: { label: string; value: string; helper: string; danger?: boolean }[];
  isFallback: boolean;
};

const hoy = new Date();

function diasDesdeVencimiento(fecha: string): number {
  const diff = hoy.getTime() - new Date(fecha).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function agingBucket(dias: number, estado: EstadoFactura): InvoiceRow["agingBucket"] {
  if (estado === "PAGADA") return "corriente";
  if (dias <= 0) return "corriente";
  if (dias <= 30) return "30";
  if (dias <= 60) return "60";
  if (dias <= 90) return "90";
  return "critica";
}

const fallbackInvoices: InvoiceRow[] = [
  {
    id: "demo-fac-001",
    numero: "FAC-2026-0001",
    cliente: "Distribuidor Oriente",
    empresa: "Auto Partes Oriente S.R.L.",
    total: "$1,540.00",
    montoPagado: "$1,540.00",
    saldoPendiente: "$0.00",
    saldoNum: 0,
    estado: "PAGADA",
    metodoPago: "ZELLE",
    fechaEmision: "2026-05-05",
    fechaVencimiento: "2026-06-04",
    diasVencida: 0,
    agingBucket: "corriente",
    cotizacionNumero: "COT-2026-0002",
    totalItems: 3,
  },
  {
    id: "demo-fac-002",
    numero: "FAC-2026-0002",
    cliente: "Taller Demo Caracas",
    empresa: "Taller Demo Caracas C.A.",
    total: "$248.00",
    montoPagado: "$0.00",
    saldoPendiente: "$248.00",
    saldoNum: 248,
    estado: "PENDIENTE",
    metodoPago: null,
    fechaEmision: "2026-05-08",
    fechaVencimiento: "2026-06-07",
    diasVencida: 0,
    agingBucket: "corriente",
    cotizacionNumero: "COT-2026-0001",
    totalItems: 2,
  },
  {
    id: "demo-fac-003",
    numero: "FAC-2026-0003",
    cliente: "Carlos Mendoza",
    empresa: "",
    total: "$118.00",
    montoPagado: "$0.00",
    saldoPendiente: "$118.00",
    saldoNum: 118,
    estado: "VENCIDA",
    metodoPago: null,
    fechaEmision: "2026-03-10",
    fechaVencimiento: "2026-04-09",
    diasVencida: 33,
    agingBucket: "60",
    cotizacionNumero: "",
    totalItems: 1,
  },
];

export async function getInvoicesData(): Promise<InvoicesData> {
  try {
    const rows = await prisma.factura.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      include: {
        cliente: { select: { nombre: true, empresa: true } },
        cotizacion: { select: { numero: true } },
        _count: { select: { items: true } },
      },
    });

    const invoices: InvoiceRow[] = rows.map((f) => {
      const venc = f.fechaVencimiento.toISOString().slice(0, 10);
      const dias = diasDesdeVencimiento(venc);
      const saldoNum = Number(f.saldoPendiente);
      return {
        id: f.id,
        numero: f.numero,
        cliente: f.cliente.nombre,
        empresa: f.cliente.empresa ?? "",
        total: formatUsd(f.total.toString()),
        montoPagado: formatUsd(f.montoPagado.toString()),
        saldoPendiente: formatUsd(f.saldoPendiente.toString()),
        saldoNum,
        estado: f.estado,
        metodoPago: f.metodoPago,
        fechaEmision: f.fechaEmision.toISOString().slice(0, 10),
        fechaVencimiento: venc,
        diasVencida: Math.max(0, dias),
        agingBucket: agingBucket(dias, f.estado),
        cotizacionNumero: f.cotizacion?.numero ?? "",
        totalItems: f._count.items,
      };
    });

    return buildInvoicesData(invoices, false);
  } catch {
    console.warn("Facturas fallback activo: base de datos no disponible.");
    return buildInvoicesData(fallbackInvoices, true);
  }
}

function buildInvoicesData(invoices: InvoiceRow[], isFallback: boolean): InvoicesData {
  const pendientes = invoices.filter((i) => i.estado !== "PAGADA" && i.estado !== "ANULADA");
  const vencidas = invoices.filter((i) => i.estado === "VENCIDA");
  const totalCartera = pendientes.reduce((s, i) => s + i.saldoNum, 0);

  const bands: { bucket: InvoiceRow["agingBucket"]; label: string }[] = [
    { bucket: "corriente", label: "Corriente (0-30 d)" },
    { bucket: "30", label: "31-60 días" },
    { bucket: "60", label: "61-90 días" },
    { bucket: "90", label: "+90 días" },
    { bucket: "critica", label: "Critica (+90 días)" },
  ];

  const aging: AgingBand[] = bands
    .map(({ bucket, label }) => {
      const group = pendientes.filter((i) => i.agingBucket === bucket);
      const montoNum = group.reduce((s, i) => s + i.saldoNum, 0);
      return { label, count: group.length, monto: formatUsd(montoNum), montoNum, bucket };
    })
    .filter((b) => b.count > 0);

  return {
    isFallback,
    invoices,
    aging,
    metrics: [
      { label: "Cartera pendiente", value: formatUsd(totalCartera), helper: "Saldo total por cobrar" },
      { label: "Facturas activas", value: String(pendientes.length), helper: "Sin anular ni cobrar" },
      { label: "Vencidas", value: String(vencidas.length), helper: "Superaron fecha limite", danger: vencidas.length > 0 },
      { label: "Total emitidas", value: String(invoices.filter((i) => i.estado !== "ANULADA").length), helper: "Historico" },
    ],
  };
}
