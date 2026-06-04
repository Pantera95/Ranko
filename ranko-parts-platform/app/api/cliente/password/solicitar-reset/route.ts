import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/cliente/password/solicitar-reset
 * Public endpoint — a client whose portal password was forgotten asks the
 * Ranko team to reset it. We don't email anything (no transactional email
 * pipeline yet); instead we log the request as an Interaccion on the cliente
 * timeline so the assigned vendedor sees it and can reset via the admin UI.
 *
 * Security:
 *   - Always returns 200 with the same body whether or not the email matches a
 *     real account. Prevents email enumeration.
 *   - Rate-limited per IP to prevent abuse / log spam.
 *   - Body capped at trivial size; only `email` is read.
 */
export async function POST(request: Request) {
  // Per-IP rate limit: 4 requests per 10 minutes
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  const rl = checkRateLimit(`reset:${ip}`, 4, 10 * 60_000);
  if (!rl.allowed) {
    return Response.json(
      { ok: false, error: "Demasiadas solicitudes. Intenta más tarde." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const email = (body?.email ?? "").toString().trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, error: "Email no válido" }, { status: 400 });
  }

  // Generic success body — returned regardless of whether the account exists.
  const okResponse = Response.json({
    ok: true,
    message:
      "Si el email está registrado, tu vendedor recibirá la solicitud y se comunicará contigo para restablecer la contraseña.",
  });

  try {
    // Look up the CLIENTE Usuario by email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: { id: true, rol: true, activo: true },
    });

    // Silently no-op for any of these — don't leak existence
    if (!usuario || usuario.rol !== "CLIENTE" || !usuario.activo) {
      return okResponse;
    }

    // Find the cliente record linked to this portal user
    const cliente = await prisma.cliente.findFirst({
      where: { usuarioPortalId: usuario.id },
      select: { id: true, usuarioId: true, activo: true, bloqueado: true },
    });
    if (!cliente || !cliente.activo || cliente.bloqueado) {
      return okResponse;
    }

    // Attribute the interaction to the assigned vendedor when present;
    // otherwise to the portal user themselves so the FK is satisfied.
    const usuarioIdParaInteraccion = cliente.usuarioId ?? usuario.id;

    await prisma.interaccion.create({
      data: {
        clienteId: cliente.id,
        usuarioId: usuarioIdParaInteraccion,
        tipo: "NOTA",
        descripcion: `Cliente solicitó restablecer su contraseña del portal desde ${email}. Reenvíale una nueva contraseña desde Usuarios → reset.`,
        resultado: "Pendiente de acción del equipo",
      },
    });

    return okResponse;
  } catch {
    // Failure path — still return success to avoid leaking infra issues, but
    // log server-side so the team notices the pattern.
    console.warn("[solicitar-reset] error processing request", { email });
    return okResponse;
  }
}
