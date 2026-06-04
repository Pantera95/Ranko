"use client";

import { CheckCircle, Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";

export function CambiarPasswordForm() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputStyle = {
    border: "1px solid var(--border)",
    background: "var(--bg-input)",
    color: "var(--text-primary)",
  } as React.CSSProperties;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (nueva !== confirmar) {
      setError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/cliente/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actual, nueva, confirmar }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setActual("");
      setNueva("");
      setConfirmar("");
    } else {
      const data = await res.json().catch(() => ({})) as { error?: string };
      setError(data.error ?? "No se pudo cambiar la contraseña.");
    }
  }

  if (success) {
    return (
      <div className="flex items-center gap-3 p-5">
        <CheckCircle size={20} style={{ color: "var(--color-success)" }} />
        <div>
          <p className="font-bold" style={{ color: "var(--color-success)" }}>
            Contraseña actualizada
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            Tu nueva contraseña está activa desde ahora.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="ml-auto text-xs font-bold transition hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
        >
          Cambiar de nuevo
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 p-5">
      {/* Current password */}
      <div>
        <label
          className="block text-xs font-bold uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Contraseña actual
        </label>
        <div className="relative mt-2">
          <input
            type={showActual ? "text" : "password"}
            required
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            className="h-10 w-full px-3 pr-10 text-sm outline-none transition focus:border-[var(--color-gold)]"
            style={inputStyle}
            autoComplete="current-password"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowActual((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          >
            {showActual ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* New password */}
      <div>
        <label
          className="block text-xs font-bold uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Nueva contraseña
        </label>
        <div className="relative mt-2">
          <input
            type={showNueva ? "text" : "password"}
            required
            minLength={8}
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            placeholder="Mín. 8 caracteres"
            className="h-10 w-full px-3 pr-10 text-sm outline-none transition focus:border-[var(--color-gold)]"
            style={inputStyle}
            autoComplete="new-password"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowNueva((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          >
            {showNueva ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* Confirm */}
      <div>
        <label
          className="block text-xs font-bold uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Confirmar nueva contraseña
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          className="mt-2 h-10 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]"
          style={{
            ...inputStyle,
            borderColor:
              confirmar && nueva && confirmar !== nueva
                ? "var(--color-danger)"
                : "var(--border)",
          }}
          autoComplete="new-password"
        />
        {confirmar && nueva && confirmar !== nueva ? (
          <p className="mt-1 text-[10px] font-bold" style={{ color: "var(--color-danger)" }}>
            Las contraseñas no coinciden
          </p>
        ) : null}
      </div>

      {error && (
        <p className="text-xs font-bold" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase text-black transition hover:opacity-90 disabled:opacity-50"
        style={{ background: "var(--color-gold)" }}
      >
        <KeyRound size={13} />
        {loading ? "Actualizando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
