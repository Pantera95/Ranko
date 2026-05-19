import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { esRolEquipo } from "@/lib/roles";
import { dispatchMensaje } from "@/lib/automation";

const Schema = z.object({
  plantillaId: z.string().min(1),
  canal: z.enum(["WHATSAPP", "EMAIL", "INTERNO"]),
  destinatario: z.string().min(3),
  variables: z.record(z.string(), z.string()).default({}),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !esRolEquipo(session.user?.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body: unknown = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const result = await dispatchMensaje(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
