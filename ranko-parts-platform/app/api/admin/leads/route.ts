import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

const TIPO_CLIENTE_VALIDOS = ["MINORISTA", "TALLER", "DISTRIBUIDOR_LOCAL", "DISTRIBUIDOR_REGIONAL", "VIP"] as const;
const FUENTE_VALIDAS = ["ADS", "REFERIDO", "ORGANICO", "DIRECTO", "WHATSAPP", "TIENDA_WEB"] as const;
const TEMPERATURA_VALIDAS = ["CALIENTE", "TIBIO", "FRIO"] as const;

export async function POST(request: Request) {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";
  const telefono = typeof body?.telefono === "string" ? body.telefono.trim() : "";
  const empresa = typeof body?.empresa === "string" ? body.empresa.trim() || null : null;
  const ciudad = typeof body?.ciudad === "string" ? body.ciudad.trim() || null : null;
  const tipo = TIPO_CLIENTE_VALIDOS.includes(body?.tipo) ? body.tipo : "MINORISTA";
  const fuente = FUENTE_VALIDAS.includes(body?.fuente) ? body.fuente : "DIRECTO";
  const temperatura = TEMPERATURA_VALIDAS.includes(body?.temperatura) ? body.temperatura : "CALIENTE";
  const valorEstimado = typeof body?.valorEstimado === "number" && body.valorEstimado > 0
    ? body.valorEstimado
    : null;
  const productosInteresados: string[] = Array.isArray(body?.productosInteresados)
    ? body.productosInteresados.filter((p: unknown) => typeof p === "string" && p.trim()).map((p: string) => p.trim())
    : [];
  const notas = typeof body?.notas === "string" ? body.notas.trim() || null : null;

  if (!nombre || !telefono) {
    return Response.json({ ok: false, error: "Nombre y teléfono son obligatorios." }, { status: 400 });
  }

  try {
    // Try to find existing client by telefono; create if not found.
    // For existing clientes we are intentionally conservative: the cliente
    // record is authoritative and shouldn't be silently rewritten by lead
    // capture. We only fill in fields that are still blank, and we update
    // temperatura (which tracks current buying intent, not customer identity).
    let cliente = await prisma.cliente.findFirst({ where: { telefono } });

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          nombre,
          telefono,
          empresa,
          ciudad,
          tipo,
          fuente,
          temperatura,
          usuarioId: session.user?.id ?? null,
        },
      });
    } else {
      cliente = await prisma.cliente.update({
        where: { id: cliente.id },
        data: {
          // Preserve nombre/empresa/ciudad unless the existing value is blank
          ...(cliente.nombre ? {} : { nombre }),
          ...(cliente.empresa ? {} : empresa ? { empresa } : {}),
          ...(cliente.ciudad ? {} : ciudad ? { ciudad } : {}),
          // Fresh lead activity always updates the buying-intent signal
          temperatura,
        },
      });
    }

    const lead = await prisma.lead.create({
      data: {
        clienteId: cliente.id,
        usuarioId: session.user?.id ?? null,
        temperatura,
        valorEstimado,
        productosInteresados,
        notas,
        estado: "NUEVO",
        pipeline: "Principal",
      },
    });

    return Response.json({ ok: true, lead, clienteId: cliente.id }, { status: 201 });
  } catch (e: unknown) {
    console.error("Error creando lead:", e);
    return Response.json({ ok: false, error: "No se pudo crear el lead." }, { status: 500 });
  }
}
