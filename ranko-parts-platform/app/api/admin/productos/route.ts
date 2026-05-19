import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  const sku: string = (body?.sku ?? "").trim().toUpperCase();
  const nombre: string = (body?.nombre ?? "").trim();
  const marca: string = (body?.marca ?? "").trim();
  const categoria: string = (body?.categoria ?? "").trim();
  const precio = Number(body?.precio ?? 0);
  const costo = Number(body?.costo ?? 0);

  if (!sku) return Response.json({ ok: false, error: "El SKU es requerido" }, { status: 400 });
  if (!nombre) return Response.json({ ok: false, error: "El nombre es requerido" }, { status: 400 });
  if (!marca) return Response.json({ ok: false, error: "La marca es requerida" }, { status: 400 });
  if (!categoria) return Response.json({ ok: false, error: "La categoría es requerida" }, { status: 400 });
  if (precio <= 0) return Response.json({ ok: false, error: "El precio debe ser mayor a 0" }, { status: 400 });

  // Generate unique slug
  const baseSlug = slugify(`${marca}-${nombre}-${sku}`);
  const exists = await prisma.producto.findFirst({ where: { slug: { startsWith: baseSlug } } });
  const slug = exists ? `${baseSlug}-${Date.now()}` : baseSlug;

  try {
    const product = await prisma.producto.create({
      data: {
        sku,
        nombre,
        marca,
        categoria,
        subcategoria: (body?.subcategoria ?? "").trim() || null,
        descripcion: (body?.descripcion ?? "").trim() || null,
        precio,
        costo,
        codigoOEM: (body?.codigoOEM ?? "").trim() || null,
        codigoAftermarket: (body?.codigoAftermarket ?? "").trim() || null,
        slug,
        activo: body?.activo !== false,
        destacado: body?.destacado === true,
        imagenes: [],
      },
      select: { id: true, sku: true, nombre: true },
    });

    return Response.json({ ok: true, product }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return Response.json({ ok: false, error: "El SKU ya existe en el catálogo" }, { status: 409 });
    }
    return Response.json({ ok: false, error: "No se pudo crear el producto" }, { status: 503 });
  }
}
