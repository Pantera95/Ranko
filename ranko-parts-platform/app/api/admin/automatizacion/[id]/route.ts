import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

type Context = { params: Promise<{ id: string }> };

const PatchSchema = z.object({
  nombre: z.string().min(2).max(80).optional(),
  activa: z.boolean().optional(),
  pasos: z
    .array(
      z.object({
        id: z.string(),
        orden: z.number().int().positive(),
        canal: z.enum(["WHATSAPP", "EMAIL", "INTERNO"]),
        plantillaId: z.string().min(1),
        delayHoras: z.number().int().min(0),
        condicion: z.string().optional(),
      }),
    )
    .optional(),
});

export async function PATCH(req: Request, context: Context) {
  const session = await auth();
  if (!session || !esRolEquipo(session.user?.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body: unknown = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const updated = await prisma.secuenciaAutomatica.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Secuencia no encontrada" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, context: Context) {
  const session = await auth();
  if (!session || !esRolEquipo(session.user?.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    await prisma.secuenciaAutomatica.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Secuencia no encontrada" }, { status: 404 });
  }
}
