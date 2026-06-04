import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * PATCH /api/cliente/perfil
 * Self-service update of the logged-in cliente's own contact fields.
 *
 * Editable: whatsapp, email, ciudad, direccion
 * NOT editable from here: nombre, telefono, empresa, tipo, condicionPago,
 *   limiteCredito, scoring, codigoReferido — those are admin-managed.
 *
 * Auth: only CLIENTE role. The cliente record is found via Cliente.usuarioPortalId
 * (set during portal onboarding by an admin).
 */
export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  if (session.user.rol !== "CLIENTE") {
    return Response.json({ ok: false, error: "Solo disponible para clientes" }, { status: 403 });
  }

  const cliente = await prisma.cliente.findFirst({
    where: { usuarioPortalId: session.user.id },
    select: { id: true, bloqueado: true, activo: true },
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

  const body = await request.json().catch(() => null);
  const data: Record<string, unknown> = {};

  if (typeof body?.whatsapp === "string") {
    const wa = body.whatsapp.trim();
    // Lightweight phone-shape check — keep flexible for VE prefixes etc.
    if (wa && !/^[0-9+\-()\s]{6,20}$/.test(wa)) {
      return Response.json({ ok: false, error: "WhatsApp no tiene un formato válido" }, { status: 400 });
    }
    data.whatsapp = wa || null;
  }

  if (typeof body?.email === "string") {
    const email = body.email.trim().toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ ok: false, error: "Email no tiene un formato válido" }, { status: 400 });
    }
    data.email = email || null;
  }

  if (typeof body?.ciudad === "string") {
    data.ciudad = body.ciudad.trim() || null;
  }

  if (typeof body?.direccion === "string") {
    const dir = body.direccion.trim();
    if (dir.length > 500) {
      return Response.json({ ok: false, error: "La dirección es demasiado larga" }, { status: 400 });
    }
    data.direccion = dir || null;
  }

  if (!Object.keys(data).length) {
    return Response.json({ ok: false, error: "Sin cambios válidos" }, { status: 400 });
  }

  try {
    const updated = await prisma.cliente.update({
      where: { id: cliente.id },
      data,
      select: {
        id: true,
        whatsapp: true,
        email: true,
        ciudad: true,
        direccion: true,
      },
    });

    return Response.json({ ok: true, cliente: updated });
  } catch {
    return Response.json({ ok: false, error: "No se pudo actualizar el perfil" }, { status: 500 });
  }
}
