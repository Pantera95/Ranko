import Link from "next/link";
import { Suspense } from "react";

import { InvoiceBuilder } from "@/components/admin/InvoiceBuilder";
import { getQuoteBuilderData } from "@/lib/quotes";

export default async function NuevaFacturaPage() {
  const builderData = await getQuoteBuilderData();

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-5xl">

        <div className="flex items-center gap-3">
          <Link
            href="/admin/facturacion"
            className="text-xs font-bold uppercase tracking-widest transition hover:text-[var(--color-gold)]"
            style={{ color: "var(--text-muted)" }}
          >
            ← Facturación
          </Link>
        </div>

        <div className="mt-4">
          <p className="font-mono-tech text-xs text-[var(--color-gold)]">
            Nueva
          </p>
          <h1 className="mt-2 font-display-kinetic--tight text-3xl uppercase leading-tight sm:text-4xl">Emitir factura</h1>
          <p className="mt-3 leading-7" style={{ color: "var(--text-secondary)" }}>
            Crea una factura directa sin cotización previa. Selecciona cliente, agrega items,
            define vencimiento y método de pago. La factura quedará en estado{" "}
            <strong>Pendiente</strong> hasta que registres un pago.
          </p>
        </div>

        {builderData.isFallback && (
          <div
            className="mt-6 p-4 text-sm"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Builder en modo demo — conecta{" "}
            <code className="font-mono text-[var(--color-gold)]">DATABASE_URL</code> para
            emitir facturas reales.
          </div>
        )}

        <Suspense
          fallback={
            <div className="mt-8 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Cargando formulario…
            </div>
          }
        >
          <InvoiceBuilder
            clientes={builderData.clientes}
            productos={builderData.productos}
            isFallback={builderData.isFallback}
          />
        </Suspense>
      </section>
    </main>
  );
}
