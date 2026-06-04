import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

type Ctx = { params: Promise<{ id: string; interaccionId: string }> };

const TIPOS_VALIDOS = ["LLAMADA", "WHATSAPP", "EMAIL", "REUNION", "NOTA"] as const;
type TipoValido = (typeof TIPOS_VALIDOS)[number];

function isTipoValido(v: unknown): v is TipoValido {
  return TIPOS_VALIDOS.includes(v as TipoValido);
}

/**
 * Authorization helper: ensures the interaccion exists and belongs to this
 * cliente. Returns 404 (not 403) on mismatch to avoid leaking existence of
 * other clients' interactions to the caller.
 */
async function loadInteraccion(clienteId: string, interaccionId: string) {
  const i = await prisma.interaccion
    .findUnique({
      where: { id: interaccionId },
      select: { id: true, clienteId: true, usuarioId: true, tipo: true, descripcion: true, resultado: true },
    })
    .catch(() => null);
  if (!i || i.clienteId !== clienteId) return null;
  return i;
}

/**
 * PATCH /api/admin/clientes/[id]/interacciones/[interaccionId]
 * Edit an existing interaction (fix typos in descripcion/resultado, correct
 * the tipo). The original author and timestamp are preserved.
 */
export async function PATCH(request: Request, context: Ctx) {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: clienteId, interaccionId } = await context.params;
  const body = await request.json().catch(() => null);

  const existing = await loadInteraccion(clienteId, interaccionId);
  if (!existing) {
    return Response.json({ error: "Interacción no encontrada" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (body?.tipo !== undefined) {
    if (!isTipoValido(body.tipo)) {
      return Response.json({ error: "Tipo de interacción inválido" }, { status: 400 });
    }
    data.tipo = body.tipo;
  }

  if (typeof body?.descripcion === "string") {
    const desc = body.descripcion.trim();
    if (!desc) {
      return Response.json({ error: "La descripción no puede estar vacía" }, { status: 400 });
    }
    data.descripcion = desc;
  }

  if (typeof body?.resultado === "string") {
    data.resultado = body.resultado.trim() || null;
  }

  if (!Object.keys(data).length) {
    return Response.json({ error: "Sin cambios válidos" }, { status: 400 });
  }

  try {
    const updated = await prisma.interaccion.update({
      where: { id: interaccionId },
      data,
      select: {
        id: true,
        tipo: true,
        descripcion: true,
        resultado: true,
        fechaInteraccion: true,
      },
    });
    return Response.json({ ok: true, interaccion: updated });
  } catch {
    return Response.json(
      { error: "No se pudo actualizar la interacción" },
      { status: 503 },
    );
  }
}

/**
 * DELETE /api/admin/clientes/[id]/interacciones/[interaccionId]
 * Removes the interaction from the cliente timeline. Use sparingly — these
 * are intended as the historical record of customer contact.
 */
export async function DELETE(_request: Request, context: Ctx) {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: clienteId, interaccionId } = await context.params;
  const existing = await loadInteraccion(clienteId, interaccionId);
  if (!existing) {
    return Response.json({ error: "Interacción no encontrada" }, { status: 404 });
  }

  try {
    await prisma.interaccion.delete({ where: { id: interaccionId } });
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "No se pudo eliminar la interacción" },
      { status: 503 },
    );
  }
}
