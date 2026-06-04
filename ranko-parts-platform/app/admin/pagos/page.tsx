import { PaymentsPanel } from "@/components/admin/PaymentsPanel";
import { getPaymentsData } from "@/lib/payments";

export default async function AdminPagosPage() {
  const data = await getPaymentsData();

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-7xl">
        <div>
          <p className="font-mono-tech text-xs" style={{ color: "var(--color-gold)" }}>
            Finanzas
          </p>
          <h1 className="mt-3 font-display-kinetic--tight text-3xl uppercase leading-tight sm:text-4xl">Pagos</h1>
          <p className="mt-3 max-w-3xl leading-7" style={{ color: "var(--text-secondary)" }}>
            Registro y verificacion de pagos Zelle, transferencia y efectivo. El sistema
            detecta automaticamente referencias duplicadas, montos anomalos y facturas vencidas.
          </p>
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
            Pagos en modo demo: conecta{" "}
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

        <PaymentsPanel
          facturasPendientes={data.facturasPendientes}
          initialPayments={data.payments}
          isFallback={data.isFallback}
        />
      </section>
    </main>
  );
}
