import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

type Ctx = { params: Promise<{ id: string }> };

const TIPOS_VALIDOS = [
  "LLAMADA",
  "WHATSAPP",
  "EMAIL",
  "REUNION",
  "NOTA",
] as const;

type TipoValido = (typeof TIPOS_VALIDOS)[number];

function isTipoValido(v: unknown): v is TipoValido {
  return TIPOS_VALIDOS.includes(v as TipoValido);
}

export async function POST(request: Request, context: Ctx) {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: clienteId } = await context.params;
  const body = await request.json().catch(() => null);

  if (!isTipoValido(body?.tipo)) {
    return Response.json({ error: "Tipo de interacción inválido" }, { status: 400 });
  }

  if (!body?.descripcion?.trim()) {
    return Response.json({ error: "La descripción es requerida" }, { status: 400 });
  }

  if (!session.user?.id) {
    return Response.json({ error: "Sesión inválida" }, { status: 401 });
  }

  try {
    const interaccion = await prisma.interaccion.create({
      data: {
        clienteId,
        usuarioId: session.user.id,
        tipo: body.tipo,
        descripcion: (body.descripcion as string).trim(),
        resultado: body.resultado?.trim() || null,
      },
      select: {
        id: true,
        tipo: true,
        descripcion: true,
        resultado: true,
        fechaInteraccion: true,
      },
    });

    return Response.json({ ok: true, interaccion });
  } catch {
    return Response.json(
      { error: "No se pudo registrar la interacción" },
      { status: 503 },
    );
  }
}
