import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

const ROLES_PERMITIDOS = ["MASTER_ADMIN", "ADMIN", "VENDEDOR", "ALMACEN", "VIEWER"] as const;
type RolPermitido = (typeof ROLES_PERMITIDOS)[number];

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  const actorRol = session?.user?.rol ?? "";
  if (!session?.user || !["MASTER_ADMIN", "ADMIN"].includes(actorRol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  // Build data carefully — only set fields that were sent
  const data: Record<string, unknown> = {};

  if (typeof body.activo === "boolean") data.activo = body.activo;

  if (typeof body.nombre === "string") {
    const nombre = body.nombre.trim();
    if (!nombre) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    data.nombre = nombre;
  }

  if (typeof body.email === "string") {
    const email = body.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "El email no es válido" }, { status: 400 });
    }
    data.email = email;
  }

  if (typeof body.rol === "string") {
    const rol = body.rol.trim().toUpperCase();
    if (!ROLES_PERMITIDOS.includes(rol as RolPermitido)) {
      return NextResponse.json({ error: "Rol no válido" }, { status: 400 });
    }
    // Only MASTER_ADMIN can create/change MASTER_ADMIN
    if (rol === "MASTER_ADMIN" && actorRol !== "MASTER_ADMIN") {
      return NextResponse.json({ error: "Solo MASTER_ADMIN puede asignar este rol" }, { status: 403 });
    }
    data.rol = rol as RolPermitido;
  }

  if (typeof body.territorio === "string") {
    data.territorio = body.territorio.trim() || null;
  }

  if (typeof body.telefono === "string") {
    data.telefono = body.telefono.trim() || null;
  }

  // Password reset (admin-initiated)
  if (typeof body.password === "string" && body.password.length > 0) {
    if (body.password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }
    data.passwordHash = await hash(body.password, 12);
  }

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "Sin cambios válidos" }, { status: 400 });
  }

  // Safety: never let an admin deactivate themselves or strip their own rol
  if (id === session.user.id) {
    if (data.activo === false) {
      return NextResponse.json({ error: "No puedes desactivar tu propia cuenta" }, { status: 400 });
    }
    if (data.rol && data.rol !== actorRol) {
      return NextResponse.json({ error: "No puedes cambiar tu propio rol" }, { status: 400 });
    }
  }

  try {
    const usuario = await prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, activo: true, rol: true, nombre: true, email: true, territorio: true, telefono: true },
    });
    return NextResponse.json({ ok: true, usuario });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 409 });
    }
    return NextResponse.json({ error: "No se pudo actualizar el usuario" }, { status: 500 });
  }
}
