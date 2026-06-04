"use client";

import { KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const inputStyle: React.CSSProperties = {
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: 6,
};

export function SolicitarResetForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/cliente/password/solicitar-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const json = await res.json();
      if (res.status === 429) {
        setError(json.error ?? "Demasiadas solicitudes. Intenta más tarde.");
        return;
      }
      if (!res.ok) {
        setError(json.error ?? "No se pudo procesar la solicitud");
        return;
      }
      setDone(json.message ?? "Solicitud enviada.");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="grid gap-4">
        <div
          className="p-4 text-sm"
          style={{
            border: "1px solid var(--color-success)",
            background: "var(--bg-elevated)",
            color: "var(--color-success)",
          }}
        >
          ✓ {done}
        </div>
        <Link
          href="/login/cliente"
          className="text-center text-xs font-bold uppercase tracking-widest hover:opacity-80"
          style={{ color: "var(--color-gold)" }}
        >
          ← Volver al login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
          Email registrado
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full rounded px-3 py-2 text-sm"
          style={inputStyle}
          autoFocus
        />
      </div>

      {error && (
        <p className="text-xs font-bold" style={{ color: "var(--color-danger)" }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || !email.trim()}
        className="inline-flex items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-black uppercase text-black disabled:opacity-50"
        style={{ background: "var(--color-gold)" }}
      >
        {submitting ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
        Solicitar reset
      </button>

      <p className="text-xs leading-5" style={{ color: "var(--text-muted)" }}>
        Por seguridad, no confirmamos si tu email está registrado. Tu vendedor te
        contactará para entregarte una nueva contraseña.
      </p>

      <Link
        href="/login/cliente"
        className="text-center text-xs font-bold uppercase tracking-widest hover:opacity-80"
        style={{ color: "var(--text-muted)" }}
      >
        ← Volver al login
      </Link>
    </form>
  );
}
