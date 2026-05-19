import type {
  EstadoCotizacion,
  EstadoFactura,
  FuenteCliente,
  TemperaturaLead,
  TipoCliente,
  TipoInteraccion,
} from "@prisma/client";

import { prisma } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ClienteDetail = {
  id: string;
  nombre: string;
  empresa: string | null;
  tipo: TipoCliente;
  telefono: string;
  whatsapp: string | null;
  email: string | null;
  ciudad: string | null;
  rif: string | null;
  condicionPago: string | null;
  limiteCredito: number;
  scoring: number;
  temperatura: TemperaturaLead;
  fuente: FuenteCliente;
  notas: string | null;
  bloqueado: boolean;
  activo: boolean;
  codigoReferido: string | null;
  vendedorNombre: string | null;
  createdAt: string;

  vehiculos: {
    id: string;
    marca: string;
    modelo: string;
    anio: number;
    motor: string | null;
    placa: string | null;
  }[];

  ultimasFacturas: {
    id: string;
    numero: string;
    total: number;
    saldo: number;
    estado: EstadoFactura;
    fechaEmision: string;
    fechaVencimiento: string | null;
  }[];

  ultimasCotizaciones: {
    id: string;
    numero: string;
    total: number;
    estado: EstadoCotizacion;
    createdAt: string;
  }[];

  ultimasInteracciones: {
    id: string;
    tipo: TipoInteraccion;
    descripcion: string;
    createdAt: string;
    usuarioNombre: string;
  }[];

  stats: {
    totalFacturado: number;
    deudaActual: number;
    cotizacionesTotal: number;
    cotizacionesAceptadas: number;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

const FALLBACK: ClienteDetail = {
  id: "demo-c1",
  nombre: "Taller San Martín",
  empresa: "Taller San Martín C.A.",
  tipo: "TALLER",
  telefono: "+58 412-5550001",
  whatsapp: "+58 412-5550001",
  email: "sanmartin@taller.ve",
  ciudad: "Caracas",
  rif: "J-29500001-3",
  condicionPago: "30 días",
  limiteCredito: 5000,
  scoring: 72,
  temperatura: "CALIENTE",
  fuente: "REFERIDO",
  notas: "Cliente frecuente. Prefiere factura al inicio del mes.",
  bloqueado: false,
  activo: true,
  codigoReferido: "REF-TSM-001",
  vendedorNombre: "Vendedor Demo",
  createdAt: "2025-11-01",
  vehiculos: [
    { id: "v1", marca: "Jeep", modelo: "Grand Cherokee", anio: 2019, motor: "3.6L V6", placa: "ABC-123" },
    { id: "v2", marca: "Dodge", modelo: "RAM 1500", anio: 2021, motor: "5.7L V8", placa: "XYZ-789" },
  ],
  ultimasFacturas: [
    { id: "f1", numero: "FAC-0041", total: 1240.00, saldo: 0, estado: "PAGADA", fechaEmision: "2026-05-01", fechaVencimiento: "2026-05-31" },
    { id: "f2", numero: "FAC-0028", total: 870.50, saldo: 870.50, estado: "VENCIDA", fechaEmision: "2026-03-15", fechaVencimiento: "2026-04-14" },
    { id: "f3", numero: "FAC-0019", total: 530.00, saldo: 0, estado: "PAGADA", fechaEmision: "2026-02-08", fechaVencimiento: "2026-03-08" },
  ],
  ultimasCotizaciones: [
    { id: "q1", numero: "COT-0112", total: 1540.00, estado: "ENVIADA", createdAt: "2026-05-10" },
    { id: "q2", numero: "COT-0098", total: 870.50, estado: "ACEPTADA", createdAt: "2026-03-12" },
    { id: "q3", numero: "COT-0081", total: 530.00, estado: "ACEPTADA", createdAt: "2026-02-05" },
  ],
  ultimasInteracciones: [
    { id: "i1", tipo: "WHATSAPP", descripcion: "Confirmó recepción de cotización COT-0112", createdAt: "2026-05-11T14:32:00Z", usuarioNombre: "Vendedor Demo" },
    { id: "i2", tipo: "LLAMADA", descripcion: "Consulta por frenos traseros Jeep 2019", createdAt: "2026-05-08T10:15:00Z", usuarioNombre: "Vendedor Demo" },
    { id: "i3", tipo: "PAGO_REGISTRADO", descripcion: "Pago Zelle FAC-0041 por $1,240.00", createdAt: "2026-05-05T09:00:00Z", usuarioNombre: "Admin Ranko" },
  ],
  stats: {
    totalFacturado: 2640.50,
    deudaActual: 870.50,
    cotizacionesTotal: 3,
    cotizacionesAceptadas: 2,
  },
};

// ─── Data fetcher ─────────────────────────────────────────────────────────────

export async function getClienteDetail(id: string): Promise<ClienteDetail | null> {
  try {
    const c = await prisma.cliente.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        empresa: true,
        tipo: true,
        telefono: true,
        whatsapp: true,
        email: true,
        ciudad: true,
        rif: true,
        condicionPago: true,
        limiteCredito: true,
        scoring: true,
        temperatura: true,
        fuente: true,
        notas: true,
        bloqueado: true,
        activo: true,
        codigoReferido: true,
        createdAt: true,
        usuarioAsignado: { select: { nombre: true } },
        vehiculos: {
          select: { id: true, marca: true, modelo: true, anio: true, motor: true, placa: true },
          orderBy: { anio: "desc" },
        },
        facturas: {
          select: {
            id: true,
            numero: true,
            total: true,
            saldoPendiente: true,
            estado: true,
            fechaEmision: true,
            fechaVencimiento: true,
          },
          orderBy: { fechaEmision: "desc" },
          take: 10,
        },
        cotizaciones: {
          select: { id: true, numero: true, total: true, estado: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        },
        interacciones: {
          select: {
            id: true,
            tipo: true,
            descripcion: true,
            fechaInteraccion: true,
            usuario: { select: { nombre: true } },
          },
          orderBy: { fechaInteraccion: "desc" },
          take: 10,
        },
      },
    });

    if (!c) return null;

    const totalFacturado = c.facturas
      .filter((f) => f.estado !== "ANULADA")
      .reduce((s, f) => s + Number(f.total), 0);

    const deudaActual = c.facturas
      .filter((f) => f.estado === "PENDIENTE" || f.estado === "PARCIAL" || f.estado === "VENCIDA")
      .reduce((s, f) => s + Number(f.saldoPendiente), 0);

    const cotizacionesAceptadas = c.cotizaciones.filter((q) => q.estado === "ACEPTADA").length;

    return {
      id: c.id,
      nombre: c.nombre,
      empresa: c.empresa ?? null,
      tipo: c.tipo,
      telefono: c.telefono,
      whatsapp: c.whatsapp ?? null,
      email: c.email ?? null,
      ciudad: c.ciudad ?? null,
      rif: c.rif ?? null,
      condicionPago: c.condicionPago ?? null,
      limiteCredito: Number(c.limiteCredito),
      scoring: c.scoring,
      temperatura: c.temperatura,
      fuente: c.fuente,
      notas: c.notas ?? null,
      bloqueado: c.bloqueado,
      activo: c.activo,
      codigoReferido: c.codigoReferido ?? null,
      vendedorNombre: c.usuarioAsignado?.nombre ?? null,
      createdAt: fmt(c.createdAt),
      vehiculos: c.vehiculos.map((v) => ({
        id: v.id,
        marca: v.marca,
        modelo: v.modelo,
        anio: v.anio,
        motor: v.motor ?? null,
        placa: v.placa ?? null,
      })),
      ultimasFacturas: c.facturas.map((f) => ({
        id: f.id,
        numero: f.numero,
        total: Number(f.total),
        saldo: Number(f.saldoPendiente),
        estado: f.estado,
        fechaEmision: fmt(f.fechaEmision),
        fechaVencimiento: f.fechaVencimiento ? fmt(f.fechaVencimiento) : null,
      })),
      ultimasCotizaciones: c.cotizaciones.map((q) => ({
        id: q.id,
        numero: q.numero,
        total: Number(q.total),
        estado: q.estado,
        createdAt: fmt(q.createdAt),
      })),
      ultimasInteracciones: c.interacciones.map((i) => ({
        id: i.id,
        tipo: i.tipo,
        descripcion: i.descripcion,
        createdAt: i.fechaInteraccion.toISOString(),
        usuarioNombre: i.usuario.nombre,
      })),
      stats: {
        totalFacturado,
        deudaActual,
        cotizacionesTotal: c.cotizaciones.length,
        cotizacionesAceptadas,
      },
    };
  } catch {
    console.warn("ClienteDetail fallback for id:", id);
    return FALLBACK;
  }
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export const TIPO_LABELS: Record<TipoCliente, string> = {
  MINORISTA: "Minorista",
  TALLER: "Taller",
  DISTRIBUIDOR_LOCAL: "Dist. Local",
  DISTRIBUIDOR_REGIONAL: "Dist. Regional",
  VIP: "VIP",
};

export const TIPO_STYLES: Record<TipoCliente, string> = {
  MINORISTA: "bg-zinc-100 text-zinc-600",
  TALLER: "bg-blue-100 text-blue-700",
  DISTRIBUIDOR_LOCAL: "bg-green-100 text-green-700",
  DISTRIBUIDOR_REGIONAL: "bg-purple-100 text-purple-700",
  VIP: "bg-[var(--color-gold)] text-black",
};

export const TEMP_LABELS: Record<TemperaturaLead, string> = {
  CALIENTE: "🔥 Caliente",
  TIBIO: "🌡 Tibio",
  FRIO: "❄️ Frío",
};

export const TEMP_STYLES: Record<TemperaturaLead, string> = {
  CALIENTE: "bg-red-100 text-red-700",
  TIBIO: "bg-amber-100 text-amber-700",
  FRIO: "bg-blue-100 text-blue-700",
};

export const INTERACCION_LABELS: Record<TipoInteraccion, string> = {
  LLAMADA: "Llamada",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  REUNION: "Reunión",
  NOTA: "Nota",
  COTIZACION_ENVIADA: "Cotización enviada",
  FACTURA_EMITIDA: "Factura emitida",
  PAGO_REGISTRADO: "Pago registrado",
};

export const FACTURA_ESTADO_STYLES: Record<EstadoFactura, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  PARCIAL: "bg-orange-100 text-orange-700",
  PAGADA: "bg-green-100 text-green-700",
  VENCIDA: "bg-red-100 text-red-700",
  ANULADA: "bg-zinc-100 text-zinc-500",
};

export const COT_ESTADO_STYLES: Record<EstadoCotizacion, string> = {
  BORRADOR: "bg-zinc-100 text-zinc-600",
  ENVIADA: "bg-blue-100 text-blue-700",
  ACEPTADA: "bg-green-100 text-green-700",
  RECHAZADA: "bg-red-100 text-red-700",
  VENCIDA: "bg-zinc-100 text-zinc-500",
};
