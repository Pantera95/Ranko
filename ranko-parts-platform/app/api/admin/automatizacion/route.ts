import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";
import type { Paso } from "@/lib/automation";

const PasoSchema = z.object({
  id: z.string(),
  orden: z.number().int().positive(),
  canal: z.enum(["WHATSAPP", "EMAIL", "INTERNO"]),
  plantillaId: z.string().min(1),
  delayHoras: z.number().int().min(0),
  condicion: z.string().optional(),
});

const CreateSchema = z.object({
  nombre: z.string().min(2).max(80),
  tipo: z.enum([
    "LEAD_NUEVO",
    "COTIZACION_ENVIADA",
    "FACTURA_VENCIDA",
    "RECOMPRA_PROGRAMADA",
    "BIENVENIDA_CLIENTE",
    "PAGO_RECIBIDO",
  ]),
  activa: z.boolean().default(true),
  pasos: z.array(PasoSchema).min(1),
});

export async function GET() {
  const session = await auth();
  if (!session || !esRolEquipo(session.user?.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const rows = await prisma.secuenciaAutomatica.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "DB no disponible" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !esRolEquipo(session.user?.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body: unknown = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { nombre, tipo, activa, pasos } = parsed.data;

  // Assign sequential orden if not provided
  const ordenedPasos: Paso[] = pasos.map((p, i) => ({ ...p, orden: i + 1 }));

  try {
    const secuencia = await prisma.secuenciaAutomatica.create({
      data: { nombre, tipo, activa, pasos: ordenedPasos },
    });

    // Audit firma
    const firma = createHash("sha256")
      .update(`${session.user?.id ?? "system"}|CREATE_SECUENCIA|${secuencia.id}|${Date.now()}`)
      .digest("hex");
    console.info(`[Automation] Created ${secuencia.id} firma=${firma.slice(0, 16)}…`);

    return NextResponse.json(secuencia, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear secuencia" }, { status: 500 });
  }
}
