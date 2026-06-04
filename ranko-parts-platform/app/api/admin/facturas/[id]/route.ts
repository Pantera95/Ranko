import { createHash } from "crypto";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";
import { restoreStockFromSale } from "@/lib/stock-deduction";

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
      select: {
        id: true,
        estado: true,
        numero: true,
        total: true,
        items: { select: { productoId: true, cantidad: true } },
        pagos: { select: { id: true, estado: true } },
      },
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

    // Block when there are payments that still affect the books. The operator
    // must explicitly RECHAZAR those pagos first (which reverses the balance
    // and creates an audit trail), then anular.
    const pagosActivos = factura.pagos.filter(
      (p) => p.estado === "CONFIRMADO" || p.estado === "PENDIENTE_VERIFICACION",
    );
    if (pagosActivos.length > 0) {
      return Response.json(
        {
          ok: false,
          error: `Hay ${pagosActivos.length} pago(s) activo(s) en esta factura. Recházalos primero.`,
        },
        { status: 422 },
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.factura.update({
        where: { id },
        data: { estado: "ANULADA", saldoPendiente: 0 },
        select: { id: true, numero: true, estado: true },
      });

      // Restore inventory deducted at factura creation
      await restoreStockFromSale(
        tx,
        factura.items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
      );

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
          datosDespues: { estado: "ANULADA", stockRestaurado: factura.items.length },
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
