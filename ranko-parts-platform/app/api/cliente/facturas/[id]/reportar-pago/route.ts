import { createHash } from "crypto";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

const METODOS = ["ZELLE", "TRANSFERENCIA", "EFECTIVO", "CREDITO", "MIXTO"] as const;
type MetodoPago = (typeof METODOS)[number];

/**
 * POST /api/cliente/facturas/[id]/reportar-pago
 * Lets a client report a payment from the portal. Unlike admin-registered
 * payments, client-reported claims ALWAYS land in the verification queue
 * (esAnomalo = true with a "reportado por cliente" reason) and are never
 * pre-applied to the factura balance. An admin must explicitly CONFIRMAR the
 * pago through the existing verification flow, which applies it then.
 *
 * Body: { monto, metodo, referencia?, notas? }
 */
export async function POST(request: Request, context: Context) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  if (session.user.rol !== "CLIENTE") {
    return Response.json({ ok: false, error: "Solo disponible para clientes" }, { status: 403 });
  }

  const { id: facturaId } = await context.params;
  const body = await request.json().catch(() => null);

  const monto = Number(body?.monto ?? 0);
  const metodoRaw = (body?.metodo ?? "").toString().toUpperCase();
  const referencia = (body?.referencia ?? "").toString().trim().slice(0, 100) || null;
  const notas = (body?.notas ?? "").toString().trim().slice(0, 500);

  if (!Number.isFinite(monto) || monto <= 0) {
    return Response.json({ ok: false, error: "El monto debe ser mayor a 0" }, { status: 400 });
  }
  if (!METODOS.includes(metodoRaw as MetodoPago)) {
    return Response.json(
      { ok: false, error: "Método de pago no válido" },
      { status: 400 },
    );
  }
  const metodo = metodoRaw as MetodoPago;

  // Resolve cliente from portal user
  const cliente = await prisma.cliente.findFirst({
    where: { usuarioPortalId: session.user.id },
    select: { id: true, bloqueado: true, activo: true },
  });

  if (!cliente) {
    return Response.json({ ok: false, error: "Perfil de cliente no encontrado" }, { status: 404 });
  }
  if (!cliente.activo || cliente.bloqueado) {
    return Response.json(
      { ok: false, error: "Tu cuenta no permite reportar pagos. Contacta a tu vendedor." },
      { status: 403 },
    );
  }

  // Verify the factura belongs to this cliente and accepts payments
  const factura = await prisma.factura.findUnique({
    where: { id: facturaId },
    select: { id: true, clienteId: true, estado: true, numero: true, saldoPendiente: true },
  });

  if (!factura || factura.clienteId !== cliente.id) {
    return Response.json({ ok: false, error: "Factura no encontrada" }, { status: 404 });
  }
  if (factura.estado === "ANULADA") {
    return Response.json(
      { ok: false, error: "Esta factura está anulada y no acepta pagos." },
      { status: 409 },
    );
  }
  if (factura.estado === "PAGADA") {
    return Response.json(
      { ok: false, error: "Esta factura ya está pagada." },
      { status: 409 },
    );
  }

  // Build the verification reason — includes any client notes for context
  const razonBase = "Pago reportado por cliente desde portal — verificar comprobante";
  const razonAnomalia = notas ? `${razonBase}. Nota: "${notas}"` : razonBase;

  try {
    const pago = await prisma.$transaction(async (tx) => {
      const created = await tx.pago.create({
        data: {
          facturaId,
          clienteId: cliente.id,
          monto,
          metodo,
          referencia,
          // ALWAYS pending verification + flagged so admin queue picks it up
          // and the existing CONFIRMAR flow applies the balance correctly.
          estado: "PENDIENTE_VERIFICACION",
          esAnomalo: true,
          razonAnomalia,
          registradoPorId: session.user!.id,
        },
        select: { id: true, monto: true, estado: true },
      });

      const firma = createHash("sha256")
        .update(`${session.user!.id}:REGISTRAR_PAGO:${created.id}:${facturaId}:${Date.now()}`)
        .digest("hex");

      await tx.logFacturacion.create({
        data: {
          usuarioId: session.user!.id!,
          accion: "REGISTRAR_PAGO",
          entidadTipo: "Pago",
          entidadId: created.id,
          facturaId,
          pagoId: created.id,
          datosDespues: {
            monto,
            metodo,
            referencia,
            origen: "PORTAL_CLIENTE",
            facturaNumero: factura.numero,
          },
          firmaDigital: firma,
        },
      });

      return created;
    });

    return Response.json({ ok: true, pago }, { status: 201 });
  } catch {
    return Response.json(
      { ok: false, error: "No se pudo registrar el pago. Intenta de nuevo." },
      { status: 503 },
    );
  }
}
