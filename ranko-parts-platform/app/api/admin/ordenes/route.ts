import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateOrderCode } from "@/lib/orders";
import { esRolEquipo } from "@/lib/roles";

const bodySchema = z.object({
  facturaId: z.string().min(1),
  direccionEntrega: z.string().optional(),
  responsable: z.string().optional(),
  estimadoEntrega: z.string().optional(),
  notasDespacho: z.string().optional(),
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

  const { facturaId, direccionEntrega, responsable, estimadoEntrega, notasDespacho } = parsed.data;

  try {
    const factura = await prisma.factura.findUnique({
      where: { id: facturaId },
      select: { id: true, clienteId: true, estado: true, orden: { select: { id: true } } },
    });

    if (!factura) {
      return Response.json({ ok: false, error: "Factura no encontrada" }, { status: 404 });
    }

    if (factura.estado === "ANULADA") {
      return Response.json({ ok: false, error: "No se puede crear orden para factura anulada" }, { status: 422 });
    }

    if (factura.orden) {
      return Response.json({ ok: false, error: "Esta factura ya tiene una orden asignada" }, { status: 409 });
    }

    const codigo = await generateOrderCode();
    const ahora = new Date().toISOString();

    const orden = await prisma.orden.create({
      data: {
        codigo,
        facturaId,
        clienteId: factura.clienteId,
        estado: "CONFIRMADO",
        responsable,
        direccionEntrega,
        estimadoEntrega: estimadoEntrega ? new Date(estimadoEntrega) : null,
        notasDespacho,
        historialEstados: [
          {
            estado: "CONFIRMADO",
            timestamp: ahora,
            responsable: session!.user?.name ?? session!.user?.email ?? "Admin",
          },
        ],
      },
      select: { id: true, codigo: true },
    });

    return Response.json({ ok: true, orden }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "No se pudo crear la orden" }, { status: 503 });
  }
}
