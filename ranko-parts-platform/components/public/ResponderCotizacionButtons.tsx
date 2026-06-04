"use client";

import { Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  cotizacionId: string;
  numero: string;
};

export function ResponderCotizacionButtons({ cotizacionId, numero }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "ACEPTAR" | "RECHAZAR">(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | "ACEPTADA" | "RECHAZADA">(null);

  async function respond(accion: "ACEPTAR" | "RECHAZAR") {
    const confirmMsg =
      accion === "ACEPTAR"
        ? `¿Confirmas que aceptas la cotización ${numero}? Tu vendedor procederá con la factura.`
        : `¿Confirmas que rechazas la cotización ${numero}?`;
    if (!confirm(confirmMsg)) return;

    setBusy(accion);
    setError(null);
    try {
      const res = await fetch(`/api/cliente/cotizaciones/${cotizacionId}/responder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "No se pudo registrar la respuesta");
        return;
      }
      setDone(accion === "ACEPTAR" ? "ACEPTADA" : "RECHAZADA");
      // Re-fetch the server-rendered list so the row moves to the right bucket
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setBusy(null);
    }
  }

  if (done) {
    return (
      <p
        className="mt-3 text-xs font-bold"
        style={{ color: done === "ACEPTADA" ? "var(--color-success)" : "var(--text-muted)" }}
      >
        ✓ Respuesta registrada: {done.toLowerCase()}
      </p>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => respond("ACEPTAR")}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-black uppercase text-black transition hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--color-success, #16a34a)" }}
        >
          {busy === "ACEPTAR" ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
          Aceptar
        </button>
        <button
          type="button"
          onClick={() => respond("RECHAZAR")}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold uppercase transition hover:opacity-80 disabled:opacity-50"
          style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          {busy === "RECHAZAR" ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
          Rechazar
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs font-bold" style={{ color: "var(--color-danger)" }}>{error}</p>
      )}
    </div>
  );
}
