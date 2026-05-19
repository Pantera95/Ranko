import { createHash } from "crypto";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

type FacturaContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: FacturaContext) {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  if (body?.accion !== "ANULAR") {
    return Response.json({ ok: false, error: "Accion no valida" }, { status: 400 });
  }

  try {
    const factura = await prisma.factura.findUnique({
      where: { id },
      select: { id: true, estado: true, numero: true, total: true },
    });

    if (!factura) {
      return Response.json({ ok: false, error: "Factura no encontrada" }, { status: 404 });
    }

    if (factura.estado === "ANULADA") {
      return Response.json({ ok: false, error: "La factura ya esta anulada" }, { status: 409 });
    }

    if (factura.estado === "PAGADA") {
      return Response.json({ ok: false, error: "No se puede anular una factura pagada" }, { status: 422 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.factura.update({
        where: { id },
        data: { estado: "ANULADA", saldoPendiente: 0 },
        select: { id: true, numero: true, estado: true },
      });

      const firma = createHash("sha256")
        .update(`${session!.user!.id}:ANULAR_FACTURA:${id}:${Date.now()}`)
        .digest("hex");

      await tx.logFacturacion.create({
        data: {
          usuarioId: session!.user!.id!,
          accion: "ANULAR_FACTURA",
          entidadTipo: "Factura",
          entidadId: id,
          facturaId: id,
          datosAntes: { estado: factura.estado, total: factura.total.toString() },
          datosDespues: { estado: "ANULADA" },
          firmaDigital: firma,
        },
      });

      return result;
    });

    return Response.json({ ok: true, factura: updated });
  } catch {
    return Response.json({ ok: false, error: "No se pudo anular la factura" }, { status: 503 });
  }
}
