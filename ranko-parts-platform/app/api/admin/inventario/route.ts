import type { ClasificacionABC } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

const VALID_CLASIFICACIONES: ClasificacionABC[] = ["A", "B", "C"];

/**
 * POST /api/admin/inventario
 * Creates or replaces a stock row for (productoId, almacenId). Use this when:
 *   - A new almacén is added and existing productos need rows.
 *   - An admin wants to register stock for a producto that has no row yet at a
 *     particular almacén (e.g. inter-warehouse transfer destination).
 *
 * Body: { productoId, almacenId, cantidad, stockMinimo?, stockMaximo?, ubicacion?, clasificacion? }
 *
 * Uses the @@unique([productoId, almacenId]) constraint via upsert — calling
 * this on an existing row REPLACES the values (does not increment). For
 * incremental updates use PATCH /api/admin/inventario/[id].
 */
export async function POST(request: Request) {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  const productoId: string = (body?.productoId ?? "").toString().trim();
  const almacenId: string = (body?.almacenId ?? "").toString().trim();
  const cantidad = Math.max(0, Math.floor(Number(body?.cantidad ?? 0)));

  if (!productoId) {
    return Response.json({ ok: false, error: "productoId es requerido" }, { status: 400 });
  }
  if (!almacenId) {
    return Response.json({ ok: false, error: "almacenId es requerido" }, { status: 400 });
  }

  // Optional fields — only include if explicitly provided
  const stockMinimo =
    typeof body?.stockMinimo === "number" && body.stockMinimo >= 0
      ? Math.floor(body.stockMinimo)
      : undefined;
  const stockMaximo =
    typeof body?.stockMaximo === "number" && body.stockMaximo >= 0
      ? Math.floor(body.stockMaximo)
      : undefined;
  const ubicacion =
    typeof body?.ubicacion === "string" ? body.ubicacion.trim() || null : undefined;
  const clasificacion =
    body?.clasificacion && VALID_CLASIFICACIONES.includes(body.clasificacion as ClasificacionABC)
      ? (body.clasificacion as ClasificacionABC)
      : undefined;

  // Verify both referenced entities exist (clearer error than FK violation)
  const [producto, almacen] = await Promise.all([
    prisma.producto.findUnique({ where: { id: productoId }, select: { id: true } }).catch(() => null),
    prisma.almacen.findUnique({ where: { id: almacenId }, select: { id: true, activo: true } }).catch(() => null),
  ]);

  if (!producto) {
    return Response.json({ ok: false, error: "Producto no encontrado" }, { status: 404 });
  }
  if (!almacen) {
    return Response.json({ ok: false, error: "Almacén no encontrado" }, { status: 404 });
  }
  if (!almacen.activo) {
    return Response.json({ ok: false, error: "Almacén inactivo" }, { status: 422 });
  }

  try {
    const inventario = await prisma.inventario.upsert({
      where: { productoId_almacenId: { productoId, almacenId } },
      create: {
        productoId,
        almacenId,
        cantidad,
        ...(stockMinimo !== undefined ? { stockMinimo } : {}),
        ...(stockMaximo !== undefined ? { stockMaximo } : {}),
        ...(ubicacion !== undefined ? { ubicacion } : {}),
        ...(clasificacion !== undefined ? { clasificacion } : {}),
      },
      update: {
        cantidad,
        ultimaActualizacion: new Date(),
        ...(stockMinimo !== undefined ? { stockMinimo } : {}),
        ...(stockMaximo !== undefined ? { stockMaximo } : {}),
        ...(ubicacion !== undefined ? { ubicacion } : {}),
        ...(clasificacion !== undefined ? { clasificacion } : {}),
      },
      select: {
        id: true,
        productoId: true,
        almacenId: true,
        cantidad: true,
        stockMinimo: true,
        stockMaximo: true,
        ubicacion: true,
        clasificacion: true,
      },
    });

    return Response.json({ ok: true, inventario }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "No se pudo guardar el inventario" }, { status: 503 });
  }
}
