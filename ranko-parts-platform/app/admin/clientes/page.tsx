import { NuevoClienteModal } from "@/components/admin/NuevoClienteModal";
import { CustomerTable } from "@/components/admin/CustomerTable";
import { getCustomersData } from "@/lib/customers";

export default async function AdminClientesPage() {
  const data = await getCustomersData();

  const top = data.clientes
    .filter((c) => c.activo && !c.bloqueado)
    .sort((a, b) => b.scoring - a.scoring)
    .slice(0, 4);

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="font-mono-tech inline-flex items-center gap-2 text-xs" style={{ color: "var(--color-gold)" }}>
              <span className="block h-px w-6" style={{ background: "var(--color-gold)" }} />
              CRM
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <h1 className="font-display-kinetic--tight text-3xl uppercase leading-tight sm:text-4xl">Clientes</h1>
              <NuevoClienteModal />
            </div>
            <p className="mt-3 max-w-3xl leading-7" style={{ color: "var(--text-secondary)" }}>
              Ficha comercial 360. Tipo, vendedor, credito, scoring, vehiculos y actividad.
              Bloquea o desactiva clientes desde la tabla.
            </p>
          </div>

          <div className="p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
              Top scoring
            </p>
            <div className="mt-4 grid gap-3">
              {top.length ? (
                top.map((c) => (
                  <article
                    className="flex items-center justify-between gap-3 p-3"
                    key={c.id}
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  >
                    <div>
                      <p className="font-bold" style={{ color: "var(--text-primary)" }}>{c.nombre}</p>
                      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        {c.empresa || c.ciudad || "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-black" style={{ color: "var(--color-gold)" }}>
                        {c.scoring}
                      </p>
                      <p className="mt-1 text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>{c.tipo}</p>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sin clientes registrados aun.</p>
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
            Clientes en modo demo: conecta{" "}
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

        <CustomerTable initialClientes={data.clientes} isFallback={data.isFallback} />
      </section>
    </main>
  );
}
