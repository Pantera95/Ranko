import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

type AlertaContext = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/alertas/[id]
 * Marks a single alert as read. Used when an admin clicks a notification in the
 * bell dropdown — only that alert is dismissed, the others stay visible.
 *
 * Authorization: the alert must be addressed to the calling user (or be a
 * broadcast alert with usuarioDestinoId = null). Other users' alerts return 404
 * to avoid leaking existence.
 */
export async function PATCH(_request: Request, context: AlertaContext) {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const alerta = await prisma.alerta.findUnique({
      where: { id },
      select: { id: true, usuarioDestinoId: true, leida: true },
    });

    if (!alerta) {
      return Response.json({ ok: false, error: "Alerta no encontrada" }, { status: 404 });
    }

    // Only the addressed user (or anyone for broadcasts) can dismiss it
    if (alerta.usuarioDestinoId !== null && alerta.usuarioDestinoId !== session.user?.id) {
      return Response.json({ ok: false, error: "Alerta no encontrada" }, { status: 404 });
    }

    if (alerta.leida) {
      return Response.json({ ok: true, alerta: { id: alerta.id, leida: true } });
    }

    const updated = await prisma.alerta.update({
      where: { id },
      data: { leida: true },
      select: { id: true, leida: true },
    });

    return Response.json({ ok: true, alerta: updated });
  } catch {
    return Response.json({ ok: false, error: "No se pudo actualizar la alerta" }, { status: 503 });
  }
}
