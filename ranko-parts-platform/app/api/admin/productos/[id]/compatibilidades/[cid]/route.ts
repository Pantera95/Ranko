import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

type Context = { params: Promise<{ id: string; cid: string }> };

export async function DELETE(_request: Request, context: Context) {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id: productoId, cid } = await context.params;

  const compat = await prisma.productoCompatibilidad
    .findUnique({ where: { id: cid }, select: { id: true, productoId: true } })
    .catch(() => null);
  if (!compat) {
    return Response.json({ ok: false, error: "Compatibilidad no encontrada" }, { status: 404 });
  }
  if (compat.productoId !== productoId) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 403 });
  }

  try {
    await prisma.productoCompatibilidad.delete({ where: { id: cid } });
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { ok: false, error: "No se pudo eliminar la compatibilidad" },
      { status: 503 },
    );
  }
}
