import { createHash } from "crypto";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateInvoiceNumber } from "@/lib/quotes";
import { esRolEquipo } from "@/lib/roles";

type ConvertirContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: ConvertirContext) {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!cotizacion) {
      return Response.json({ ok: false, error: "Cotizacion no encontrada" }, { status: 404 });
    }

    if (cotizacion.estado !== "ACEPTADA") {
      return Response.json(
        { ok: false, error: "Solo se pueden convertir cotizaciones en estado ACEPTADA" },
        { status: 422 },
      );
    }

    if (cotizacion.convertidaAFactura) {
      return Response.json({ ok: false, error: "Esta cotizacion ya fue convertida" }, { status: 409 });
    }

    const numero = await generateInvoiceNumber();
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

    const result = await prisma.$transaction(async (tx) => {
      const factura = await tx.factura.create({
        data: {
          numero,
          clienteId: cotizacion.clienteId,
          usuarioId: session!.user!.id!,
          subtotal: cotizacion.subtotal,
          descuento: cotizacion.descuento,
          impuesto: 0,
          total: cotizacion.total,
          montoPagado: 0,
          saldoPendiente: cotizacion.total,
          estado: "PENDIENTE",
          fechaVencimiento,
          cotizacionId: cotizacion.id,
          items: {
            create: cotizacion.items.map((item) => ({
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
              descuento: item.descuento,
              total: item.total,
            })),
          },
        },
        select: { id: true, numero: true },
      });

      await tx.cotizacion.update({
        where: { id },
        data: { convertidaAFactura: true },
      });

      const firma = createHash("sha256")
        .update(`${session!.user!.id}:CONVERTIR_COTIZACION:${id}:${factura.id}:${Date.now()}`)
        .digest("hex");

      await tx.logFacturacion.create({
        data: {
          usuarioId: session!.user!.id!,
          accion: "CONVERTIR_COTIZACION",
          entidadTipo: "Cotizacion",
          entidadId: id,
          cotizacionId: id,
          facturaId: factura.id,
          datosDespues: { facturaNumero: numero, facturaId: factura.id },
          firmaDigital: firma,
        },
      });

      return factura;
    });

    return Response.json({ ok: true, factura: result }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "No se pudo convertir la cotizacion" }, { status: 503 });
  }
}
