import { notFound } from "next/navigation";

const sections: Record<string, { title: string; description: string; items: string[] }> = {
  pedidos: {
    title: "Mis pedidos",
    description: "Tracking de ordenes activas, historial de despacho y estados publicos.",
    items: ["Confirmados", "En preparacion", "En camino"],
  },
  facturas: {
    title: "Mis facturas",
    description: "Facturas pendientes, pagadas, vencidas y descarga de PDF.",
    items: ["Pendientes", "Pagadas", "Vencidas"],
  },
  cotizaciones: {
    title: "Mis cotizaciones",
    description: "Cotizaciones enviadas, aprobadas, vencidas y conversion a pedido.",
    items: ["Enviadas", "Aceptadas", "Vencidas"],
  },
  perfil: {
    title: "Mi perfil",
    description: "Datos de contacto, direccion, RIF, condiciones y vehiculos registrados.",
    items: ["Contacto", "Vehiculos", "Condicion de pago"],
  },
  referidos: {
    title: "Mis referidos",
    description: "Codigo, empresas referidas, estado de activacion y beneficios acumulados.",
    items: ["Codigo", "Pendientes", "Beneficios"],
  },
};

type ClienteSectionPageProps = {
  params: Promise<{ section: string }>;
};

export default async function ClienteSectionPage({ params }: ClienteSectionPageProps) {
  const { section } = await params;
  const data = sections[section];

  if (!data) {
    notFound();
  }

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-6xl">
        <p className="font-mono-tech text-xs" style={{ color: "var(--color-gold)" }}>
          Portal del cliente
        </p>
        <h1 className="mt-3 text-4xl font-black uppercase">{data.title}</h1>
        <p className="mt-3 max-w-3xl leading-7" style={{ color: "var(--text-secondary)" }}>{data.description}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {data.items.map((item) => (
            <article
              key={item}
              className="p-5"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <p className="text-sm font-bold uppercase" style={{ color: "var(--text-muted)" }}>{item}</p>
              <p className="mt-3 font-mono text-3xl font-black">0</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
