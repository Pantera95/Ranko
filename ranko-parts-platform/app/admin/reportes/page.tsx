import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { InsightsBI } from "@/components/admin/InsightsBI";
import { MetasConfigPanel } from "@/components/admin/MetasConfigPanel";
import { ReporteUploadDropzone } from "@/components/admin/ReporteUploadDropzone";
import { ReportesHistoryList } from "@/components/admin/ReportesHistoryList";
import { prisma } from "@/lib/db";
import { buildInsightsSnapshot, type InsightsSnapshot } from "@/lib/insights";
import { esRolEquipo } from "@/lib/roles";

export const dynamic = "force-dynamic";

/**
 * Dashboard BI Reportes — versión heurística (sin IA).
 *
 * Estructura:
 *  1. Upload dropzone (ventas/gastos/estado financiero)
 *  2. Metas financieras configurables
 *  3. KPI band con comparación vs período anterior y vs meta
 *  4. Alertas heurísticas
 *  5. Charts: revenue mensual, transacciones, top performers
 *  6. ABC, concentración, mix vendedores, estacionalidad
 *  7. Historial de reportes subidos (con borrado en cascada)
 */
export default async function AdminReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    redirect("/admin");
  }

  const sp = await searchParams;

  // Default range: últimos 12 meses para captura amplia del histórico subido.
  // El usuario puede acotar con ?from=YYYY-MM-DD&to=YYYY-MM-DD si lo desea.
  let dataRange = computeRange(sp.from, sp.to);

  let snapshot: InsightsSnapshot | null = null;
  let metas: { tipo: string; valor: number; notas: string | null }[] = [];
  let reportes: Awaited<ReturnType<typeof fetchReportes>> = [];
  let hasData = false;
  let bootstrapError: string | null = null;

  try {
    // Si no se especifica rango, auto-detectar la ventana real de datos
    // (min/max de VentaImportada.fecha) para no mostrar dashboard vacío
    // cuando el usuario subió data histórica.
    if (!sp.from && !sp.to) {
      const range = await prisma.ventaImportada
        .aggregate({ _min: { fecha: true }, _max: { fecha: true } })
        .catch(() => null);
      if (range?._min.fecha && range._max.fecha) {
        dataRange = { from: range._min.fecha, to: range._max.fecha };
      }
    }

    const [snap, metasDb, reps] = await Promise.all([
      buildInsightsSnapshot(dataRange),
      prisma.metaFinanciera.findMany({ orderBy: { tipo: "asc" } }).catch(() => []),
      fetchReportes(),
    ]);

    snapshot = snap;
    metas = metasDb.map((m) => ({ tipo: m.tipo, valor: Number(m.valor), notas: m.notas }));
    reportes = reps;
    hasData = snap.kpis[0]?.raw > 0;
  } catch (err) {
    console.error("[admin/reportes]", err);
    bootstrapError =
      "No se pudo conectar a la base de datos. Verifica que el deploy de Vercel haya corrido `prisma db push` y que las nuevas tablas (ReporteUpload, VentaImportada, MetaFinanciera) existan.";
  }

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-7xl">
        {/* ───────────── Header ───────────── */}
        <header>
          <p className="font-mono-tech text-xs" style={{ color: "var(--color-gold)" }}>
            BI · Reportes financieros
          </p>
          <h1 className="mt-3 font-display-kinetic--tight text-3xl uppercase leading-tight sm:text-4xl">
            Inteligencia operativa
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
            Sube tus reportes de ventas, gastos y estado financiero en XLS/XLSX/DOCX/PDF.
            El sistema parsea automáticamente y genera insights heurísticos comparando contra
            tus metas configuradas — sin depender de IA externa.
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            Período analizado:{" "}
            <span className="font-mono" style={{ color: "var(--text-secondary)" }}>
              {dataRange.from.toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" })}
              {" → "}
              {dataRange.to.toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </p>
        </header>

        {bootstrapError && (
          <div
            className="mt-6 p-4 text-sm"
            style={{
              background: "color-mix(in srgb, var(--color-danger) 8%, var(--bg-card))",
              border: "1px solid var(--color-danger)",
              color: "var(--color-danger)",
            }}
          >
            ⚠ {bootstrapError}
          </div>
        )}

        {/* ───────────── Upload + Metas ───────────── */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <ReporteUploadDropzone />
          <MetasConfigPanel
            initialMetas={metas.map((m) => ({ tipo: m.tipo, valor: m.valor, notas: m.notas }))}
          />
        </section>

        {/* ───────────── Insights ───────────── */}
        {snapshot && (
          <section className="mt-8">
            <InsightsBI snapshot={snapshot} hasData={hasData} />
          </section>
        )}

        {/* ───────────── Historial ───────────── */}
        <section className="mt-8">
          <ReportesHistoryList
            reportes={reportes.map((r) => ({
              ...r,
              createdAt: r.createdAt.toISOString(),
              periodoInicio: r.periodoInicio ? r.periodoInicio.toISOString() : null,
              periodoFin: r.periodoFin ? r.periodoFin.toISOString() : null,
            }))}
          />
        </section>
      </section>
    </main>
  );
}

function computeRange(from?: string, to?: string) {
  const now = new Date();
  const defaultTo = now;
  const defaultFrom = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const parsedFrom = from ? new Date(from) : defaultFrom;
  const parsedTo = to ? new Date(to) : defaultTo;
  return {
    from: Number.isNaN(parsedFrom.getTime()) ? defaultFrom : parsedFrom,
    to: Number.isNaN(parsedTo.getTime()) ? defaultTo : parsedTo,
  };
}

async function fetchReportes() {
  try {
    return await prisma.reporteUpload.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { subidoPor: { select: { nombre: true } } },
    });
  } catch {
    return [];
  }
}
