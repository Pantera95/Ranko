import { hash } from "bcryptjs";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

type Ctx = { params: Promise<{ id: string }> };

// ─── POST — activate portal access for a client ───────────────────────────────
export async function POST(request: Request, context: Ctx) {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  const email: string = (body?.email ?? "").trim().toLowerCase();
  const password: string = body?.password ?? "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, error: "Email inválido" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return Response.json(
      { ok: false, error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 },
    );
  }

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      select: { id: true, nombre: true, usuarioPortalId: true },
    });

    if (!cliente) {
      return Response.json({ ok: false, error: "Cliente no encontrado" }, { status: 404 });
    }

    if (cliente.usuarioPortalId) {
      return Response.json(
        { ok: false, error: "Este cliente ya tiene acceso al portal" },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nombre: cliente.nombre,
          email,
          passwordHash,
          rol: "CLIENTE",
          activo: true,
        },
        select: { id: true, email: true },
      });

      await tx.cliente.update({
        where: { id },
        data: { usuarioPortalId: usuario.id },
      });

      return usuario;
    });

    return Response.json({ ok: true, usuario: result }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return Response.json(
        { ok: false, error: "Ese email ya está en uso por otra cuenta" },
        { status: 409 },
      );
    }
    return Response.json({ ok: false, error: "No se pudo activar el portal" }, { status: 500 });
  }
}

// ─── DELETE — revoke portal access ───────────────────────────────────────────
export async function DELETE(_request: Request, context: Ctx) {
  const session = await auth();
  if (
    !session?.user?.rol ||
    !["MASTER_ADMIN", "ADMIN"].includes(session.user.rol)
  ) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      select: { usuarioPortalId: true },
    });

    if (!cliente?.usuarioPortalId) {
      return Response.json({ ok: false, error: "Este cliente no tiene acceso al portal" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.cliente.update({
        where: { id },
        data: { usuarioPortalId: null },
      }),
      prisma.usuario.update({
        where: { id: cliente.usuarioPortalId },
        data: { activo: false },
      }),
    ]);

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "No se pudo revocar el acceso" }, { status: 500 });
  }
}
