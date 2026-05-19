import { EstadoCotizacion, EstadoFactura, EstadoOrden } from "@prisma/client";

import { prisma } from "@/lib/db";

export type ClientPortalData = {
  clienteNombre: string;
  empresa?: string | null;
  codigoReferido?: string | null;
  metrics: {
    label: string;
    value: string;
    helper: string;
  }[];
  vehicles: {
    marca: string;
    modelo: string;
    anio: number;
    motor?: string | null;
  }[];
  isFallback: boolean;
};

function money(value?: unknown) {
  const number = Number(value ?? 0);
  return `$${number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export async function getClientPortalData(userId?: string): Promise<ClientPortalData> {
  if (!userId) {
    return fallbackClientPortalData();
  }

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { usuarioPortalId: userId },
      include: {
        vehiculos: true,
      },
    });

    if (!cliente) {
      return fallbackClientPortalData();
    }

    const [ordenesActivas, facturasPendientes, saldoPendiente, cotizacionesPendientes] =
      await Promise.all([
        prisma.orden.count({
          where: {
            clienteId: cliente.id,
            estado: {
              in: [EstadoOrden.CONFIRMADO, EstadoOrden.EN_PREPARACION, EstadoOrden.EN_CAMINO],
            },
          },
        }),
        prisma.factura.count({
          where: {
            clienteId: cliente.id,
            estado: { in: [EstadoFactura.PENDIENTE, EstadoFactura.PARCIAL, EstadoFactura.VENCIDA] },
          },
        }),
        prisma.factura.aggregate({
          _sum: { saldoPendiente: true },
          where: {
            clienteId: cliente.id,
            estado: { in: [EstadoFactura.PENDIENTE, EstadoFactura.PARCIAL, EstadoFactura.VENCIDA] },
          },
        }),
        prisma.cotizacion.count({
          where: {
            clienteId: cliente.id,
            estado: { in: [EstadoCotizacion.ENVIADA, EstadoCotizacion.BORRADOR] },
          },
        }),
      ]);

    return {
      isFallback: false,
      clienteNombre: cliente.nombre,
      empresa: cliente.empresa,
      codigoReferido: cliente.codigoReferido,
      metrics: [
        {
          label: "Pedidos activos",
          value: String(ordenesActivas),
          helper: "Ordenes en preparacion o camino",
        },
        {
          label: "Facturas pendientes",
          value: String(facturasPendientes),
          helper: money(saldoPendiente._sum.saldoPendiente),
        },
        {
          label: "Cotizaciones",
          value: String(cotizacionesPendientes),
          helper: "Pendientes de aprobacion o respuesta",
        },
      ],
      vehicles: cliente.vehiculos.map((vehiculo) => ({
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        anio: vehiculo.anio,
        motor: vehiculo.motor,
      })),
    };
  } catch {
    console.warn("Client portal fallback activo: base de datos no disponible.");
    return fallbackClientPortalData();
  }
}

function fallbackClientPortalData(): ClientPortalData {
  return {
    isFallback: true,
    clienteNombre: "Cliente Ranko Parts",
    empresa: null,
    codigoReferido: "RANKO-DEMO",
    metrics: [
      { label: "Pedidos activos", value: "0", helper: "Esperando conexion a Postgres" },
      { label: "Facturas pendientes", value: "0", helper: "$0.00" },
      { label: "Cotizaciones", value: "0", helper: "Esperando datos reales" },
    ],
    vehicles: [
      {
        marca: "Jeep",
        modelo: "Grand Cherokee",
        anio: 2014,
        motor: "3.6L V6",
      },
    ],
  };
}
