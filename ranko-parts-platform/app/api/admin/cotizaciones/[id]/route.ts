import { createHash } from "crypto";

import type { EstadoCotizacion } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

type QuoteContext = { params: Promise<{ id: string }> };

const VALID_ESTADOS: EstadoCotizacion[] = ["ENVIADA", "ACEPTADA", "RECHAZADA", "VENCIDA", "BORRADOR"];

export async function GET(_req: Request, context: QuoteContext) {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const cot = await prisma.cotizacion.findUnique({
      where: { id },
      include: {
        cliente: true,
        usuario: true,
        items: { include: { producto: true } },
        factura: { select: { id: true, numero: true } },
      },
    });

    if (!cot) return Response.json({ error: "No encontrado" }, { status: 404 });

    // Serialize Decimal fields to numbers
    const body = {
      ...cot,
      subtotal: Number(cot.subtotal),
      descuento: Number(cot.descuento),
      total: Number(cot.total),
      createdAt: cot.createdAt.toISOString(),
      updatedAt: cot.updatedAt.toISOString(),
      items: cot.items.map((item) => ({
        ...item,
        precioUnitario: Number(item.precioUnitario),
        descuento: Number(item.descuento),
        total: Number(item.total),
      })),
    };

    return Response.json(body);
  } catch {
    return Response.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: QuoteContext) {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  if (!body?.estado || !VALID_ESTADOS.includes(body.estado)) {
    return Response.json({ ok: false, error: "Estado invalido" }, { status: 400 });
  }

  const estado: EstadoCotizacion = body.estado;

  try {
    const cotizacion = await prisma.$transaction(async (tx) => {
      const antes = await tx.cotizacion.findUnique({
        where: { id },
        select: { estado: true, numero: true },
      });

      if (!antes) {
        throw new Error("not_found");
      }

      const updated = await tx.cotizacion.update({
        where: { id },
        data: { estado },
        select: { id: true, estado: true, numero: true },
      });

      const firma = createHash("sha256")
        .update(`${session!.user!.id}:MODIFICAR_COTIZACION:${id}:${Date.now()}`)
        .digest("hex");

      await tx.logFacturacion.create({
        data: {
          usuarioId: session!.user!.id!,
          accion: "MODIFICAR_COTIZACION",
          entidadTipo: "Cotizacion",
          entidadId: id,
          cotizacionId: id,
          datosAntes: { estado: antes.estado },
          datosDespues: { estado },
          firmaDigital: firma,
        },
      });

      return updated;
    });

    return Response.json({ ok: true, cotizacion });
  } catch (err) {
    if (err instanceof Error && err.message === "not_found") {
      return Response.json({ ok: false, error: "Cotizacion no encontrada" }, { status: 404 });
    }
    return Response.json({ ok: false, error: "No se pudo actualizar la cotizacion" }, { status: 503 });
  }
}
