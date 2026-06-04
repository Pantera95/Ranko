import Link from "next/link";
import { Suspense } from "react";

import { QuoteBuilder } from "@/components/admin/QuoteBuilder";
import { getQuoteBuilderData } from "@/lib/quotes";

export default async function NuevaCotizacionPage() {
  const builderData = await getQuoteBuilderData();

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-5xl">
        <div className="flex items-center gap-3">
          <Link
            className="text-xs font-bold uppercase tracking-widest transition hover:text-[var(--color-gold)]"
            style={{ color: "var(--text-muted)" }}
            href="/admin/cotizaciones"
          >
            ← Cotizaciones
          </Link>
        </div>

        <div className="mt-4">
          <p className="font-mono-tech text-xs text-[var(--color-gold)]">
            Nueva
          </p>
          <h1 className="mt-2 font-display-kinetic--tight text-3xl uppercase leading-tight sm:text-4xl">Crear cotizacion</h1>
          <p className="mt-3 leading-7" style={{ color: "var(--text-secondary)" }}>
            Selecciona cliente, agrega items y ajusta totales. La cotizacion queda en estado
            Borrador hasta que la marques como Enviada.
          </p>
        </div>

        {builderData.isFallback ? (
          <div className="mt-6 p-4 text-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            Builder en modo demo: los clientes y productos mostrados son de ejemplo. Conecta{" "}
            <code className="font-mono text-[var(--color-gold)]">DATABASE_URL</code> para
            operar con datos reales.
          </div>
        ) : null}

        <Suspense fallback={<div className="mt-8 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>Cargando formulario…</div>}>
          <QuoteBuilder
            clientes={builderData.clientes}
            isFallback={builderData.isFallback}
            productos={builderData.productos}
          />
        </Suspense>
      </section>
    </main>
  );
}
