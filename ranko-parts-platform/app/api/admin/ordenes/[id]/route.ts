import type { EstadoOrden } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { HistorialEntry } from "@/lib/orders";
import { esRolEquipo } from "@/lib/roles";

type OrdenContext = { params: Promise<{ id: string }> };

// Linear pipeline — each state advances to the next only
const SIGUIENTE: Partial<Record<EstadoOrden, EstadoOrden>> = {
  CONFIRMADO: "EN_PREPARACION",
  EN_PREPARACION: "EN_CAMINO",
  EN_CAMINO: "ENTREGADO",
};

export async function PATCH(request: Request, context: OrdenContext) {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  // Accept explicit estado or "CANCELADO" / "AVANZAR"
  const accion: string = body?.accion ?? "";
  const nota: string = body?.nota ?? "";
  const responsable: string = body?.responsable ?? "";

  if (!["AVANZAR", "CANCELAR"].includes(accion)) {
    return Response.json({ ok: false, error: "Accion no valida. Usa AVANZAR o CANCELAR" }, { status: 400 });
  }

  try {
    const orden = await prisma.orden.findUnique({
      where: { id },
      select: { id: true, estado: true, historialEstados: true },
    });

    if (!orden) {
      return Response.json({ ok: false, error: "Orden no encontrada" }, { status: 404 });
    }

    if (orden.estado === "ENTREGADO" || orden.estado === "CANCELADO") {
      return Response.json(
        { ok: false, error: "La orden ya fue finalizada y no puede modificarse" },
        { status: 422 },
      );
    }

    let nuevoEstado: EstadoOrden;

    if (accion === "CANCELAR") {
      nuevoEstado = "CANCELADO";
    } else {
      const sig = SIGUIENTE[orden.estado];
      if (!sig) {
        return Response.json({ ok: false, error: "No hay siguiente estado disponible" }, { status: 422 });
      }
      nuevoEstado = sig;
    }

    const historialActual = (orden.historialEstados as HistorialEntry[]) ?? [];
    const nuevaEntrada: HistorialEntry = {
      estado: nuevoEstado,
      timestamp: new Date().toISOString(),
      responsable: responsable || (session!.user?.name ?? "Admin"),
      nota: nota || undefined,
    };

    const updated = await prisma.orden.update({
      where: { id },
      data: {
        estado: nuevoEstado,
        historialEstados: [...historialActual, nuevaEntrada],
      },
      select: { id: true, codigo: true, estado: true, historialEstados: true },
    });

    return Response.json({ ok: true, orden: updated });
  } catch {
    return Response.json({ ok: false, error: "No se pudo actualizar la orden" }, { status: 503 });
  }
}
