import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id: clienteId } = await context.params;
  const body = await request.json().catch(() => null);

  const marca = (body?.marca ?? "").toString().trim();
  const modelo = (body?.modelo ?? "").toString().trim();
  const anioRaw = parseInt(body?.anio ?? "0", 10);
  const motor = (body?.motor ?? "").toString().trim();
  const color = (body?.color ?? "").toString().trim();
  const placa = (body?.placa ?? "").toString().trim().toUpperCase();
  const vin = (body?.vin ?? "").toString().trim().toUpperCase();
  const notas = (body?.notas ?? "").toString().trim();

  if (!marca) return Response.json({ ok: false, error: "La marca es requerida" }, { status: 400 });
  if (!modelo) return Response.json({ ok: false, error: "El modelo es requerido" }, { status: 400 });
  if (!anioRaw || anioRaw < 1900 || anioRaw > 2100) {
    return Response.json({ ok: false, error: "El año no es válido" }, { status: 400 });
  }

  // Make sure the cliente exists
  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId }, select: { id: true } }).catch(() => null);
  if (!cliente) {
    return Response.json({ ok: false, error: "Cliente no encontrado" }, { status: 404 });
  }

  try {
    const vehiculo = await prisma.vehiculo.create({
      data: {
        clienteId,
        marca,
        modelo,
        anio: anioRaw,
        motor: motor || null,
        color: color || null,
        placa: placa || null,
        vin: vin || null,
        notas: notas || null,
      },
      select: { id: true, marca: true, modelo: true, anio: true, motor: true, color: true, placa: true, vin: true, notas: true },
    });

    return Response.json({ ok: true, vehiculo }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "No se pudo registrar el vehículo" }, { status: 503 });
  }
}
