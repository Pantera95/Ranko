import type { AccionLog } from "@prisma/client";

import { prisma } from "@/lib/db";

export type LogRow = {
  id: string;
  accion: AccionLog;
  entidadTipo: string;
  entidadId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  ipAddress: string | null;
  timestamp: string;
  hasAntes: boolean;
  hasDespues: boolean;
};

export type LogsData = {
  logs: LogRow[];
  metrics: { label: string; value: string; helper: string }[];
  isFallback: boolean;
};

export const ACCION_LABELS: Record<AccionLog, string> = {
  CREAR_FACTURA: "Crear factura",
  MODIFICAR_FACTURA: "Modificar factura",
  ANULAR_FACTURA: "Anular factura",
  CREAR_COTIZACION: "Crear cotización",
  MODIFICAR_COTIZACION: "Modificar cotización",
  CONVERTIR_COTIZACION: "Convertir cotización",
  APLICAR_DESCUENTO: "Aplicar descuento",
  CAMBIAR_PRECIO: "Cambiar precio",
  REGISTRAR_PAGO: "Registrar pago",
  REVERTIR_PAGO: "Revertir pago",
  MARCAR_ANOMALIA: "Marcar anomalía",
};

export const ACCION_STYLES: Record<AccionLog, string> = {
  CREAR_FACTURA: "bg-green-100 text-green-700",
  MODIFICAR_FACTURA: "bg-blue-100 text-blue-700",
  ANULAR_FACTURA: "bg-red-100 text-red-700",
  CREAR_COTIZACION: "bg-green-100 text-green-700",
  MODIFICAR_COTIZACION: "bg-blue-100 text-blue-700",
  CONVERTIR_COTIZACION: "bg-purple-100 text-purple-700",
  APLICAR_DESCUENTO: "bg-amber-100 text-amber-700",
  CAMBIAR_PRECIO: "bg-orange-100 text-orange-700",
  REGISTRAR_PAGO: "bg-green-100 text-green-700",
  REVERTIR_PAGO: "bg-red-100 text-red-700",
  MARCAR_ANOMALIA: "bg-red-100 text-red-700",
};

const FALLBACK: LogRow[] = [
  {
    id: "log-1",
    accion: "CREAR_FACTURA",
    entidadTipo: "Factura",
    entidadId: "FAC-0001",
    usuarioNombre: "Admin Ranko",
    usuarioEmail: "admin@rankoparts.com",
    ipAddress: "192.168.1.10",
    timestamp: "2026-05-17T09:14:00.000Z",
    hasAntes: false,
    hasDespues: true,
  },
  {
    id: "log-2",
    accion: "REGISTRAR_PAGO",
    entidadTipo: "Pago",
    entidadId: "PAG-0041",
    usuarioNombre: "Admin Ranko",
    usuarioEmail: "admin@rankoparts.com",
    ipAddress: "192.168.1.10",
    timestamp: "2026-05-17T08:55:00.000Z",
    hasAntes: false,
    hasDespues: true,
  },
  {
    id: "log-3",
    accion: "APLICAR_DESCUENTO",
    entidadTipo: "Cotización",
    entidadId: "COT-0112",
    usuarioNombre: "Vendedor Demo",
    usuarioEmail: "vendedor@rankoparts.com",
    ipAddress: "10.0.0.22",
    timestamp: "2026-05-16T17:30:00.000Z",
    hasAntes: true,
    hasDespues: true,
  },
  {
    id: "log-4",
    accion: "ANULAR_FACTURA",
    entidadTipo: "Factura",
    entidadId: "FAC-0008",
    usuarioNombre: "Admin Ranko",
    usuarioEmail: "admin@rankoparts.com",
    ipAddress: "192.168.1.10",
    timestamp: "2026-05-16T14:02:00.000Z",
    hasAntes: true,
    hasDespues: true,
  },
  {
    id: "log-5",
    accion: "MARCAR_ANOMALIA",
    entidadTipo: "Pago",
    entidadId: "PAG-0038",
    usuarioNombre: "Admin Ranko",
    usuarioEmail: "admin@rankoparts.com",
    ipAddress: "192.168.1.10",
    timestamp: "2026-05-15T11:20:00.000Z",
    hasAntes: false,
    hasDespues: true,
  },
  {
    id: "log-6",
    accion: "CONVERTIR_COTIZACION",
    entidadTipo: "Cotización",
    entidadId: "COT-0109",
    usuarioNombre: "Vendedor Demo",
    usuarioEmail: "vendedor@rankoparts.com",
    ipAddress: "10.0.0.22",
    timestamp: "2026-05-14T10:05:00.000Z",
    hasAntes: true,
    hasDespues: true,
  },
];

export async function getLogsData(limit = 100): Promise<LogsData> {
  try {
    const rows = await prisma.logFacturacion.findMany({
      take: limit,
      orderBy: { timestamp: "desc" },
      select: {
        id: true,
        accion: true,
        entidadTipo: true,
        entidadId: true,
        ipAddress: true,
        timestamp: true,
        datosAntes: true,
        datosDespues: true,
        usuario: { select: { nombre: true, email: true } },
      },
    });

    const logs: LogRow[] = rows.map((r) => ({
      id: r.id,
      accion: r.accion,
      entidadTipo: r.entidadTipo,
      entidadId: r.entidadId,
      usuarioNombre: r.usuario.nombre,
      usuarioEmail: r.usuario.email,
      ipAddress: r.ipAddress ?? null,
      timestamp: r.timestamp.toISOString(),
      hasAntes: r.datosAntes !== null,
      hasDespues: r.datosDespues !== null,
    }));

    return buildData(logs, false);
  } catch {
    console.warn("Logs fallback activo.");
    return buildData(FALLBACK, true);
  }
}

function buildData(logs: LogRow[], isFallback: boolean): LogsData {
  const today = new Date().toISOString().slice(0, 10);
  const hoy = logs.filter((l) => l.timestamp.startsWith(today)).length;
  const anomalias = logs.filter((l) => l.accion === "MARCAR_ANOMALIA" || l.accion === "ANULAR_FACTURA").length;
  const usuarios = new Set(logs.map((l) => l.usuarioEmail)).size;

  return {
    logs,
    isFallback,
    metrics: [
      { label: "Eventos totales", value: String(logs.length), helper: `Últimos registros` },
      { label: "Hoy", value: String(hoy), helper: "Actividad de hoy" },
      { label: "Alertas críticas", value: String(anomalias), helper: "Anulaciones y anomalías" },
      { label: "Usuarios activos", value: String(usuarios), helper: "Con actividad registrada" },
    ],
  };
}
