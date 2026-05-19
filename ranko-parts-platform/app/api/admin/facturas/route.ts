import { createHash } from "crypto";

import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateInvoiceNumber } from "@/lib/quotes";
import { esRolEquipo } from "@/lib/roles";

const itemSchema = z.object({
  productoId: z.string().min(1),
  cantidad: z.number().int().positive(),
  precioUnitario: z.number().positive(),
  descuento: z.number().min(0).max(100).default(0),
});

const bodySchema = z.object({
  clienteId: z.string().min(1),
  items: z.array(itemSchema).min(1),
  descuento: z.number().min(0).default(0),
  impuesto: z.number().min(0).default(0),
  metodoPago: z
    .enum(["ZELLE", "TRANSFERENCIA", "EFECTIVO", "CREDITO", "MIXTO"])
    .optional(),
  fechaVencimiento: z.string().min(1), // ISO date string
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
    return Response.json(
      { ok: false, error: "Datos inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { clienteId, items, descuento, impuesto, metodoPago, fechaVencimiento, notas } =
    parsed.data;

  const subtotal = items.reduce((sum, item) => {
    const lineTotal = item.precioUnitario * item.cantidad * (1 - item.descuento / 100);
    return sum + lineTotal;
  }, 0);

  const totalBeforeImpuesto = Math.max(0, subtotal - descuento);
  const total = totalBeforeImpuesto + (totalBeforeImpuesto * impuesto) / 100;
  const saldoPendiente = total;

  try {
    const numero = await generateInvoiceNumber();

    const factura = await prisma.$transaction(async (tx) => {
      const fac = await tx.factura.create({
        data: {
          numero,
          clienteId,
          usuarioId: session!.user!.id!,
          subtotal,
          descuento,
          impuesto: (totalBeforeImpuesto * impuesto) / 100,
          total,
          saldoPendiente,
          metodoPago: metodoPago ?? null,
          fechaVencimiento: new Date(fechaVencimiento),
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
        .update(`${session!.user!.id}:CREAR_FACTURA:${fac.id}:${Date.now()}`)
        .digest("hex");

      await tx.logFacturacion.create({
        data: {
          usuarioId: session!.user!.id!,
          accion: "CREAR_FACTURA",
          entidadTipo: "Factura",
          entidadId: fac.id,
          facturaId: fac.id,
          datosDespues: { numero, clienteId, subtotal, descuento, impuesto, total, items },
          firmaDigital: firma,
        },
      });

      return fac;
    });

    return Response.json({ ok: true, factura }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "No se pudo crear la factura" }, { status: 503 });
  }
}
