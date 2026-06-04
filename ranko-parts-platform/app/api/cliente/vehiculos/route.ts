import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/cliente/vehiculos
 * Self-service vehicle registration from the client portal. Mirrors the
 * admin endpoint at /api/admin/clientes/[id]/vehiculos but the cliente is
 * always derived from the authenticated portal user — clients cannot add
 * vehicles to anyone else's fleet.
 *
 * Body: { marca, modelo, anio, motor?, color?, placa?, vin?, notas? }
 */
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  if (session.user.rol !== "CLIENTE") {
    return Response.json({ ok: false, error: "Solo disponible para clientes" }, { status: 403 });
  }

  const cliente = await prisma.cliente.findFirst({
    where: { usuarioPortalId: session.user.id },
    select: { id: true, activo: true, bloqueado: true },
  });

  if (!cliente) {
    return Response.json({ ok: false, error: "Perfil de cliente no encontrado" }, { status: 404 });
  }
  if (!cliente.activo || cliente.bloqueado) {
    return Response.json(
      { ok: false, error: "Tu cuenta no permite cambios. Contacta a tu vendedor." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);

  const marca = (body?.marca ?? "").toString().trim();
  const modelo = (body?.modelo ?? "").toString().trim();
  const anio = parseInt(body?.anio ?? "0", 10);
  const motor = (body?.motor ?? "").toString().trim();
  const color = (body?.color ?? "").toString().trim();
  const placa = (body?.placa ?? "").toString().trim().toUpperCase();
  const vin = (body?.vin ?? "").toString().trim().toUpperCase();
  const notas = (body?.notas ?? "").toString().trim().slice(0, 500);

  if (!marca) return Response.json({ ok: false, error: "La marca es requerida" }, { status: 400 });
  if (!modelo) return Response.json({ ok: false, error: "El modelo es requerido" }, { status: 400 });
  if (!anio || anio < 1900 || anio > 2100) {
    return Response.json({ ok: false, error: "El año no es válido" }, { status: 400 });
  }

  // Soft cap to prevent abuse: max 20 vehicles per cliente
  const count = await prisma.vehiculo.count({ where: { clienteId: cliente.id } });
  if (count >= 20) {
    return Response.json(
      { ok: false, error: "Llegaste al máximo de 20 vehículos. Contacta a tu vendedor para gestionar tu flota." },
      { status: 422 },
    );
  }

  try {
    const vehiculo = await prisma.vehiculo.create({
      data: {
        clienteId: cliente.id,
        marca,
        modelo,
        anio,
        motor: motor || null,
        color: color || null,
        placa: placa || null,
        vin: vin || null,
        notas: notas || null,
      },
      select: {
        id: true,
        marca: true,
        modelo: true,
        anio: true,
        motor: true,
        color: true,
        placa: true,
        vin: true,
        notas: true,
      },
    });

    return Response.json({ ok: true, vehiculo }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "No se pudo registrar el vehículo" }, { status: 503 });
  }
}
