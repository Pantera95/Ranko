"use client";

import { Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { clienteId: string; bloqueado: boolean };

export function BloquearButton({ clienteId, bloqueado }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/clientes/${clienteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bloqueado: !bloqueado }),
    });
    setLoading(false);
    router.refresh();
  }

  if (bloqueado) {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        title="Haz clic para desbloquear al cliente"
        className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition hover:opacity-80 disabled:opacity-50"
        style={{
          background: "color-mix(in srgb, var(--color-danger) 10%, var(--bg-card))",
          border: "1px solid var(--color-danger)",
          color: "var(--color-danger)",
        }}
      >
        <Ban size={12} />
        {loading ? "Actualizando…" : "Bloqueado — Desbloquear"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      title="Bloquear cliente comercialmente"
      className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:opacity-50"
      style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
    >
      <Ban size={12} />
      {loading ? "Actualizando…" : "Bloquear"}
    </button>
  );
}
