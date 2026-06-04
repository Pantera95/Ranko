import { Share2, Users } from "lucide-react";

import { auth } from "@/auth";
import { CopyButton } from "@/components/public/CopyButton";
import { getClienteReferidos } from "@/lib/client-sections";
import { cn } from "@/lib/utils";

const TIPO_LABELS: Record<string, string> = {
  MINORISTA: "Minorista",
  TALLER: "Taller",
  DISTRIBUIDOR_LOCAL: "Dist. Local",
  DISTRIBUIDOR_REGIONAL: "Dist. Regional",
  VIP: "VIP",
};

export default async function ClienteReferidosPage() {
  const session = await auth();
  const data = await getClienteReferidos(session?.user?.id);

  const whatsappMsg = encodeURIComponent(
    `Hola, te comparto mi codigo de referido Ranko Parts: ${data.codigoReferido}. Mencíonalo al contactarlos para tu primer pedido.`,
  );

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-4xl">
        <p className="font-mono-tech text-xs" style={{ color: "var(--color-gold)" }}>
          Portal del cliente
        </p>
        <h1 className="mt-2 font-display-kinetic--tight text-3xl uppercase leading-tight sm:text-4xl">Mis referidos</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Comparte tu codigo y acumula beneficios cada vez que un nuevo cliente compre en Ranko Parts.
        </p>

        {data.isFallback ? (
          <div
            className="mt-6 p-4 text-sm"
            style={{
              border: "1px solid var(--border)",
              borderLeft: "2px solid var(--color-gold)",
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
            }}
          >
            Portal en modo demo hasta conectar la base de datos.
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Código + CTA compartir */}
          <section
            className="p-6"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <div className="flex items-center gap-2">
              <Share2 size={18} style={{ color: "var(--text-muted)" }} />
              <h2 className="font-black uppercase">Tu codigo de referido</h2>
            </div>

            {data.codigoReferido ? (
              <>
                <div className="mt-5 flex items-center gap-3">
                  <p
                    className="flex-1 px-5 py-4 font-mono text-2xl font-black tracking-widest"
                    style={{
                      border: "1px dashed var(--border)",
                      background: "var(--bg-elevated)",
                    }}
                  >
                    {data.codigoReferido}
                  </p>
                  <CopyButton text={data.codigoReferido} />
                </div>

                <p className="mt-4 text-sm leading-6" style={{ color: "var(--text-muted)" }}>
                  Cada vez que un taller o distribuidor mencione tu codigo en su primer pedido,
                  ambos reciben beneficios comerciales con Ranko Parts.
                </p>

                <a
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 py-3 text-sm font-black transition hover:opacity-90"
                  href={`https://wa.me/?text=${whatsappMsg}`}
                  rel="noopener noreferrer"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--bg-elevated)",
                    color: "var(--color-gold)",
                  }}
                  target="_blank"
                >
                  <Share2 size={16} />
                  Compartir por WhatsApp
                </a>
              </>
            ) : (
              <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
                Tu codigo de referido aun no esta asignado. Contacta a tu vendedor.
              </p>
            )}
          </section>

          {/* Métricas */}
          <section className="grid content-start gap-3">
            <article
              className="p-5"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <div className="flex items-center gap-2">
                <Users size={16} style={{ color: "var(--text-muted)" }} />
                <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Total referidos</p>
              </div>
              <p className="mt-3 font-mono text-4xl font-black">
                {data.referidos.length}
              </p>
            </article>
            <div className="grid grid-cols-2 gap-3">
              <article
                className="p-4"
                style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
              >
                <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Activos</p>
                <p className="mt-2 font-mono text-3xl font-black text-green-700">
                  {data.activos}
                </p>
              </article>
              <article
                className="p-4"
                style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
              >
                <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Pendientes</p>
                <p
                  className="mt-2 font-mono text-3xl font-black"
                  style={{ color: data.pendientes > 0 ? "#d97706" : "var(--text-muted)" }}
                >
                  {data.pendientes}
                </p>
              </article>
            </div>

            {/* Cómo funciona */}
            <div
              className="p-4"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <p className="text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>Como funciona</p>
              <ol className="mt-3 grid gap-2">
                {[
                  "Comparte tu codigo con talleres o distribuidores.",
                  "El nuevo cliente lo menciona en su primer pedido.",
                  "Ranko Parts valida y activa el referido.",
                  "Ambos reciben beneficios en el siguiente pedido.",
                ].map((step, i) => (
                  <li
                    className="flex items-start gap-2 text-xs"
                    key={i}
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span
                      className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-black"
                      style={{ background: "var(--color-gold)", color: "#000" }}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </div>

        {/* Lista de referidos */}
        {data.referidos.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
              Clientes que referiste
            </h2>
            <div
              className="mt-3 overflow-x-auto"
              style={{ border: "1px solid var(--border)" }}
            >
              <table
                className="min-w-[500px] w-full border-collapse text-left text-sm"
                style={{ background: "var(--bg-card)" }}
              >
                <thead
                  className="text-xs uppercase"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                >
                  <tr>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {data.referidos.map((r) => (
                    <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                      <td className="px-4 py-3">
                        <p className="font-bold">{r.nombre}</p>
                        {r.empresa ? (
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{r.empresa}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        {TIPO_LABELS[r.tipo] ?? r.tipo}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded px-2 py-1 text-[10px] font-black uppercase",
                            r.estado === "ACTIVO"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700",
                          )}
                        >
                          {r.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{r.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <div
            className="mt-10 p-8 text-center"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <Users className="mx-auto" size={36} style={{ color: "var(--text-muted)" }} />
            <p className="mt-3 font-bold uppercase" style={{ color: "var(--text-muted)" }}>Aun no tienes referidos</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Comparte tu codigo para empezar a acumular beneficios.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
