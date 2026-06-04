import { compare, hash } from "bcryptjs";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  // Only clients can use this endpoint
  if (session.user.rol !== "CLIENTE") {
    return Response.json({ ok: false, error: "Solo disponible para clientes" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const actual: string = body?.actual ?? "";
  const nueva: string = body?.nueva ?? "";
  const confirmar: string = body?.confirmar ?? "";

  if (!actual || !nueva || !confirmar) {
    return Response.json({ ok: false, error: "Todos los campos son requeridos" }, { status: 400 });
  }
  if (nueva.length < 8) {
    return Response.json(
      { ok: false, error: "La nueva contraseña debe tener al menos 8 caracteres" },
      { status: 400 },
    );
  }
  if (nueva !== confirmar) {
    return Response.json(
      { ok: false, error: "La nueva contraseña y su confirmación no coinciden" },
      { status: 400 },
    );
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true, activo: true },
    });

    if (!usuario?.activo) {
      return Response.json({ ok: false, error: "Cuenta inactiva" }, { status: 403 });
    }

    const passwordOk = await compare(actual, usuario.passwordHash);
    if (!passwordOk) {
      return Response.json({ ok: false, error: "La contraseña actual es incorrecta" }, { status: 422 });
    }

    const passwordHash = await hash(nueva, 12);
    await prisma.usuario.update({
      where: { id: session.user.id },
      data: { passwordHash },
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "No se pudo actualizar la contraseña" }, { status: 500 });
  }
}
