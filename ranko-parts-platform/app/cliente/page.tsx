import { auth } from "@/auth";
import { CopyButton } from "@/components/public/CopyButton";
import { getClientPortalData } from "@/lib/client-portal";

export default async function ClientePage() {
  const session = await auth();
  const portal = await getClientPortalData(session?.user?.id);

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
          Portal del cliente
        </p>
        <h1 className="mt-3 text-4xl font-black uppercase">
          Bienvenido, {portal.clienteNombre}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          {portal.empresa ?? session?.user?.email ?? "Cuenta cliente Ranko Parts"}
        </p>
        {portal.isFallback ? (
          <div
            className="mt-5 p-4 text-sm"
            style={{
              border: "1px solid var(--border)",
              borderLeft: "2px solid var(--color-gold)",
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
            }}
          >
            Portal en modo demo hasta conectar la base de datos y ejecutar el seed.
          </div>
        ) : null}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {portal.metrics.map((item) => (
            <article
              key={item.label}
              className="p-5"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <p className="text-sm font-bold uppercase" style={{ color: "var(--text-muted)" }}>{item.label}</p>
              <p className="mt-3 font-mono text-3xl font-black">{item.value}</p>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{item.helper}</p>
            </article>
          ))}
        </div>
        <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article
            className="p-5"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <h2 className="text-xl font-black uppercase">Mis vehiculos</h2>
            <div className="mt-4 grid gap-3">
              {portal.vehicles.map((vehicle) => (
                <div
                  key={`${vehicle.marca}-${vehicle.modelo}-${vehicle.anio}`}
                  className="p-4"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)" }}
                >
                  <p className="font-black uppercase">
                    {vehicle.marca} {vehicle.modelo}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {vehicle.anio} · {vehicle.motor ?? "Motor por completar"}
                  </p>
                </div>
              ))}
            </div>
          </article>
          <article
            className="p-5"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <h2 className="text-xl font-black uppercase">Codigo de referido</h2>
            <div className="mt-4 flex items-center gap-3">
              <p
                className="flex-1 p-4 font-mono text-2xl font-black"
                style={{
                  border: "1px dashed var(--border)",
                  background: "var(--bg-elevated)",
                }}
              >
                {portal.codigoReferido ?? "PENDIENTE"}
              </p>
              {portal.codigoReferido && (
                <CopyButton text={portal.codigoReferido} />
              )}
            </div>
            <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              Comparte este codigo con talleres o distribuidores para acumular beneficios comerciales.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
