import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id: productoId } = await context.params;
  const body = await request.json().catch(() => null);

  const marca = (body?.marca ?? "").toString().trim().toUpperCase();
  const modelo = (body?.modelo ?? "").toString().trim();
  const anioDesde = parseInt(body?.anioDesde ?? "0", 10);
  // anioHasta defaults to anioDesde when not provided (single-year compat)
  const anioHasta = parseInt(body?.anioHasta ?? body?.anioDesde ?? "0", 10);
  const motor = (body?.motor ?? "").toString().trim();
  const sistema = (body?.sistema ?? "").toString().trim();

  if (!marca) return Response.json({ ok: false, error: "La marca es requerida" }, { status: 400 });
  if (!modelo) return Response.json({ ok: false, error: "El modelo es requerido" }, { status: 400 });
  if (!anioDesde || anioDesde < 1900 || anioDesde > 2100) {
    return Response.json({ ok: false, error: "Año desde no válido" }, { status: 400 });
  }
  if (!anioHasta || anioHasta < anioDesde || anioHasta > 2100) {
    return Response.json({ ok: false, error: "Año hasta debe ser ≥ año desde" }, { status: 400 });
  }

  const producto = await prisma.producto
    .findUnique({ where: { id: productoId }, select: { id: true } })
    .catch(() => null);
  if (!producto) {
    return Response.json({ ok: false, error: "Producto no encontrado" }, { status: 404 });
  }

  try {
    const compat = await prisma.productoCompatibilidad.create({
      data: {
        productoId,
        marca,
        modelo,
        anioDesde,
        anioHasta,
        motor: motor || null,
        sistema: sistema || null,
      },
      select: {
        id: true,
        marca: true,
        modelo: true,
        anioDesde: true,
        anioHasta: true,
        motor: true,
        sistema: true,
      },
    });
    return Response.json({ ok: true, compatibilidad: compat }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "No se pudo registrar la compatibilidad" }, { status: 503 });
  }
}
