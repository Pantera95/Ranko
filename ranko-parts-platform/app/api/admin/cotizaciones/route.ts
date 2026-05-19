import { createHash } from "crypto";

import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateQuoteNumber } from "@/lib/quotes";
import { esRolEquipo } from "@/lib/roles";

const itemSchema = z.object({
  productoId: z.string().min(1),
  cantidad: z.number().int().positive(),
  precioUnitario: z.number().positive(),
  descuento: z.number().min(0).default(0),
});

const bodySchema = z.object({
  clienteId: z.string().min(1),
  items: z.array(itemSchema).min(1),
  descuento: z.number().min(0).default(0),
  validezDias: z.number().int().positive().default(7),
  notas: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);

  if (!parsed.success) {
    return Response.json({ ok: false, error: "Datos invalidos", issues: parsed.error.issues }, { status: 400 });
  }

  const { clienteId, items, descuento, validezDias, notas } = parsed.data;

  const subtotal = items.reduce((sum, item) => {
    const lineTotal = item.precioUnitario * item.cantidad * (1 - item.descuento / 100);
    return sum + lineTotal;
  }, 0);

  const total = Math.max(0, subtotal - descuento);

  try {
    const numero = await generateQuoteNumber();

    const cotizacion = await prisma.$transaction(async (tx) => {
      const cot = await tx.cotizacion.create({
        data: {
          numero,
          clienteId,
          usuarioId: session!.user!.id!,
          subtotal,
          descuento,
          total,
          validezDias,
          notas,
          items: {
            create: items.map((item) => ({
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
              descuento: item.descuento,
              total: item.precioUnitario * item.cantidad * (1 - item.descuento / 100),
            })),
          },
        },
        select: { id: true, numero: true },
      });

      const firma = createHash("sha256")
        .update(`${session!.user!.id}:CREAR_COTIZACION:${cot.id}:${Date.now()}`)
        .digest("hex");

      await tx.logFacturacion.create({
        data: {
          usuarioId: session!.user!.id!,
          accion: "CREAR_COTIZACION",
          entidadTipo: "Cotizacion",
          entidadId: cot.id,
          cotizacionId: cot.id,
          datosDespues: { numero, clienteId, subtotal, descuento, total, items },
          firmaDigital: firma,
        },
      });

      return cot;
    });

    return Response.json({ ok: true, cotizacion }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "No se pudo crear la cotizacion" }, { status: 503 });
  }
}
