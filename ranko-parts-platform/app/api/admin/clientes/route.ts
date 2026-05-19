import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

const TIPOS_VALIDOS = ["MINORISTA", "TALLER", "DISTRIBUIDOR_LOCAL", "DISTRIBUIDOR_REGIONAL", "VIP"] as const;
const FUENTES_VALIDAS = ["ADS", "REFERIDO", "ORGANICO", "DIRECTO", "WHATSAPP", "TIENDA_WEB"] as const;

type TipoCliente = (typeof TIPOS_VALIDOS)[number];
type FuenteCliente = (typeof FUENTES_VALIDAS)[number];

export async function POST(request: Request) {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  const nombre: string = (body?.nombre ?? "").trim();
  const empresa: string = (body?.empresa ?? "").trim();
  const tipo: string = (body?.tipo ?? "MINORISTA").trim().toUpperCase();
  const telefono: string = (body?.telefono ?? "").trim();
  const whatsapp: string = (body?.whatsapp ?? "").trim();
  const email: string = (body?.email ?? "").trim().toLowerCase();
  const ciudad: string = (body?.ciudad ?? "").trim();
  const rif: string = (body?.rif ?? "").trim().toUpperCase();
  const fuente: string = (body?.fuente ?? "DIRECTO").trim().toUpperCase();
  const condicionPago: string = (body?.condicionPago ?? "").trim();
  const limiteCredito = Math.max(0, Number(body?.limiteCredito ?? 0));
  const notas: string = (body?.notas ?? "").trim();

  // Validation
  if (!nombre) return Response.json({ ok: false, error: "El nombre es requerido" }, { status: 400 });
  if (!telefono) return Response.json({ ok: false, error: "El teléfono es requerido" }, { status: 400 });
  if (!TIPOS_VALIDOS.includes(tipo as TipoCliente)) {
    return Response.json({ ok: false, error: "Tipo de cliente no válido" }, { status: 400 });
  }
  if (!FUENTES_VALIDAS.includes(fuente as FuenteCliente)) {
    return Response.json({ ok: false, error: "Fuente no válida" }, { status: 400 });
  }

  try {
    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        empresa: empresa || null,
        tipo: tipo as TipoCliente,
        telefono,
        whatsapp: whatsapp || null,
        email: email || null,
        ciudad: ciudad || null,
        rif: rif || null,
        fuente: fuente as FuenteCliente,
        condicionPago: condicionPago || null,
        limiteCredito,
        notas: notas || null,
        scoring: 50,
        activo: true,
        bloqueado: false,
      },
      select: { id: true, nombre: true, tipo: true },
    });

    return Response.json({ ok: true, cliente }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return Response.json({ ok: false, error: "Ya existe un cliente con ese RIF o código" }, { status: 409 });
    }
    return Response.json({ ok: false, error: "No se pudo crear el cliente" }, { status: 500 });
  }
}
