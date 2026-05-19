import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user || !["MASTER_ADMIN", "ADMIN"].includes(session.user.rol ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  try {
    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        ...(typeof body.activo === "boolean" ? { activo: body.activo } : {}),
        ...(body.rol ? { rol: body.rol } : {}),
        ...(body.territorio !== undefined ? { territorio: body.territorio } : {}),
      },
      select: { id: true, activo: true, rol: true },
    });
    return NextResponse.json(usuario);
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el usuario" }, { status: 500 });
  }
}
