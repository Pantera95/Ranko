import { createHash } from "crypto";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

/**
 * POST /api/cliente/cotizaciones/[id]/responder
 * Client-portal endpoint for accepting/rejecting a cotización without going
 * through the vendor. Mirrors the admin estado-change flow but with strict
 * ownership and state guards.
 *
 * Body: { accion: "ACEPTAR" | "RECHAZAR", notas?: string }
 *
 * Allowed only when:
 *   - rol === "CLIENTE"
 *   - cotización.clienteId === the cliente bound to this portal user
 *   - cotización.estado ∈ {ENVIADA, BORRADOR}
 *   - cotización.convertidaAFactura === false (defensive — should be implied
 *     by the estado check, but explicit guard keeps invariants tight)
 *
 * Side effects (transactional):
 *   - cotización.estado → ACEPTADA or RECHAZADA
 *   - new Interaccion log on the cliente timeline so the vendor sees it
 *   - audit entry in logFacturacion
 */
export async function POST(request: Request, context: Context) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  if (session.user.rol !== "CLIENTE") {
    return Response.json({ ok: false, error: "Solo disponible para clientes" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const accion: string = (body?.accion ?? "").toString().toUpperCase();
  const notasCliente: string = (body?.notas ?? "").toString().trim().slice(0, 500);

  if (accion !== "ACEPTAR" && accion !== "RECHAZAR") {
    return Response.json(
      { ok: false, error: 'Acción no válida. Usa "ACEPTAR" o "RECHAZAR".' },
      { status: 400 },
    );
  }

  // Resolve the cliente bound to this portal user
  const cliente = await prisma.cliente.findFirst({
    where: { usuarioPortalId: session.user.id },
    select: { id: true, nombre: true, bloqueado: true, activo: true, usuarioId: true },
  });

  if (!cliente) {
    return Response.json({ ok: false, error: "Perfil de cliente no encontrado" }, { status: 404 });
  }
  if (!cliente.activo || cliente.bloqueado) {
    return Response.json(
      { ok: false, error: "Tu cuenta no permite esta acción. Contacta a tu vendedor." },
      { status: 403 },
    );
  }

  // Verify ownership + state
  const cot = await prisma.cotizacion.findUnique({
    where: { id },
    select: { id: true, clienteId: true, estado: true, numero: true, convertidaAFactura: true },
  });

  if (!cot || cot.clienteId !== cliente.id) {
    // Return 404 to avoid leaking existence of other clients' quotes
    return Response.json({ ok: false, error: "Cotización no encontrada" }, { status: 404 });
  }

  if (cot.convertidaAFactura) {
    return Response.json(
      { ok: false, error: "Esta cotización ya fue facturada y no puede modificarse." },
      { status: 409 },
    );
  }

  if (cot.estado !== "ENVIADA" && cot.estado !== "BORRADOR") {
    return Response.json(
      { ok: false, error: `Esta cotización está en estado ${cot.estado} y no acepta respuesta.` },
      { status: 409 },
    );
  }

  const nuevoEstado = accion === "ACEPTAR" ? "ACEPTADA" : "RECHAZADA";
  const descripcionInteraccion =
    accion === "ACEPTAR"
      ? `Cliente ${cliente.nombre} aceptó la cotización ${cot.numero} desde el portal.`
      : `Cliente ${cliente.nombre} rechazó la cotización ${cot.numero} desde el portal.`;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.cotizacion.update({
        where: { id },
        data: { estado: nuevoEstado },
        select: { id: true, estado: true, numero: true },
      });

      // Log on the cliente timeline so the vendor sees the response. We tie it
      // to the assigned vendedor (cliente.usuarioId); if there isn't one, we
      // fall back to the portal user so the FK still resolves.
      const usuarioParaInteraccion = cliente.usuarioId ?? session.user!.id!;
      await tx.interaccion.create({
        data: {
          clienteId: cliente.id,
          usuarioId: usuarioParaInteraccion,
          tipo: "NOTA",
          descripcion: notasCliente
            ? `${descripcionInteraccion} Notas del cliente: "${notasCliente}"`
            : descripcionInteraccion,
          resultado: accion === "ACEPTAR" ? "Aceptada" : "Rechazada",
        },
      });

      const firma = createHash("sha256")
        .update(`${session.user!.id}:RESPUESTA_CLIENTE:${id}:${Date.now()}`)
        .digest("hex");

      await tx.logFacturacion.create({
        data: {
          usuarioId: session.user!.id!,
          accion: "MODIFICAR_COTIZACION",
          entidadTipo: "Cotizacion",
          entidadId: id,
          cotizacionId: id,
          datosAntes: { estado: cot.estado },
          datosDespues: { estado: nuevoEstado, origen: "PORTAL_CLIENTE" },
          firmaDigital: firma,
        },
      });

      return result;
    });

    return Response.json({ ok: true, cotizacion: updated });
  } catch {
    return Response.json(
      { ok: false, error: "No se pudo registrar la respuesta. Intenta de nuevo." },
      { status: 503 },
    );
  }
}
