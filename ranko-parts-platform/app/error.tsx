"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // In production you'd send to Sentry / your error tracker here
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <main
      className="grid min-h-screen place-items-center px-6"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <div className="text-center">
        <div
          className="mx-auto flex size-16 items-center justify-center"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--color-danger)" }}
        >
          <AlertTriangle size={28} style={{ color: "var(--color-danger)" }} />
        </div>
        <h1 className="mt-6 text-3xl font-black uppercase">Algo salió mal</h1>
        <p className="mt-3 max-w-md text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          Ocurrió un error inesperado. Puedes intentar recargar la página o volver al inicio.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-black uppercase text-black transition hover:opacity-90"
            style={{ background: "var(--color-gold)" }}
          >
            <RefreshCw size={14} /> Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-black uppercase transition hover:opacity-80"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
