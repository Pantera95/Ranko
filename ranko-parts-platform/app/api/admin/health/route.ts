import { auth } from "@/auth";
import { esRolEquipo } from "@/lib/roles";

export async function GET() {
  const session = await auth();

  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  return Response.json({
    ok: true,
    area: "admin",
    rol: session.user.rol,
  });
}
