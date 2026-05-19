import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const ROLES_PERMITIDOS = ["ADMIN", "VENDEDOR", "ALMACEN", "VIEWER"] as const;
type RolPermitido = (typeof ROLES_PERMITIDOS)[number];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["MASTER_ADMIN", "ADMIN"].includes(session.user.rol ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);

  const nombre: string = (body?.nombre ?? "").trim();
  const email: string = (body?.email ?? "").trim().toLowerCase();
  const password: string = (body?.password ?? "").trim();
  const rol: string = (body?.rol ?? "").trim().toUpperCase();
  const territorio: string = (body?.territorio ?? "").trim() || "";
  const telefono: string = (body?.telefono ?? "").trim() || "";

  // Validation
  if (!nombre) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "El email no es válido" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
  }
  if (!ROLES_PERMITIDOS.includes(rol as RolPermitido)) {
    return NextResponse.json({ error: "Rol no válido" }, { status: 400 });
  }

  try {
    const passwordHash = await hash(password, 12);

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        passwordHash,
        rol: rol as RolPermitido,
        territorio: territorio || null,
        telefono: telefono || null,
        activo: true,
      },
      select: { id: true, nombre: true, email: true, rol: true },
    });

    return NextResponse.json({ ok: true, usuario }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 409 });
    }
    return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 500 });
  }
}
