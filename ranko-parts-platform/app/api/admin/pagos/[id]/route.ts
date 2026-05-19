import { createHash } from "crypto";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

type PagoContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: PagoContext) {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const accion: string = body?.accion ?? "";

  if (!["CONFIRMAR", "RECHAZAR", "MARCAR_ANOMALIA"].includes(accion)) {
    return Response.json({ ok: false, error: "Accion no valida" }, { status: 400 });
  }

  try {
    const pago = await prisma.pago.findUnique({
      where: { id },
      select: {
        id: true,
        estado: true,
        monto: true,
        facturaId: true,
        esAnomalo: true,
      },
    });

    if (!pago) {
      return Response.json({ ok: false, error: "Pago no encontrado" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      let nuevoEstado: "CONFIRMADO" | "RECHAZADO" | "ANOMALO" | "PENDIENTE_VERIFICACION" =
        "PENDIENTE_VERIFICACION";
      let logAccion: "REGISTRAR_PAGO" | "REVERTIR_PAGO" | "MARCAR_ANOMALIA" = "REGISTRAR_PAGO";

      if (accion === "CONFIRMAR") {
        nuevoEstado = "CONFIRMADO";
        logAccion = "REGISTRAR_PAGO";

        // Apply to factura if not yet applied (anomalous payments weren't applied)
        if (pago.esAnomalo) {
          const factura = await tx.factura.findUnique({
            where: { id: pago.facturaId },
            select: { saldoPendiente: true },
          });
          if (factura) {
            const nuevoSaldo = Math.max(0, Number(factura.saldoPendiente) - Number(pago.monto));
            await tx.factura.update({
              where: { id: pago.facturaId },
              data: {
                montoPagado: { increment: Number(pago.monto) },
                saldoPendiente: nuevoSaldo,
                estado: nuevoSaldo <= 0.005 ? "PAGADA" : "PARCIAL",
              },
            });
          }
        }
      } else if (accion === "RECHAZAR") {
        nuevoEstado = "RECHAZADO";
        logAccion = "REVERTIR_PAGO";

        // Reverse factura if payment was already applied
        if (!pago.esAnomalo) {
          await tx.factura.update({
            where: { id: pago.facturaId },
            data: {
              montoPagado: { decrement: Number(pago.monto) },
              saldoPendiente: { increment: Number(pago.monto) },
              estado: "PARCIAL",
            },
          });
        }
      } else {
        nuevoEstado = "ANOMALO";
        logAccion = "MARCAR_ANOMALIA";
      }

      const updated = await tx.pago.update({
        where: { id },
        data: {
          estado: nuevoEstado,
          verificadoPorId: session!.user!.id,
          esAnomalo: accion === "MARCAR_ANOMALIA" ? true : pago.esAnomalo,
          razonAnomalia: accion === "MARCAR_ANOMALIA" ? (body?.razonAnomalia ?? "Marcado manualmente") : undefined,
        },
        select: { id: true, estado: true, esAnomalo: true },
      });

      const firma = createHash("sha256")
        .update(`${session!.user!.id}:${logAccion}:${id}:${Date.now()}`)
        .digest("hex");

      await tx.logFacturacion.create({
        data: {
          usuarioId: session!.user!.id!,
          accion: logAccion,
          entidadTipo: "Pago",
          entidadId: id,
          facturaId: pago.facturaId,
          pagoId: id,
          datosAntes: { estado: pago.estado },
          datosDespues: { estado: nuevoEstado, accion },
          firmaDigital: firma,
        },
      });

      return updated;
    });

    return Response.json({ ok: true, pago: result });
  } catch {
    return Response.json({ ok: false, error: "No se pudo procesar el pago" }, { status: 503 });
  }
}
