"use client";

import { Eye, EyeOff, Globe, ShieldOff, Wifi } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  clienteId: string;
  portalActivo: boolean;
  portalEmail: string | null;
};

export function PortalAccesoPanel({ clienteId, portalActivo, portalEmail }: Props) {
  const router = useRouter();

  // Activation form state
  const [email, setEmail] = useState(portalEmail ?? "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Revoke state
  const [revoking, setRevoking] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const inputStyle = {
    border: "1px solid var(--border)",
    background: "var(--bg-input)",
    color: "var(--text-primary)",
  } as React.CSSProperties;

  async function handleActivar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/admin/clientes/${clienteId}/portal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({})) as { error?: string };
      setError(data.error ?? "No se pudo activar el portal.");
    }
  }

  async function handleRevocar() {
    setRevoking(true);
    setError("");

    const res = await fetch(`/api/admin/clientes/${clienteId}/portal`, {
      method: "DELETE",
    });

    setRevoking(false);
    setConfirmRevoke(false);

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({})) as { error?: string };
      setError(data.error ?? "No se pudo revocar el acceso.");
    }
  }

  return (
    <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
      {/* Header */}
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
      >
        <Globe size={13} style={{ color: "var(--color-gold)" }} />
        <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>
          Acceso al portal
        </p>
        {/* Status pill */}
        <span
          className="ml-auto rounded px-2 py-0.5 text-[10px] font-black uppercase"
          style={
            portalActivo
              ? { background: "color-mix(in srgb, #16a34a 15%, var(--bg-elevated))", color: "#16a34a", border: "1px solid #16a34a" }
              : { background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }
          }
        >
          {portalActivo ? "Activo" : "Sin acceso"}
        </span>
      </div>

      <div className="p-5">
        {/* ── Already active ── */}
        {portalActivo ? (
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <Wifi size={16} style={{ color: "#16a34a" }} />
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  Portal activado
                </p>
                <p className="mt-0.5 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  {portalEmail}
                </p>
              </div>
            </div>

            <p className="text-xs leading-5" style={{ color: "var(--text-muted)" }}>
              El cliente puede iniciar sesión en{" "}
              <code
                className="rounded px-1 font-mono"
                style={{ background: "var(--bg-elevated)", color: "var(--color-gold)" }}
              >
                /login/cliente
              </code>{" "}
              para ver facturas, pedidos, cotizaciones y referidos.
            </p>

            {error && (
              <p className="text-xs font-bold" style={{ color: "var(--color-danger)" }}>{error}</p>
            )}

            {!confirmRevoke ? (
              <button
                type="button"
                onClick={() => setConfirmRevoke(true)}
                className="inline-flex items-center gap-2 self-start px-3 py-2 text-xs font-bold uppercase transition hover:opacity-80"
                style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                <ShieldOff size={12} /> Revocar acceso
              </button>
            ) : (
              <div
                className="flex flex-wrap items-center gap-3 p-3"
                style={{ border: "1px solid var(--color-danger)", background: "color-mix(in srgb, var(--color-danger) 6%, var(--bg-elevated))" }}
              >
                <p className="flex-1 text-xs font-bold" style={{ color: "var(--color-danger)" }}>
                  ¿Confirmas revocar el acceso? El usuario quedará inactivo.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmRevoke(false)}
                    className="px-3 py-1.5 text-xs font-bold transition hover:opacity-80"
                    style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                    disabled={revoking}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleRevocar}
                    className="px-3 py-1.5 text-xs font-black uppercase text-white transition hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--color-danger)" }}
                    disabled={revoking}
                  >
                    {revoking ? "Revocando…" : "Sí, revocar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : success ? (
          /* ── Success state ── */
          <div className="grid gap-3 text-center">
            <Wifi size={28} className="mx-auto" style={{ color: "#16a34a" }} />
            <p className="font-black" style={{ color: "#16a34a" }}>¡Portal activado!</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              El cliente puede iniciar sesión con el email y contraseña indicados.
            </p>
          </div>
        ) : (
          /* ── Activation form ── */
          <form onSubmit={handleActivar} className="grid gap-4">
            <p className="text-xs leading-5" style={{ color: "var(--text-muted)" }}>
              Crea las credenciales de acceso al portal del cliente. Se creará una cuenta vinculada a este registro.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                Email de acceso
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@empresa.com"
                className="mt-2 h-10 w-full px-3 font-mono text-sm outline-none transition focus:border-[var(--color-gold)]"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                Contraseña temporal
              </label>
              <div className="relative mt-2">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mín. 8 caracteres"
                  className="h-10 w-full px-3 pr-10 text-sm outline-none transition focus:border-[var(--color-gold)]"
                  style={inputStyle}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                Comparte esta contraseña con el cliente. Podrá cambiarla desde su perfil.
              </p>
            </div>

            {error && (
              <p className="text-xs font-bold" style={{ color: "var(--color-danger)" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase text-black transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--color-gold)" }}
            >
              <Globe size={13} />
              {loading ? "Activando…" : "Activar portal"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
