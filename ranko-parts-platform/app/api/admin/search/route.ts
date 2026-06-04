import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

export type SearchResultItem = {
  id: string;
  group: "Clientes" | "Productos" | "Cotizaciones" | "Facturas";
  label: string;
  sub: string;
  href: string;
};

export type SearchResponse = {
  results: SearchResultItem[];
  total: number;
};

const MAX_PER_GROUP = 4;

export async function GET(request: Request) {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ results: [], total: 0 }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return Response.json({ results: [], total: 0 });
  }

  try {
    const [clientes, productos, cotizaciones, facturas] = await Promise.all([
      // Clientes — search by nombre, empresa, telefono
      prisma.cliente.findMany({
        where: {
          OR: [
            { nombre: { contains: q, mode: "insensitive" } },
            { empresa: { contains: q, mode: "insensitive" } },
            { telefono: { contains: q } },
            { rif: { contains: q, mode: "insensitive" } },
          ],
          activo: true,
        },
        select: { id: true, nombre: true, empresa: true, tipo: true },
        take: MAX_PER_GROUP,
        orderBy: { scoring: "desc" },
      }),

      // Productos — search by nombre, sku, marca
      prisma.producto.findMany({
        where: {
          OR: [
            { nombre: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { marca: { contains: q, mode: "insensitive" } },
          ],
          activo: true,
        },
        select: { id: true, nombre: true, sku: true, marca: true, precio: true },
        take: MAX_PER_GROUP,
        orderBy: { destacado: "desc" },
      }),

      // Cotizaciones — search by numero, cliente nombre
      prisma.cotizacion.findMany({
        where: {
          OR: [
            { numero: { contains: q, mode: "insensitive" } },
            { cliente: { nombre: { contains: q, mode: "insensitive" } } },
            { cliente: { empresa: { contains: q, mode: "insensitive" } } },
          ],
        },
        select: {
          id: true,
          numero: true,
          estado: true,
          total: true,
          cliente: { select: { nombre: true } },
        },
        take: MAX_PER_GROUP,
        orderBy: { createdAt: "desc" },
      }),

      // Facturas — search by numero, cliente nombre
      prisma.factura.findMany({
        where: {
          OR: [
            { numero: { contains: q, mode: "insensitive" } },
            { cliente: { nombre: { contains: q, mode: "insensitive" } } },
            { cliente: { empresa: { contains: q, mode: "insensitive" } } },
          ],
          estado: { not: "ANULADA" },
        },
        select: {
          id: true,
          numero: true,
          estado: true,
          total: true,
          cliente: { select: { nombre: true } },
        },
        take: MAX_PER_GROUP,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const results: SearchResultItem[] = [
      ...clientes.map((c) => ({
        id: c.id,
        group: "Clientes" as const,
        label: c.nombre,
        sub: [c.empresa, c.tipo].filter(Boolean).join(" · "),
        href: `/admin/clientes/${c.id}`,
      })),
      ...productos.map((p) => ({
        id: p.id,
        group: "Productos" as const,
        label: p.nombre,
        sub: `${p.sku} · $${Number(p.precio).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        href: `/admin/catalogo/${p.id}`,
      })),
      ...cotizaciones.map((q) => ({
        id: q.id,
        group: "Cotizaciones" as const,
        label: q.numero,
        sub: `${q.cliente.nombre} · ${q.estado} · $${Number(q.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        href: `/admin/cotizaciones/${q.id}`,
      })),
      ...facturas.map((f) => ({
        id: f.id,
        group: "Facturas" as const,
        label: f.numero,
        sub: `${f.cliente.nombre} · ${f.estado} · $${Number(f.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        href: `/admin/facturacion/${f.id}`,
      })),
    ];

    return Response.json({ results, total: results.length });
  } catch {
    // DB unavailable — return empty results gracefully
    return Response.json({ results: [], total: 0 });
  }
}
