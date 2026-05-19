import { EstadoLead } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

type UpdateLeadStageContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: UpdateLeadStageContext) {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const estado = typeof body?.estado === "string" ? body.estado : "";

  if (!Object.values(EstadoLead).includes(estado as EstadoLead)) {
    return Response.json({ ok: false, error: "Etapa invalida" }, { status: 400 });
  }

  const nextEstado = estado as EstadoLead;

  try {
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        estado: nextEstado,
        fechaUltimoContacto: new Date(),
      },
      select: {
        id: true,
        estado: true,
      },
    });

    return Response.json({ ok: true, lead });
  } catch {
    return Response.json(
      { ok: false, error: "No se pudo actualizar el lead" },
      { status: 503 },
    );
  }
}
