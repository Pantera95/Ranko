"use client";

import { AlertTriangle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { facturaId: string; estado: string };

export function AnularFacturaButton({ facturaId, estado }: Props) {
  const router = useRouter();
  const [confirmMode, setConfirmMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canAnular = estado !== "ANULADA" && estado !== "PAGADA";

  if (!canAnular) return null;

  async function anular() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/facturas/${facturaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "ANULAR" }),
    });
    setLoading(false);
    if (res.ok) {
      setConfirmMode(false);
      router.refresh();
    } else {
      const d = (await res.json()) as { error?: string };
      setError(d.error ?? "No se pudo anular la factura.");
    }
  }

  if (confirmMode) {
    return (
      <div
        className="flex flex-col gap-3 p-4"
        style={{
          border: "1px solid var(--color-danger)",
          background: "color-mix(in srgb, var(--color-danger) 5%, var(--bg-card))",
        }}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} style={{ color: "var(--color-danger)" }} />
          <p className="text-xs font-black uppercase" style={{ color: "var(--color-danger)" }}>
            ¿Anular esta factura?
          </p>
        </div>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Esta acción es irreversible. La factura quedará marcada como <strong>ANULADA</strong>{" "}
          y no podrá recibir pagos.
        </p>
        {error && (
          <p className="text-xs font-bold" style={{ color: "var(--color-danger)" }}>
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setConfirmMode(false); setError(""); }}
            className="flex-1 py-2 text-xs font-bold uppercase transition hover:opacity-80"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Volver
          </button>
          <button
            type="button"
            onClick={anular}
            disabled={loading}
            className="flex-1 py-2 text-xs font-black uppercase text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--color-danger)" }}
          >
            {loading ? "Anulando…" : "Sí, anular"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirmMode(true)}
      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase transition hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
      style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
    >
      <XCircle size={13} /> Anular factura
    </button>
  );
}
