import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Context = { params: Promise<{ vid: string }> };

/**
 * DELETE /api/cliente/vehiculos/[vid]
 * Removes a vehicle from the authenticated client's own fleet. Ownership is
 * enforced via vehiculo.clienteId === cliente.id; mismatches return 404 to
 * avoid leaking the existence of other clients' vehicles.
 */
export async function DELETE(_request: Request, context: Context) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  if (session.user.rol !== "CLIENTE") {
    return Response.json({ ok: false, error: "Solo disponible para clientes" }, { status: 403 });
  }

  const { vid } = await context.params;

  const cliente = await prisma.cliente.findFirst({
    where: { usuarioPortalId: session.user.id },
    select: { id: true, activo: true, bloqueado: true },
  });

  if (!cliente) {
    return Response.json({ ok: false, error: "Perfil de cliente no encontrado" }, { status: 404 });
  }
  if (!cliente.activo || cliente.bloqueado) {
    return Response.json(
      { ok: false, error: "Tu cuenta no permite cambios. Contacta a tu vendedor." },
      { status: 403 },
    );
  }

  const vehiculo = await prisma.vehiculo
    .findUnique({ where: { id: vid }, select: { id: true, clienteId: true } })
    .catch(() => null);

  if (!vehiculo || vehiculo.clienteId !== cliente.id) {
    return Response.json({ ok: false, error: "Vehículo no encontrado" }, { status: 404 });
  }

  try {
    await prisma.vehiculo.delete({ where: { id: vid } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "No se pudo eliminar el vehículo" }, { status: 503 });
  }
}
