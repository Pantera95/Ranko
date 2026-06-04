"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ClienteError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[ClienteError]", error);
  }, [error]);

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center"
      style={{ color: "var(--text-primary)" }}
    >
      <div
        className="flex size-14 items-center justify-center"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--color-danger)" }}
      >
        <AlertTriangle size={24} style={{ color: "var(--color-danger)" }} />
      </div>
      <h2 className="font-display-kinetic--tight mt-5 text-2xl uppercase leading-tight">Error al cargar</h2>
      <p className="mt-2 max-w-sm text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
        No se pudo cargar esta sección. Puede ser un problema temporal — intenta de nuevo o
        contacta a tu vendedor.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          Código: {error.digest}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase text-black transition hover:opacity-90"
          style={{ background: "var(--color-gold)" }}
        >
          <RefreshCw size={13} /> Reintentar
        </button>
        <Link
          href="/cliente"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase transition hover:opacity-80"
          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          Portal
        </Link>
      </div>
    </div>
  );
}
