import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

type ClienteContext = {
  params: Promise<{ id: string }>;
};

const TIPOS_VALIDOS = ["MINORISTA", "TALLER", "DISTRIBUIDOR_LOCAL", "DISTRIBUIDOR_REGIONAL", "VIP"] as const;
const FUENTES_VALIDAS = ["ADS", "REFERIDO", "ORGANICO", "DIRECTO", "WHATSAPP", "TIENDA_WEB"] as const;
const TEMPERATURAS_VALIDAS = ["CALIENTE", "TIBIO", "FRIO"] as const;

export async function PATCH(request: Request, context: ClienteContext) {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const data: Record<string, unknown> = {};

  // Toggle flags
  if (typeof body?.activo === "boolean") data.activo = body.activo;
  if (typeof body?.bloqueado === "boolean") data.bloqueado = body.bloqueado;

  // Scoring
  if (typeof body?.scoring === "number" && body.scoring >= 0 && body.scoring <= 100) {
    data.scoring = body.scoring;
  }

  // Vendedor assignment (standalone or within editMode)
  if (body?.vendedorId !== undefined) {
    data.usuarioId = body.vendedorId === null || body.vendedorId === "" ? null : String(body.vendedorId);
  }

  // Codigo referido (standalone update)
  if (typeof body?.codigoReferido === "string") {
    const code = body.codigoReferido.trim().toUpperCase();
    if (code) data.codigoReferido = code;
  }

  // Full profile edit (sent when body.editMode === true)
  if (body?.editMode === true) {
    const nombre = (body?.nombre ?? "").toString().trim();
    const empresa = (body?.empresa ?? "").toString().trim();
    const tipo = (body?.tipo ?? "").toString().trim().toUpperCase();
    const telefono = (body?.telefono ?? "").toString().trim();
    const whatsapp = (body?.whatsapp ?? "").toString().trim();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const ciudad = (body?.ciudad ?? "").toString().trim();
    const rif = (body?.rif ?? "").toString().trim().toUpperCase();
    const fuente = (body?.fuente ?? "").toString().trim().toUpperCase();
    const temperatura = (body?.temperatura ?? "").toString().trim().toUpperCase();
    const condicionPago = (body?.condicionPago ?? "").toString().trim();
    const limiteCredito = Math.max(0, Number(body?.limiteCredito ?? 0));
    const notas = (body?.notas ?? "").toString().trim();

    if (!nombre) return Response.json({ ok: false, error: "El nombre es requerido" }, { status: 400 });
    if (!telefono) return Response.json({ ok: false, error: "El teléfono es requerido" }, { status: 400 });
    if (tipo && !TIPOS_VALIDOS.includes(tipo as typeof TIPOS_VALIDOS[number])) {
      return Response.json({ ok: false, error: "Tipo no válido" }, { status: 400 });
    }

    data.nombre = nombre;
    data.empresa = empresa || null;
    data.tipo = tipo as typeof TIPOS_VALIDOS[number];
    data.telefono = telefono;
    data.whatsapp = whatsapp || null;
    data.email = email || null;
    data.ciudad = ciudad || null;
    data.rif = rif || null;
    data.condicionPago = condicionPago || null;
    data.limiteCredito = limiteCredito;
    data.notas = notas || null;

    const codigoReferidoEdit = (body?.codigoReferido ?? "").toString().trim().toUpperCase();
    if (codigoReferidoEdit) data.codigoReferido = codigoReferidoEdit;

    if (fuente && FUENTES_VALIDAS.includes(fuente as typeof FUENTES_VALIDAS[number])) {
      data.fuente = fuente;
    }
    if (temperatura && TEMPERATURAS_VALIDAS.includes(temperatura as typeof TEMPERATURAS_VALIDAS[number])) {
      data.temperatura = temperatura;
    }
  }

  if (!Object.keys(data).length) {
    return Response.json({ ok: false, error: "Sin cambios válidos" }, { status: 400 });
  }

  try {
    const cliente = await prisma.cliente.update({
      where: { id },
      data,
      select: { id: true, activo: true, bloqueado: true, scoring: true, nombre: true },
    });

    return Response.json({ ok: true, cliente });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return Response.json({ ok: false, error: "El código de referido ya está en uso" }, { status: 409 });
    }
    return Response.json(
      { ok: false, error: "No se pudo actualizar el cliente" },
      { status: 503 },
    );
  }
}
