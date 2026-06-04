"use client";

import { AlertTriangle, CheckCircle2, ChevronRight, Truck, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type EstadoOrden = "CONFIRMADO" | "EN_PREPARACION" | "EN_CAMINO" | "ENTREGADO" | "CANCELADO";

const SIGUIENTE_LABEL: Partial<Record<EstadoOrden, string>> = {
  CONFIRMADO: "En preparación",
  EN_PREPARACION: "En camino",
  EN_CAMINO: "Entregado",
};

const SIGUIENTE_ICON: Partial<Record<EstadoOrden, React.ReactNode>> = {
  CONFIRMADO: <Truck size={14} />,
  EN_PREPARACION: <Truck size={14} />,
  EN_CAMINO: <CheckCircle2 size={14} />,
};

type Props = {
  ordenId: string;
  estado: EstadoOrden;
};

export function AvanzarOrdenPanel({ ordenId, estado }: Props) {
  const router = useRouter();
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelMode, setCancelMode] = useState(false);
  const [cancelNota, setCancelNota] = useState("");
  const [error, setError] = useState("");

  const siguienteLabel = SIGUIENTE_LABEL[estado];
  const siguienteIcon = SIGUIENTE_ICON[estado];
  const canAdvance = !!siguienteLabel;

  async function avanzar() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/ordenes/${ordenId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "AVANZAR", nota: nota.trim() }),
    });
    setLoading(false);
    if (res.ok) {
      setNota("");
      router.refresh();
    } else {
      const d = (await res.json()) as { error?: string };
      setError(d.error ?? "No se pudo avanzar la orden.");
    }
  }

  async function cancelar() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/ordenes/${ordenId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "CANCELAR", nota: cancelNota.trim() }),
    });
    setLoading(false);
    if (res.ok) {
      setCancelMode(false);
      setCancelNota("");
      router.refresh();
    } else {
      const d = (await res.json()) as { error?: string };
      setError(d.error ?? "No se pudo cancelar la orden.");
    }
  }

  // ── Cancel confirmation mode ────────────────────────────────────────────────
  if (cancelMode) {
    return (
      <div
        className="mt-4 p-4"
        style={{ border: "1px solid var(--color-danger)", background: "color-mix(in srgb, var(--color-danger) 5%, var(--bg-card))" }}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} style={{ color: "var(--color-danger)" }} />
          <p className="text-sm font-black uppercase" style={{ color: "var(--color-danger)" }}>
            Confirmar cancelación
          </p>
        </div>
        <p className="mt-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          Esta acción no se puede deshacer. La orden quedará en estado CANCELADO permanentemente.
        </p>
        <input
          type="text"
          value={cancelNota}
          onChange={(e) => setCancelNota(e.target.value)}
          placeholder="Motivo de cancelación (recomendado)"
          className="mt-3 h-10 w-full px-3 text-sm outline-none"
          style={{ border: "1px solid var(--color-danger)", background: "var(--bg-input)", color: "var(--text-primary)" }}
        />
        {error && (
          <p className="mt-2 text-xs font-bold" style={{ color: "var(--color-danger)" }}>{error}</p>
        )}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => { setCancelMode(false); setError(""); }}
            className="flex-1 py-2 text-xs font-bold uppercase transition hover:opacity-80"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Volver
          </button>
          <button
            type="button"
            onClick={cancelar}
            disabled={loading}
            className="flex-1 py-2 text-xs font-black uppercase text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--color-danger)" }}
          >
            {loading ? "Cancelando…" : "Sí, cancelar orden"}
          </button>
        </div>
      </div>
    );
  }

  // ── Normal advance panel ────────────────────────────────────────────────────
  return (
    <div
      className="mt-4 p-4"
      style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
    >
      <p className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
        Gestionar estado
      </p>

      {canAdvance && (
        <>
          <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <ChevronRight size={14} style={{ color: "var(--color-gold)" }} />
            Próximo estado:{" "}
            <span className="font-black uppercase" style={{ color: "var(--text-primary)" }}>
              {siguienteLabel}
            </span>
          </div>

          <input
            type="text"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Nota interna (opcional)"
            className="mt-3 h-10 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]"
            style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
          />
        </>
      )}

      {error && (
        <p className="mt-2 text-xs font-bold" style={{ color: "var(--color-danger)" }}>{error}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {canAdvance && (
          <button
            type="button"
            onClick={avanzar}
            disabled={loading}
            className="inline-flex flex-1 items-center justify-center gap-2 py-2.5 text-xs font-black uppercase text-black transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--color-gold)" }}
          >
            {siguienteIcon}
            {loading ? "Avanzando…" : `Avanzar a ${siguienteLabel}`}
          </button>
        )}
        <button
          type="button"
          onClick={() => { setCancelMode(true); setError(""); }}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase transition hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:opacity-50"
          style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          <XCircle size={13} /> Cancelar orden
        </button>
      </div>
    </div>
  );
}
