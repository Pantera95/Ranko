import Link from "next/link";
import { Plus } from "lucide-react";

import { QuoteTable } from "@/components/admin/QuoteTable";
import { getQuotesListData } from "@/lib/quotes";

export default async function AdminCotizacionesPage() {
  const data = await getQuotesListData();

  const pendientes = data.quotes.filter(
    (q) => q.estado === "ENVIADA" && !q.convertidaAFactura,
  );

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
              Ventas
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase">Cotizaciones</h1>
            <p className="mt-3 max-w-3xl leading-7" style={{ color: "var(--text-secondary)" }}>
              Pipeline de propuestas comerciales. Cambia estados, convierte cotizaciones
              aceptadas a factura y registra logs automaticamente.
            </p>
          </div>

          <div className="p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
              Esperando respuesta
            </p>
            <div className="mt-4 grid gap-3">
              {pendientes.length ? (
                pendientes.slice(0, 4).map((q) => (
                  <article
                    className="flex items-center justify-between gap-3 p-3"
                    key={q.id}
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  >
                    <div>
                      <p className="font-mono font-bold" style={{ color: "var(--color-gold)" }}>{q.numero}</p>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>{q.cliente}</p>
                    </div>
                    <p className="font-mono text-sm font-black" style={{ color: "var(--text-primary)" }}>{q.total}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sin cotizaciones pendientes.</p>
              )}
            </div>
          </div>
        </div>

        {data.isFallback ? (
          <div
            className="mt-8 p-4 text-sm"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderLeft: "2px solid var(--color-gold)",
              color: "var(--text-secondary)",
            }}
          >
            Cotizaciones en modo demo: conecta{" "}
            <code className="font-mono" style={{ color: "var(--color-gold)" }}>DATABASE_URL</code>, ejecuta{" "}
            <code className="font-mono" style={{ color: "var(--color-gold)" }}>npm run db:push</code> y{" "}
            <code className="font-mono" style={{ color: "var(--color-gold)" }}>npm run db:seed</code> para
            operar con datos reales.
          </div>
        ) : null}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {data.metrics.map((m) => (
            <article
              className="p-5"
              key={m.label}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>{m.label}</p>
              <p
                className="mt-3 font-mono text-3xl font-black"
                style={{ color: m.danger ? "var(--color-danger)" : "var(--text-primary)" }}
              >
                {m.value}
              </p>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{m.helper}</p>
            </article>
          ))}
        </section>

        <div className="mt-8 flex justify-end">
          <Link
            className="inline-flex items-center gap-2 border px-5 py-2.5 text-sm font-black text-black transition hover:opacity-90"
            href="/admin/cotizaciones/nueva"
            style={{ background: "var(--color-gold)", borderColor: "var(--color-gold)" }}
          >
            <Plus size={16} />
            Nueva cotizacion
          </Link>
        </div>

        <QuoteTable initialQuotes={data.quotes} isFallback={data.isFallback} />
      </section>
    </main>
  );
}
