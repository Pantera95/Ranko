import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

// GET /api/admin/alertas  — unread count + last 8 alerts for notification bell
export async function GET() {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const alertas = await prisma.alerta.findMany({
      where: {
        OR: [
          { usuarioDestinoId: session.user?.id },
          { usuarioDestinoId: null },
        ],
        leida: false,
      },
      orderBy: [{ prioridad: "desc" }, { createdAt: "desc" }],
      take: 8,
      select: {
        id: true,
        tipo: true,
        titulo: true,
        mensaje: true,
        prioridad: true,
        entidadTipo: true,
        entidadId: true,
        leida: true,
        createdAt: true,
      },
    });

    const total = await prisma.alerta.count({
      where: {
        OR: [
          { usuarioDestinoId: session.user?.id },
          { usuarioDestinoId: null },
        ],
        leida: false,
      },
    });

    return Response.json({
      alertas: alertas.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      })),
      total,
    });
  } catch {
    // Return empty when DB unavailable (demo mode)
    return Response.json({ alertas: [], total: 0 });
  }
}

// PATCH /api/admin/alertas  — mark all as read
export async function PATCH() {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await prisma.alerta.updateMany({
      where: {
        OR: [
          { usuarioDestinoId: session.user?.id },
          { usuarioDestinoId: null },
        ],
        leida: false,
      },
      data: { leida: true },
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "No se pudo actualizar" }, { status: 503 });
  }
}
