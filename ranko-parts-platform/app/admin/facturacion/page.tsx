import { Plus } from "lucide-react";
import Link from "next/link";

import { InvoiceTable } from "@/components/admin/InvoiceTable";
import { getInvoicesData } from "@/lib/invoices";

export default async function AdminFacturacionPage() {
  const data = await getInvoicesData();

  const agingBorder: Record<string, string> = {
    corriente: "var(--border)",
    "30": "var(--color-gold)",
    "60": "#f97316",
    "90": "var(--color-danger)",
    critica: "var(--color-danger)",
  };

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
              Finanzas
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <h1 className="text-4xl font-black uppercase">Facturación</h1>
              <Link
                href="/admin/facturacion/nueva"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase text-black transition hover:opacity-90"
                style={{ background: "var(--color-gold)" }}
              >
                <Plus size={13} /> Nueva factura
              </Link>
            </div>
            <p className="mt-3 max-w-3xl leading-7" style={{ color: "var(--text-secondary)" }}>
              Historial de facturas emitidas, estados de cobro y cartera por aging.
              Emite facturas directas o conviértelas desde cotizaciones aceptadas.
            </p>
          </div>

          <div className="p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
              Cartera por aging
            </p>
            {data.aging.length ? (
              <div className="mt-4 grid gap-3">
                {data.aging.map((band) => (
                  <article
                    className="flex items-center justify-between p-3"
                    key={band.bucket}
                    style={{
                      border: `1px solid ${agingBorder[band.bucket] ?? "var(--border)"}`,
                      color: agingBorder[band.bucket] !== "var(--border)"
                        ? agingBorder[band.bucket]
                        : "var(--text-primary)",
                    }}
                  >
                    <div>
                      <p className="font-bold">{band.label}</p>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                        {band.count} factura{band.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="font-mono font-black">{band.monto}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>Sin cartera pendiente. Todo cobrado.</p>
            )}
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
            Facturacion en modo demo: conecta{" "}
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

        <InvoiceTable initialInvoices={data.invoices} isFallback={data.isFallback} />
      </section>
    </main>
  );
}
