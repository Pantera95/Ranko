import { PipelineKanban } from "@/components/crm/PipelineKanban";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { getCrmPipelineData } from "@/lib/crm";

export default async function CrmPage() {
  const pipeline = await getCrmPipelineData();

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-[1800px]">
        <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
          Ventas
        </p>
        <h1 className="mt-3 text-4xl font-black uppercase">CRM / Pipeline</h1>
        <p className="mt-3 max-w-3xl leading-7" style={{ color: "var(--text-secondary)" }}>
          Gestiona leads publicos, oportunidades B2B, cotizaciones y recompras desde un flujo
          visual por etapas.
        </p>
        {pipeline.isFallback ? (
          <div
            className="mt-5 p-4 text-sm"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderLeft: "2px solid var(--color-gold)",
              color: "var(--text-secondary)",
            }}
          >
            CRM en modo demo: conecta `DATABASE_URL`, ejecuta `npm run db:push` y
            `npm run db:seed` para mover leads reales.
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {pipeline.metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        <PipelineKanban initialStages={pipeline.stages} isFallback={pipeline.isFallback} />
      </section>
    </main>
  );
}
