import type { EstadoCotizacion, EstadoFactura, EstadoOrden, TemperaturaLead } from "@prisma/client";

import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/formatters";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function resolveClienteId(userId: string): Promise<string | null> {
  try {
    const c = await prisma.cliente.findUnique({
      where: { usuarioPortalId: userId },
      select: { id: true },
    });
    return c?.id ?? null;
  } catch {
    return null;
  }
}

// ─── Pedidos ─────────────────────────────────────────────────────────────────

export type ClientePedido = {
  id: string;
  codigo: string;
  facturaNumero: string;
  estado: EstadoOrden;
  estimadoEntrega: string;
  direccionEntrega: string;
  createdAt: string;
};

export type ClientePedidosData = {
  pedidos: ClientePedido[];
  isFallback: boolean;
};

const FALLBACK_PEDIDOS: ClientePedido[] = [
  {
    id: "demo-ord-002",
    codigo: "ORD-20260508-0002",
    facturaNumero: "FAC-2026-0002",
    estado: "EN_PREPARACION",
    estimadoEntrega: "2026-05-14",
    direccionEntrega: "Av. Libertador, Caracas",
    createdAt: "2026-05-08",
  },
];

export async function getClientePedidos(userId?: string): Promise<ClientePedidosData> {
  if (!userId) return { pedidos: FALLBACK_PEDIDOS, isFallback: true };

  try {
    const clienteId = await resolveClienteId(userId);
    if (!clienteId) return { pedidos: FALLBACK_PEDIDOS, isFallback: true };

    const ordenes = await prisma.orden.findMany({
      where: { clienteId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { factura: { select: { numero: true } } },
    });

    return {
      isFallback: false,
      pedidos: ordenes.map((o) => ({
        id: o.id,
        codigo: o.codigo,
        facturaNumero: o.factura.numero,
        estado: o.estado,
        estimadoEntrega: o.estimadoEntrega?.toISOString().slice(0, 10) ?? "",
        direccionEntrega: o.direccionEntrega ?? "",
        createdAt: o.createdAt.toISOString().slice(0, 10),
      })),
    };
  } catch {
    console.warn("Cliente pedidos fallback activo.");
    return { pedidos: FALLBACK_PEDIDOS, isFallback: true };
  }
}

// ─── Facturas ────────────────────────────────────────────────────────────────

export type ClienteFactura = {
  id: string;
  numero: string;
  total: string;
  saldoPendiente: string;
  saldoNum: number;
  montoPagado: string;
  estado: EstadoFactura;
  fechaEmision: string;
  fechaVencimiento: string;
  diasVencida: number;
};

export type ClienteFacturasData = {
  facturas: ClienteFactura[];
  totalDeuda: string;
  isFallback: boolean;
};

const FALLBACK_FACTURAS: ClienteFactura[] = [
  {
    id: "demo-fac-002",
    numero: "FAC-2026-0002",
    total: "$248.00",
    saldoPendiente: "$248.00",
    saldoNum: 248,
    montoPagado: "$0.00",
    estado: "PENDIENTE",
    fechaEmision: "2026-05-08",
    fechaVencimiento: "2026-06-07",
    diasVencida: 0,
  },
];

export async function getClienteFacturas(userId?: string): Promise<ClienteFacturasData> {
  if (!userId) return { facturas: FALLBACK_FACTURAS, totalDeuda: "$248.00", isFallback: true };

  try {
    const clienteId = await resolveClienteId(userId);
    if (!clienteId) return { facturas: FALLBACK_FACTURAS, totalDeuda: "$248.00", isFallback: true };

    const facturas = await prisma.factura.findMany({
      where: { clienteId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const hoy = new Date();
    const rows: ClienteFactura[] = facturas.map((f) => {
      const vencDate = new Date(f.fechaVencimiento);
      const dias = Math.max(0, Math.floor((hoy.getTime() - vencDate.getTime()) / 86400000));
      const saldoNum = Number(f.saldoPendiente);
      return {
        id: f.id,
        numero: f.numero,
        total: formatUsd(f.total.toString()),
        saldoPendiente: formatUsd(f.saldoPendiente.toString()),
        saldoNum,
        montoPagado: formatUsd(f.montoPagado.toString()),
        estado: f.estado,
        fechaEmision: f.fechaEmision.toISOString().slice(0, 10),
        fechaVencimiento: f.fechaVencimiento.toISOString().slice(0, 10),
        diasVencida: dias,
      };
    });

    const totalDeuda = rows
      .filter((f) => f.estado !== "PAGADA" && f.estado !== "ANULADA")
      .reduce((s, f) => s + f.saldoNum, 0);

    return { isFallback: false, facturas: rows, totalDeuda: formatUsd(totalDeuda) };
  } catch {
    console.warn("Cliente facturas fallback activo.");
    return { facturas: FALLBACK_FACTURAS, totalDeuda: "$248.00", isFallback: true };
  }
}

// ─── Cotizaciones ────────────────────────────────────────────────────────────

export type ClienteCotizacion = {
  id: string;
  numero: string;
  total: string;
  subtotal: string;
  descuento: string;
  estado: EstadoCotizacion;
  validezDias: number;
  convertidaAFactura: boolean;
  notas: string;
  createdAt: string;
};

export type ClienteCotizacionesData = {
  cotizaciones: ClienteCotizacion[];
  isFallback: boolean;
};

const FALLBACK_COTIZACIONES: ClienteCotizacion[] = [
  {
    id: "demo-cot-001",
    numero: "COT-2026-0001",
    total: "$248.00",
    subtotal: "$248.00",
    descuento: "$0.00",
    estado: "ENVIADA",
    validezDias: 7,
    convertidaAFactura: false,
    notas: "Aceites y filtros para flota.",
    createdAt: "2026-05-08",
  },
];

export async function getClienteCotizaciones(userId?: string): Promise<ClienteCotizacionesData> {
  if (!userId) return { cotizaciones: FALLBACK_COTIZACIONES, isFallback: true };

  try {
    const clienteId = await resolveClienteId(userId);
    if (!clienteId) return { cotizaciones: FALLBACK_COTIZACIONES, isFallback: true };

    const cots = await prisma.cotizacion.findMany({
      where: { clienteId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return {
      isFallback: false,
      cotizaciones: cots.map((q) => ({
        id: q.id,
        numero: q.numero,
        total: formatUsd(q.total.toString()),
        subtotal: formatUsd(q.subtotal.toString()),
        descuento: formatUsd(q.descuento.toString()),
        estado: q.estado,
        validezDias: q.validezDias,
        convertidaAFactura: q.convertidaAFactura,
        notas: q.notas ?? "",
        createdAt: q.createdAt.toISOString().slice(0, 10),
      })),
    };
  } catch {
    console.warn("Cliente cotizaciones fallback activo.");
    return { cotizaciones: FALLBACK_COTIZACIONES, isFallback: true };
  }
}

// ─── Perfil ──────────────────────────────────────────────────────────────────

export type ClienteVehiculo = {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  motor: string;
  placa: string;
  color: string;
};

export type ClientePerfilData = {
  id: string;
  nombre: string;
  empresa: string;
  tipo: string;
  telefono: string;
  whatsapp: string;
  email: string;
  ciudad: string;
  pais: string;
  direccion: string;
  rif: string;
  condicionPago: string;
  limiteCredito: string;
  scoring: number;
  temperatura: TemperaturaLead;
  codigoReferido: string;
  vehiculos: ClienteVehiculo[];
  isFallback: boolean;
};

export async function getClientePerfil(userId?: string): Promise<ClientePerfilData> {
  const fallback: ClientePerfilData = {
    id: "demo",
    nombre: "Cliente Demo",
    empresa: "Taller Demo Caracas C.A.",
    tipo: "TALLER",
    telefono: "+58 414-5550001",
    whatsapp: "+58 414-5550001",
    email: "cliente@rankoparts.com",
    ciudad: "Caracas",
    pais: "Venezuela",
    direccion: "Av. Principal, Caracas",
    rif: "J-12345678-9",
    condicionPago: "30 dias",
    limiteCredito: "$2,500.00",
    scoring: 82,
    temperatura: "CALIENTE",
    codigoReferido: "RANKO-DEMO",
    vehiculos: [
      { id: "demo-v1", marca: "Jeep", modelo: "Grand Cherokee", anio: 2014, motor: "3.6L V6", placa: "AB123CD", color: "Negro" },
    ],
    isFallback: true,
  };

  if (!userId) return fallback;

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { usuarioPortalId: userId },
      include: { vehiculos: true },
    });

    if (!cliente) return fallback;

    return {
      isFallback: false,
      id: cliente.id,
      nombre: cliente.nombre,
      empresa: cliente.empresa ?? "",
      tipo: cliente.tipo,
      telefono: cliente.telefono,
      whatsapp: cliente.whatsapp ?? "",
      email: cliente.email ?? "",
      ciudad: cliente.ciudad ?? "",
      pais: cliente.pais,
      direccion: cliente.direccion ?? "",
      rif: cliente.rif ?? "",
      condicionPago: cliente.condicionPago ?? "Contado",
      limiteCredito: formatUsd(cliente.limiteCredito.toString()),
      scoring: cliente.scoring,
      temperatura: cliente.temperatura,
      codigoReferido: cliente.codigoReferido ?? "",
      vehiculos: cliente.vehiculos.map((v) => ({
        id: v.id,
        marca: v.marca,
        modelo: v.modelo,
        anio: v.anio,
        motor: v.motor ?? "",
        placa: v.placa ?? "",
        color: v.color ?? "",
      })),
    };
  } catch {
    console.warn("Cliente perfil fallback activo.");
    return fallback;
  }
}

// ─── Referidos ───────────────────────────────────────────────────────────────

export type ClienteReferidoRow = {
  id: string;
  nombre: string;
  empresa: string;
  tipo: string;
  estado: string;
  createdAt: string;
};

export type ClienteReferidosData = {
  codigoReferido: string;
  referidos: ClienteReferidoRow[];
  pendientes: number;
  activos: number;
  isFallback: boolean;
};

export async function getClienteReferidos(userId?: string): Promise<ClienteReferidosData> {
  const fallback: ClienteReferidosData = {
    codigoReferido: "RANKO-DEMO",
    referidos: [],
    pendientes: 0,
    activos: 0,
    isFallback: true,
  };

  if (!userId) return fallback;

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { usuarioPortalId: userId },
      select: {
        codigoReferido: true,
        clientesReferidos: {
          select: {
            id: true,
            nombre: true,
            empresa: true,
            tipo: true,
            activo: true,
            createdAt: true,
          },
          take: 50,
        },
      },
    });

    if (!cliente) return fallback;

    const referidos: ClienteReferidoRow[] = cliente.clientesReferidos.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      empresa: r.empresa ?? "",
      tipo: r.tipo,
      estado: r.activo ? "ACTIVO" : "PENDIENTE",
      createdAt: r.createdAt.toISOString().slice(0, 10),
    }));

    return {
      isFallback: false,
      codigoReferido: cliente.codigoReferido ?? "",
      referidos,
      pendientes: referidos.filter((r) => r.estado === "PENDIENTE").length,
      activos: referidos.filter((r) => r.estado === "ACTIVO").length,
    };
  } catch {
    console.warn("Cliente referidos fallback activo.");
    return fallback;
  }
}
