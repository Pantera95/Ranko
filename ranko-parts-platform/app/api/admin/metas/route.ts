import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

/**
 * GET /api/admin/metas
 * Lista todas las metas financieras activas.
 *
 * PUT /api/admin/metas
 * Bulk-upsert de metas. Body: { metas: [{ tipo, valor, notas? }, ...] }
 * Cada meta se identifica por su `tipo` (unique).
 */

const TIPOS_VALIDOS = [
  "REVENUE_MENSUAL",
  "REVENUE_ANUAL",
  "MARGEN_BRUTO_PCT",
  "UTILIDAD_NETA_MENSUAL",
  "GASTO_OPERATIVO_MAX",
  "TICKET_PROMEDIO_MIN",
  "TICKET_PROMEDIO_MAX",
  "TRANSACCIONES_MENSUAL_MIN",
] as const;
type TipoMeta = (typeof TIPOS_VALIDOS)[number];

export async function GET() {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  try {
    const metas = await prisma.metaFinanciera.findMany({ orderBy: { tipo: "asc" } });
    return Response.json({
      ok: true,
      metas: metas.map((m) => ({ ...m, valor: Number(m.valor) })),
    });
  } catch {
    return Response.json({ ok: true, metas: [] });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const items = Array.isArray(body?.metas) ? body.metas : [];

  if (items.length === 0) {
    return Response.json({ ok: false, error: "Lista de metas vacía" }, { status: 400 });
  }

  const validas = items.filter(
    (m: { tipo?: unknown; valor?: unknown }) =>
      typeof m.tipo === "string" &&
      TIPOS_VALIDOS.includes(m.tipo as TipoMeta) &&
      typeof m.valor === "number" &&
      Number.isFinite(m.valor) &&
      m.valor >= 0,
  );

  if (validas.length === 0) {
    return Response.json({ ok: false, error: "Ninguna meta válida" }, { status: 400 });
  }

  try {
    const out = await prisma.$transaction(
      validas.map((m: { tipo: TipoMeta; valor: number; notas?: string }) =>
        prisma.metaFinanciera.upsert({
          where: { tipo: m.tipo },
          create: { tipo: m.tipo, valor: m.valor, notas: m.notas ?? null, activa: true },
          update: { valor: m.valor, notas: m.notas ?? null, activa: true },
        }),
      ),
    );
    return Response.json({
      ok: true,
      metas: out.map((m) => ({ ...m, valor: Number(m.valor) })),
    });
  } catch (err) {
    console.error("[metas/PUT]", err);
    return Response.json({ ok: false, error: "No se pudo guardar" }, { status: 503 });
  }
}
