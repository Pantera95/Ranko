import type { ClasificacionABC, Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

type InventarioContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: InventarioContext) {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const data: Prisma.InventarioUpdateInput = {};

  if (typeof body?.cantidad === "number" && body.cantidad >= 0) {
    data.cantidad = body.cantidad;
    data.ultimaActualizacion = new Date();
  }

  if (typeof body?.stockMinimo === "number" && body.stockMinimo >= 0) {
    data.stockMinimo = body.stockMinimo;
  }

  if (typeof body?.stockMaximo === "number" && body.stockMaximo >= 0) {
    data.stockMaximo = body.stockMaximo;
  }

  if (typeof body?.ubicacion === "string") {
    data.ubicacion = body.ubicacion.trim() || null;
  }

  const validClasificaciones: ClasificacionABC[] = ["A", "B", "C"];

  if (body?.clasificacion && validClasificaciones.includes(body.clasificacion as ClasificacionABC)) {
    data.clasificacion = body.clasificacion as ClasificacionABC;
  }

  if (!Object.keys(data).length) {
    return Response.json({ ok: false, error: "Sin cambios validos" }, { status: 400 });
  }

  try {
    const inventario = await prisma.inventario.update({
      where: { id },
      data,
      select: {
        id: true,
        cantidad: true,
        stockMinimo: true,
        stockMaximo: true,
        ubicacion: true,
        clasificacion: true,
        ultimaActualizacion: true,
      },
    });

    return Response.json({ ok: true, inventario });
  } catch {
    return Response.json(
      { ok: false, error: "No se pudo actualizar el inventario" },
      { status: 503 },
    );
  }
}
