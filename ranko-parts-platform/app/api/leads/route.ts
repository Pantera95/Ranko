import { FuenteCliente, TipoCliente } from "@prisma/client";

import { prisma } from "@/lib/db";
import { publicLeadSchema } from "@/lib/lead-validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const rateLimit = checkRateLimit(`public-lead:${ip}`);

  if (!rateLimit.allowed) {
    return Response.json(
      {
        ok: false,
        error: "Demasiadas solicitudes. Intenta de nuevo en un minuto.",
      },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = publicLeadSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: "Datos invalidos",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    return Response.json({ ok: true, status: "received" });
  }

  try {
    const lead = await createPublicLead(parsed.data);

    return Response.json(
      {
        ok: true,
        leadId: lead.id,
        clienteId: lead.clienteId,
        status: "created",
      },
      { status: 201 },
    );
  } catch {
    return Response.json(
      {
        ok: false,
        error: "Base de datos no disponible. Usa WhatsApp para enviar la solicitud.",
        whatsapp: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "584147903498"}`,
      },
      { status: 503 },
    );
  }
}

async function createPublicLead(data: {
  nombre: string;
  empresa?: string;
  tipo: keyof typeof TipoCliente;
  telefono: string;
  whatsapp?: string;
  email?: string;
  ciudad?: string;
  vehiculoMarca?: string;
  vehiculoModelo?: string;
  vehiculoAnio?: string;
  interes: string;
  canal: "B2B" | "CONTACTO" | "TIENDA";
}) {
  const vendedor = await prisma.usuario.findFirst({
    where: {
      activo: true,
      rol: { in: ["VENDEDOR", "ADMIN", "MASTER_ADMIN"] },
    },
    orderBy: { createdAt: "asc" },
  });

  const fuente = data.canal === "TIENDA" ? FuenteCliente.TIENDA_WEB : FuenteCliente.DIRECTO;
  const tipo = data.tipo as TipoCliente;
  const existing = await prisma.cliente.findFirst({
    where: {
      OR: [
        { telefono: data.telefono },
        ...(data.whatsapp ? [{ whatsapp: data.whatsapp }] : []),
        ...(data.email ? [{ email: data.email }] : []),
      ],
    },
  });

  const notas = [
    `Solicitud publica ${data.canal}`,
    `Interes: ${data.interes}`,
    data.vehiculoMarca || data.vehiculoModelo || data.vehiculoAnio
      ? `Vehiculo: ${[data.vehiculoMarca, data.vehiculoModelo, data.vehiculoAnio]
          .filter(Boolean)
          .join(" ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const cliente = existing
    ? await prisma.cliente.update({
        where: { id: existing.id },
        data: {
          nombre: data.nombre,
          empresa: data.empresa || existing.empresa,
          tipo,
          telefono: data.telefono,
          whatsapp: data.whatsapp || data.telefono,
          email: data.email || existing.email,
          ciudad: data.ciudad || existing.ciudad,
          fuente,
          notas,
          usuarioId: existing.usuarioId ?? vendedor?.id,
        },
      })
    : await prisma.cliente.create({
        data: {
          nombre: data.nombre,
          empresa: data.empresa || undefined,
          tipo,
          telefono: data.telefono,
          whatsapp: data.whatsapp || data.telefono,
          email: data.email || undefined,
          ciudad: data.ciudad || undefined,
          fuente,
          notas,
          usuarioId: vendedor?.id,
        },
      });

  return prisma.lead.create({
    data: {
      clienteId: cliente.id,
      ...(vendedor?.id ? { usuarioId: vendedor.id } : {}),
      productosInteresados: [data.interes],
      notas,
      pipeline: data.canal,
      probabilidad: data.canal === "B2B" ? 45 : 30,
    },
  });
}
