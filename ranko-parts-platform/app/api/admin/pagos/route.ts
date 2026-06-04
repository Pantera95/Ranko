import { createHash } from "crypto";

import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

const METODOS = ["ZELLE", "TRANSFERENCIA", "EFECTIVO", "CREDITO", "MIXTO"] as const;

const bodySchema = z.object({
  facturaId: z.string().min(1),
  monto: z.number().positive(),
  metodo: z.enum(METODOS),
  referencia: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);

  if (!parsed.success) {
    return Response.json({ ok: false, error: "Datos invalidos", issues: parsed.error.issues }, { status: 400 });
  }

  const { facturaId, monto, metodo, referencia } = parsed.data;

  try {
    const factura = await prisma.factura.findUnique({
      where: { id: facturaId },
      select: { id: true, clienteId: true, saldoPendiente: true, estado: true, numero: true },
    });

    if (!factura) {
      return Response.json({ ok: false, error: "Factura no encontrada" }, { status: 404 });
    }

    if (factura.estado === "ANULADA") {
      return Response.json({ ok: false, error: "No se puede registrar pago en factura anulada" }, { status: 422 });
    }

    // ─── Anomaly detection ───────────────────────────────────────────────────
    const anomalias: string[] = [];

    if (referencia) {
      const dupRef = await prisma.pago.findFirst({
        where: { referencia, estado: { not: "RECHAZADO" } },
      });
      if (dupRef) anomalias.push("Referencia duplicada en otro pago");
    }

    const saldo = Number(factura.saldoPendiente);
    if (monto > saldo + 0.01) {
      anomalias.push(`Monto $${monto.toFixed(2)} supera saldo pendiente $${saldo.toFixed(2)}`);
    }

    if (factura.estado === "VENCIDA") {
      anomalias.push("Factura registrada como vencida");
    }

    const esAnomalo = anomalias.length > 0;
    // Anomalous payments enter the verification queue; clean payments auto-confirm
    // (the factura balance is pre-applied below in the non-anomaly branch).
    const estadoPago: "PENDIENTE_VERIFICACION" | "CONFIRMADO" = esAnomalo
      ? "PENDIENTE_VERIFICACION"
      : "CONFIRMADO";

    // ─── Create pago + update factura ────────────────────────────────────────
    const result = await prisma.$transaction(async (tx) => {
      const pago = await tx.pago.create({
        data: {
          facturaId,
          clienteId: factura.clienteId,
          monto,
          metodo,
          referencia,
          estado: estadoPago,
          esAnomalo,
          razonAnomalia: esAnomalo ? anomalias.join(" | ") : null,
          registradoPorId: session!.user!.id,
        },
        select: { id: true, esAnomalo: true, razonAnomalia: true },
      });

      // Pre-apply to factura balance optimistically (confirmed after verification)
      if (!esAnomalo) {
        const nuevoSaldo = Math.max(0, saldo - monto);
        const nuevoEstado =
          nuevoSaldo <= 0.005
            ? "PAGADA"
            : "PARCIAL";

        await tx.factura.update({
          where: { id: facturaId },
          data: {
            montoPagado: { increment: monto },
            saldoPendiente: nuevoSaldo,
            estado: nuevoEstado,
          },
        });
      }

      const firma = createHash("sha256")
        .update(`${session!.user!.id}:REGISTRAR_PAGO:${pago.id}:${facturaId}:${Date.now()}`)
        .digest("hex");

      await tx.logFacturacion.create({
        data: {
          usuarioId: session!.user!.id!,
          accion: "REGISTRAR_PAGO",
          entidadTipo: "Pago",
          entidadId: pago.id,
          facturaId,
          pagoId: pago.id,
          datosDespues: { monto, metodo, referencia, esAnomalo, anomalias },
          firmaDigital: firma,
        },
      });

      return pago;
    });

    return Response.json({ ok: true, pago: result }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "No se pudo registrar el pago" }, { status: 503 });
  }
}
