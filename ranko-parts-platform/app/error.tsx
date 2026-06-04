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
      className="relative grid min-h-screen place-items-center overflow-hidden px-6"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,197,24,0.05)_1px,transparent_1px),linear-gradient(rgba(245,197,24,0.05)_1px,transparent_1px)] bg-[size:48px_48px]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(220,38,38,0.10),transparent_55%)]"
      />

      <div className="relative text-center">
        <div
          className="mx-auto flex size-16 items-center justify-center"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--color-danger)" }}
        >
          <AlertTriangle size={28} style={{ color: "var(--color-danger)" }} />
        </div>
        <p className="font-mono-tech mt-6 text-xs" style={{ color: "var(--color-danger)" }}>
          Error inesperado
        </p>
        <h1 className="font-display-kinetic--tight mt-3 text-3xl uppercase leading-tight sm:text-4xl">
          Algo salió mal
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          Ocurrió un error inesperado. Puedes intentar recargar la página o volver al inicio.
        </p>
        {error.digest && (
          <p className="font-mono-tech mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-sm px-6 text-sm font-black uppercase tracking-wider text-black shadow-[0_8px_24px_-8px_rgba(245,197,24,0.5)] transition-all hover:shadow-[0_12px_32px_-8px_rgba(245,197,24,0.8)]"
            style={{ background: "var(--color-gold)" }}
          >
            <RefreshCw size={14} className="transition-transform group-hover:rotate-180" />
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-sm px-6 text-sm font-black uppercase tracking-wider transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
