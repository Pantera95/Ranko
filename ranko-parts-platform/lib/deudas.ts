import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/formatters";

export type DeudaCliente = {
  id: string;
  nombre: string;
  empresa: string;
  telefono: string;
  whatsapp: string;
  bloqueado: boolean;
  scoring: number;
  deudaTotal: number;
  deudaTotalStr: string;
  facturas: {
    id: string;
    numero: string;
    saldoNum: number;
    saldoStr: string;
    diasVencida: number;
    bucket: "corriente" | "30" | "60" | "90" | "critica";
    estado: string;
  }[];
  peorBucket: "corriente" | "30" | "60" | "90" | "critica";
};

export type DeudasData = {
  clientes: DeudaCliente[];
  totales: {
    corriente: number;
    dias30: number;
    dias60: number;
    dias90: number;
    critica: number;
    total: number;
  };
  metrics: { label: string; value: string; helper: string; danger?: boolean }[];
  isFallback: boolean;
};

const hoy = new Date();
const BUCKET_ORDER = ["corriente", "30", "60", "90", "critica"] as const;
type Bucket = (typeof BUCKET_ORDER)[number];

function diasDesde(fecha: string): number {
  return Math.floor((hoy.getTime() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24));
}

function toBucket(dias: number, estado: string): Bucket {
  if (estado === "PAGADA" || estado === "ANULADA") return "corriente";
  if (dias <= 0) return "corriente";
  if (dias <= 30) return "30";
  if (dias <= 60) return "60";
  if (dias <= 90) return "90";
  return "critica";
}

// ─── Fallback demo ────────────────────────────────────────────────────────────

const FALLBACK: DeudaCliente[] = [
  {
    id: "demo-c1",
    nombre: "Distribuidor Oriente",
    empresa: "Distribuidora Oriente C.A.",
    telefono: "+58 412-5551234",
    whatsapp: "+58 412-5551234",
    bloqueado: false,
    scoring: 62,
    deudaTotal: 1386,
    deudaTotalStr: "$1,386.00",
    facturas: [
      { id: "f1", numero: "FAC-2026-0001", saldoNum: 1268, saldoStr: "$1,268.00", diasVencida: 0, bucket: "corriente", estado: "PENDIENTE" },
      { id: "f3", numero: "FAC-2026-0003", saldoNum: 118, saldoStr: "$118.00", diasVencida: 33, bucket: "60", estado: "VENCIDA" },
    ],
    peorBucket: "60",
  },
  {
    id: "demo-c2",
    nombre: "Carlos Mendoza",
    empresa: "",
    telefono: "+58 414-7900001",
    whatsapp: "+58 414-7900001",
    bloqueado: false,
    scoring: 38,
    deudaTotal: 248,
    deudaTotalStr: "$248.00",
    facturas: [
      { id: "f2", numero: "FAC-2026-0002", saldoNum: 248, saldoStr: "$248.00", diasVencida: 0, bucket: "corriente", estado: "PENDIENTE" },
    ],
    peorBucket: "corriente",
  },
];

// ─── Main function ────────────────────────────────────────────────────────────

export async function getDeudasData(): Promise<DeudasData> {
  try {
    const facturas = await prisma.factura.findMany({
      where: {
        estado: { in: ["PENDIENTE", "PARCIAL", "VENCIDA"] },
        saldoPendiente: { gt: 0 },
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            empresa: true,
            telefono: true,
            whatsapp: true,
            bloqueado: true,
            scoring: true,
          },
        },
      },
      orderBy: { fechaVencimiento: "asc" },
    });

    // Group by client
    const byCliente = new Map<string, DeudaCliente>();

    for (const f of facturas) {
      const venc = f.fechaVencimiento.toISOString().slice(0, 10);
      const dias = Math.max(0, diasDesde(venc));
      const bucket = toBucket(dias, f.estado);
      const saldoNum = Number(f.saldoPendiente);

      if (!byCliente.has(f.clienteId)) {
        byCliente.set(f.clienteId, {
          id: f.clienteId,
          nombre: f.cliente.nombre,
          empresa: f.cliente.empresa ?? "",
          telefono: f.cliente.telefono ?? "",
          whatsapp: f.cliente.whatsapp ?? "",
          bloqueado: f.cliente.bloqueado,
          scoring: f.cliente.scoring,
          deudaTotal: 0,
          deudaTotalStr: "",
          facturas: [],
          peorBucket: "corriente",
        });
      }

      const c = byCliente.get(f.clienteId)!;
      c.deudaTotal += saldoNum;
      c.facturas.push({
        id: f.id,
        numero: f.numero,
        saldoNum,
        saldoStr: formatUsd(saldoNum),
        diasVencida: dias,
        bucket,
        estado: f.estado,
      });
    }

    const clientes: DeudaCliente[] = [...byCliente.values()].map((c) => {
      c.deudaTotalStr = formatUsd(c.deudaTotal);
      const worstIdx = Math.max(...c.facturas.map((f) => BUCKET_ORDER.indexOf(f.bucket)));
      c.peorBucket = BUCKET_ORDER[worstIdx];
      return c;
    });

    clientes.sort((a, b) => BUCKET_ORDER.indexOf(b.peorBucket) - BUCKET_ORDER.indexOf(a.peorBucket) || b.deudaTotal - a.deudaTotal);

    return buildDeudasData(clientes, false);
  } catch {
    console.warn("Deudas fallback activo.");
    return buildDeudasData(FALLBACK, true);
  }
}

function buildDeudasData(clientes: DeudaCliente[], isFallback: boolean): DeudasData {
  const allFacturas = clientes.flatMap((c) => c.facturas);

  const totales = {
    corriente: allFacturas.filter((f) => f.bucket === "corriente").reduce((s, f) => s + f.saldoNum, 0),
    dias30: allFacturas.filter((f) => f.bucket === "30").reduce((s, f) => s + f.saldoNum, 0),
    dias60: allFacturas.filter((f) => f.bucket === "60").reduce((s, f) => s + f.saldoNum, 0),
    dias90: allFacturas.filter((f) => f.bucket === "90").reduce((s, f) => s + f.saldoNum, 0),
    critica: allFacturas.filter((f) => f.bucket === "critica").reduce((s, f) => s + f.saldoNum, 0),
    total: allFacturas.reduce((s, f) => s + f.saldoNum, 0),
  };

  const enRiesgo = clientes.filter((c) => ["60", "90", "critica"].includes(c.peorBucket)).length;
  const bloqueados = clientes.filter((c) => c.bloqueado).length;
  const criticos = clientes.filter((c) => c.peorBucket === "critica").length;

  return {
    clientes,
    totales,
    isFallback,
    metrics: [
      { label: "Cartera total", value: formatUsd(totales.total), helper: "Saldo pendiente total" },
      { label: "Criticos (+90d)", value: formatUsd(totales.critica + totales.dias90), helper: "Requieren accion inmediata", danger: (totales.critica + totales.dias90) > 0 },
      { label: "Clientes en riesgo", value: String(enRiesgo), helper: "+60 dias vencidos", danger: enRiesgo > 0 },
      { label: "Bloqueados", value: String(bloqueados), helper: "Bloqueo comercial activo" },
    ],
  };
}
