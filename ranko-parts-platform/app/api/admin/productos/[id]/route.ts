import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

type UpdateProductContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: UpdateProductContext) {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const product = await prisma.producto.findUnique({
      where: { id },
      include: {
        compatibilidades: { orderBy: [{ marca: "asc" }, { modelo: "asc" }, { anioDesde: "asc" }] },
        inventarios: {
          include: { almacen: { select: { id: true, nombre: true, ciudad: true } } },
          orderBy: { almacen: { nombre: "asc" } },
        },
      },
    });

    if (!product) return Response.json({ error: "Producto no encontrado" }, { status: 404 });

    return Response.json({
      ...product,
      precio: Number(product.precio),
      costo: Number(product.costo),
    });
  } catch {
    return Response.json({ error: "No se pudo cargar el producto" }, { status: 503 });
  }
}

export async function PATCH(request: Request, context: UpdateProductContext) {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  type PatchData = {
    activo?: boolean;
    destacado?: boolean;
    nombre?: string;
    descripcion?: string | null;
    precio?: number;
    costo?: number;
    categoria?: string;
    subcategoria?: string | null;
    marca?: string;
    codigoOEM?: string | null;
    codigoAftermarket?: string | null;
    imagenes?: string[];
  };

  const data: PatchData = {};

  if (typeof body?.activo === "boolean") data.activo = body.activo;
  if (typeof body?.destacado === "boolean") data.destacado = body.destacado;
  if (typeof body?.nombre === "string" && body.nombre.trim()) data.nombre = body.nombre.trim();
  if (typeof body?.descripcion === "string") data.descripcion = body.descripcion.trim() || null;
  if (typeof body?.precio === "number" && body.precio > 0) data.precio = body.precio;
  if (typeof body?.costo === "number" && body.costo >= 0) data.costo = body.costo;
  if (typeof body?.categoria === "string" && body.categoria.trim()) data.categoria = body.categoria.trim();
  if (typeof body?.subcategoria === "string") data.subcategoria = body.subcategoria.trim() || null;
  if (typeof body?.marca === "string" && body.marca.trim()) data.marca = body.marca.trim();
  if (typeof body?.codigoOEM === "string") data.codigoOEM = body.codigoOEM.trim() || null;
  if (typeof body?.codigoAftermarket === "string") data.codigoAftermarket = body.codigoAftermarket.trim() || null;

  // Image URLs — accept a complete array (replace semantics, not patch-merge).
  // Validates each entry is a non-empty http(s) URL and dedupes while preserving
  // the caller's order (first occurrence wins).
  if (Array.isArray(body?.imagenes)) {
    const seen = new Set<string>();
    const cleaned: string[] = [];
    for (const raw of body.imagenes as unknown[]) {
      if (typeof raw !== "string") continue;
      const url = raw.trim();
      if (!url || seen.has(url)) continue;
      if (!/^https?:\/\/\S+$/i.test(url)) {
        return Response.json(
          { ok: false, error: `URL de imagen inválida: ${url.slice(0, 60)}` },
          { status: 400 },
        );
      }
      seen.add(url);
      cleaned.push(url);
    }
    if (cleaned.length > 12) {
      return Response.json(
        { ok: false, error: "Máximo 12 imágenes por producto" },
        { status: 400 },
      );
    }
    data.imagenes = cleaned;
  }

  if (!Object.keys(data).length) {
    return Response.json({ ok: false, error: "Sin cambios válidos" }, { status: 400 });
  }

  try {
    const product = await prisma.producto.update({
      where: { id },
      data,
      select: {
        id: true,
        nombre: true,
        precio: true,
        costo: true,
        activo: true,
        destacado: true,
        categoria: true,
        subcategoria: true,
        marca: true,
        descripcion: true,
        codigoOEM: true,
        codigoAftermarket: true,
        imagenes: true,
      },
    });

    return Response.json({
      ok: true,
      product: { ...product, precio: Number(product.precio), costo: Number(product.costo) },
    });
  } catch {
    return Response.json({ ok: false, error: "No se pudo actualizar el producto" }, { status: 503 });
  }
}
