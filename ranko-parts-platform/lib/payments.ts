import type { EstadoPago, MetodoPago } from "@prisma/client";

import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/formatters";

export type PaymentRow = {
  id: string;
  facturaId: string;
  facturaNumero: string;
  cliente: string;
  monto: string;
  montoNum: number;
  metodo: MetodoPago;
  referencia: string;
  estado: EstadoPago;
  esAnomalo: boolean;
  razonAnomalia: string;
  registradoPor: string;
  fechaPago: string;
};

export type PaymentFactura = {
  id: string;
  numero: string;
  cliente: string;
  saldoPendiente: number;
  estado: string;
};

export type PaymentsData = {
  payments: PaymentRow[];
  facturasPendientes: PaymentFactura[];
  metrics: { label: string; value: string; helper: string; danger?: boolean }[];
  isFallback: boolean;
};

const fallbackPayments: PaymentRow[] = [
  {
    id: "demo-pago-001",
    facturaId: "demo-fac-001",
    facturaNumero: "FAC-2026-0001",
    cliente: "Distribuidor Oriente",
    monto: "$1,540.00",
    montoNum: 1540,
    metodo: "ZELLE",
    referencia: "ZEL-20260505-001",
    estado: "CONFIRMADO",
    esAnomalo: false,
    razonAnomalia: "",
    registradoPor: "Admin Ranko",
    fechaPago: "2026-05-05",
  },
];

const fallbackFacturasPendientes: PaymentFactura[] = [
  { id: "demo-fac-002", numero: "FAC-2026-0002", cliente: "Taller Demo Caracas", saldoPendiente: 248, estado: "PENDIENTE" },
  { id: "demo-fac-003", numero: "FAC-2026-0003", cliente: "Carlos Mendoza", saldoPendiente: 118, estado: "VENCIDA" },
];

export async function getPaymentsData(): Promise<PaymentsData> {
  try {
    const [payments, facturas] = await Promise.all([
      prisma.pago.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
          factura: { select: { numero: true } },
          cliente: { select: { nombre: true } },
          registradoPor: { select: { nombre: true } },
        },
      }),
      prisma.factura.findMany({
        where: { estado: { in: ["PENDIENTE", "PARCIAL", "VENCIDA"] } },
        orderBy: { fechaVencimiento: "asc" },
        take: 100,
        select: {
          id: true,
          numero: true,
          saldoPendiente: true,
          estado: true,
          cliente: { select: { nombre: true } },
        },
      }),
    ]);

    const rows: PaymentRow[] = payments.map((p) => ({
      id: p.id,
      facturaId: p.facturaId,
      facturaNumero: p.factura.numero,
      cliente: p.cliente.nombre,
      monto: formatUsd(p.monto.toString()),
      montoNum: Number(p.monto),
      metodo: p.metodo,
      referencia: p.referencia ?? "",
      estado: p.estado,
      esAnomalo: p.esAnomalo,
      razonAnomalia: p.razonAnomalia ?? "",
      registradoPor: p.registradoPor?.nombre ?? "—",
      fechaPago: p.fechaPago.toISOString().slice(0, 10),
    }));

    const facturasPendientes: PaymentFactura[] = facturas.map((f) => ({
      id: f.id,
      numero: f.numero,
      cliente: f.cliente.nombre,
      saldoPendiente: Number(f.saldoPendiente),
      estado: f.estado,
    }));

    return buildPaymentsData(rows, facturasPendientes, false);
  } catch {
    console.warn("Pagos fallback activo: base de datos no disponible.");
    return buildPaymentsData(fallbackPayments, fallbackFacturasPendientes, true);
  }
}

function buildPaymentsData(
  payments: PaymentRow[],
  facturasPendientes: PaymentFactura[],
  isFallback: boolean,
): PaymentsData {
  const pendientesVerif = payments.filter((p) => p.estado === "PENDIENTE_VERIFICACION").length;
  const anomalos = payments.filter((p) => p.esAnomalo).length;
  const confirmadosHoy = payments.filter(
    (p) => p.estado === "CONFIRMADO" && p.fechaPago === new Date().toISOString().slice(0, 10),
  ).length;
  const totalConfirmado = payments
    .filter((p) => p.estado === "CONFIRMADO")
    .reduce((s, p) => s + p.montoNum, 0);

  return {
    isFallback,
    payments,
    facturasPendientes,
    metrics: [
      { label: "Por verificar", value: String(pendientesVerif), helper: "Pagos sin confirmar", danger: pendientesVerif > 0 },
      { label: "Confirmados hoy", value: String(confirmadosHoy), helper: "Procesados en el dia" },
      { label: "Total cobrado", value: formatUsd(totalConfirmado), helper: "Pagos confirmados" },
      { label: "Anomalos", value: String(anomalos), helper: "Requieren revision", danger: anomalos > 0 },
    ],
  };
}
