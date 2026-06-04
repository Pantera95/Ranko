import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

type Context = { params: Promise<{ id: string; vid: string }> };

export async function DELETE(_request: Request, context: Context) {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id: clienteId, vid } = await context.params;

  // Ensure the vehicle belongs to this client before deleting
  const vehiculo = await prisma.vehiculo
    .findUnique({ where: { id: vid }, select: { id: true, clienteId: true } })
    .catch(() => null);

  if (!vehiculo) {
    return Response.json({ ok: false, error: "Vehículo no encontrado" }, { status: 404 });
  }
  if (vehiculo.clienteId !== clienteId) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 403 });
  }

  try {
    await prisma.vehiculo.delete({ where: { id: vid } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "No se pudo eliminar el vehículo" }, { status: 503 });
  }
}
