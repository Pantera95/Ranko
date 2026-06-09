"use client";

import { ExternalLink, FileSpreadsheet, FileText, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ReporteRow = {
  id: string;
  tipo: string;
  formato: string;
  nombreArchivo: string;
  archivoUrl: string;
  filasImportadas: number;
  filasAnuladas: number;
  estadoProceso: string;
  errorMensaje: string | null;
  resumenIA: string | null;
  periodoInicio: string | null;
  periodoFin: string | null;
  createdAt: string;
  subidoPor: { nombre: string };
};

export function ReportesHistoryList({ reportes }: { reportes: ReporteRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function deleteReporte(id: string) {
    if (!confirm("¿Eliminar este reporte? Se borrarán también todas las filas importadas. Esta acción no se puede deshacer.")) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/reportes/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  if (reportes.length === 0) {
    return (
      <section className="p-8 text-center" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
        <FileSpreadsheet className="mx-auto" size={32} style={{ color: "var(--text-muted)" }} />
        <p className="mt-3 font-bold uppercase" style={{ color: "var(--text-muted)" }}>
          Aún no has subido reportes
        </p>
        <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          Sube tu primer archivo arriba para empezar a ver insights.
        </p>
      </section>
    );
  }

  return (
    <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
      >
        <FileText size={13} style={{ color: "var(--color-gold)" }} />
        <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>
          Historial de archivos ({reportes.length})
        </p>
      </div>
      <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
        {reportes.map((r) => {
          const isExpanded = expandedId === r.id;
          const isComplete = r.estadoProceso === "COMPLETADO";
          const isError = r.estadoProceso === "ERROR";
          const Icon = r.formato.includes("XLS") ? FileSpreadsheet : FileText;

          return (
            <li key={r.id} className="px-5 py-4">
              <div className="flex items-start gap-3">
                <Icon size={18} className="mt-1 shrink-0" style={{ color: isComplete ? "var(--color-gold)" : "var(--text-muted)" }} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-tech text-[10px] rounded px-1.5 py-0.5" style={{ background: "var(--bg-elevated)", color: "var(--color-gold)" }}>
                      {r.tipo}
                    </span>
                    <span className="font-mono-tech text-[10px] rounded px-1.5 py-0.5" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                      {r.formato}
                    </span>
                    <span
                      className="font-mono-tech text-[10px] rounded px-1.5 py-0.5"
                      style={{
                        background: isComplete
                          ? "color-mix(in srgb, var(--color-success) 18%, var(--bg-elevated))"
                          : isError
                            ? "color-mix(in srgb, var(--color-danger) 18%, var(--bg-elevated))"
                            : "var(--bg-elevated)",
                        color: isComplete ? "var(--color-success)" : isError ? "var(--color-danger)" : "var(--text-muted)",
                      }}
                    >
                      {r.estadoProceso}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {new Date(r.createdAt).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                    {r.nombreArchivo}
                  </p>
                  {r.periodoInicio && r.periodoFin && (
                    <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                      Período: {new Date(r.periodoInicio).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" })}
                      {" → "}
                      {new Date(r.periodoFin).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  )}
                  {isComplete && (
                    <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {r.filasImportadas.toLocaleString("en-US")} filas importadas
                      {r.filasAnuladas > 0 ? ` · ${r.filasAnuladas} anuladas` : ""}
                      {" · subido por "}{r.subidoPor.nombre}
                    </p>
                  )}
                  {isError && r.errorMensaje && (
                    <p className="mt-2 text-xs" style={{ color: "var(--color-danger)" }}>
                      ⚠ {r.errorMensaje}
                    </p>
                  )}
                  {isExpanded && r.resumenIA && (
                    <p className="mt-3 rounded p-3 text-xs leading-5" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                      {r.resumenIA}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {r.resumenIA && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      className="rounded p-1 text-[10px] font-bold uppercase"
                      style={{ color: "var(--text-muted)" }}
                      title={isExpanded ? "Ocultar resumen" : "Ver resumen"}
                    >
                      {isExpanded ? "▴" : "▾"}
                    </button>
                  )}
                  <a
                    href={r.archivoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded p-1"
                    style={{ color: "var(--text-muted)" }}
                    title="Descargar original"
                  >
                    <ExternalLink size={13} />
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteReporte(r.id)}
                    disabled={deletingId === r.id}
                    className="rounded p-1 disabled:opacity-50"
                    style={{ color: "var(--color-danger)" }}
                    title="Eliminar reporte (también borra filas importadas)"
                  >
                    {deletingId === r.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
