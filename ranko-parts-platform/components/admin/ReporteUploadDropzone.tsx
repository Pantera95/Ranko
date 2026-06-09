"use client";

import { FileSpreadsheet, FileText, Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type DragEvent } from "react";

const TIPOS = [
  { value: "VENTAS", label: "Ventas", icon: FileSpreadsheet, hint: "XLS/XLSX exportado del ERP" },
  { value: "GASTOS", label: "Gastos", icon: FileSpreadsheet, hint: "XLS/XLSX con fecha, categoría, monto" },
  { value: "ESTADO_FINANCIERO", label: "Estado financiero", icon: FileText, hint: "XLS/XLSX/DOCX/PDF — P&L del período" },
] as const;

type Tipo = (typeof TIPOS)[number]["value"];

/**
 * Dropzone + tipo selector + progress feedback para subir reportes BI.
 * Hace POST a /api/admin/reportes/upload con FormData (file + tipo).
 * Refresca la página al finalizar para que el server component reciba la
 * nueva data del reporte recién importado.
 */
export function ReporteUploadDropzone() {
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>("VENTAS");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function reset() {
    setFile(null);
    setError(null);
    setSuccess(null);
  }

  function onFile(f: File | null | undefined) {
    setError(null);
    setSuccess(null);
    if (!f) return;
    const ok = /\.(xls|xlsx|docx|doc|pdf)$/i.test(f.name);
    if (!ok) {
      setError("Formato no soportado. Usa XLS, XLSX, DOCX, DOC o PDF.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("Archivo demasiado grande. Máximo 10 MB.");
      return;
    }
    setFile(f);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    onFile(e.dataTransfer.files[0]);
  }

  async function submit() {
    if (!file) return;
    setUploading(true);
    setError(null);
    setSuccess(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("tipo", tipo);

    try {
      const res = await fetch("/api/admin/reportes/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Error al procesar el archivo");
        return;
      }
      setSuccess(json.resumen ?? "Reporte procesado correctamente.");
      setFile(null);
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
      >
        <Upload size={13} style={{ color: "var(--color-gold)" }} />
        <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>
          Subir reporte
        </p>
      </div>

      <div className="grid gap-5 p-5">
        {/* Tipo selector */}
        <div className="grid gap-2 sm:grid-cols-3">
          {TIPOS.map((t) => {
            const Icon = t.icon;
            const isActive = tipo === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTipo(t.value)}
                className="flex items-start gap-3 rounded-sm p-3 text-left transition"
                style={{
                  border: `1px solid ${isActive ? "var(--color-gold)" : "var(--border)"}`,
                  background: isActive ? "color-mix(in srgb, var(--color-gold) 8%, var(--bg-card))" : "var(--bg-card)",
                }}
              >
                <Icon size={18} style={{ color: isActive ? "var(--color-gold)" : "var(--text-muted)" }} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase" style={{ color: "var(--text-primary)" }}>
                    {t.label}
                  </p>
                  <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {t.hint}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className="grid place-items-center rounded-sm p-8 text-center transition"
          style={{
            border: `2px dashed ${dragOver ? "var(--color-gold)" : "var(--border)"}`,
            background: dragOver
              ? "color-mix(in srgb, var(--color-gold) 5%, var(--bg-card))"
              : "var(--bg-elevated)",
          }}
        >
          {file ? (
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={28} style={{ color: "var(--color-gold)" }} />
              <div className="text-left">
                <p className="font-mono text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {file.name}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {(file.size / 1024).toFixed(0)} KB · {tipo}
                </p>
              </div>
              <button type="button" onClick={reset} className="rounded p-1" style={{ color: "var(--text-muted)" }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={32} style={{ color: "var(--text-muted)" }} />
              <p className="mt-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Arrastra el archivo aquí o haz click
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                XLS, XLSX, DOCX, DOC, PDF · máximo 10 MB
              </p>
              <label
                className="font-mono-tech mt-4 inline-flex cursor-pointer items-center gap-2 rounded-sm px-4 py-2 text-xs"
                style={{
                  border: "1px solid var(--color-gold)",
                  color: "var(--color-gold)",
                  background: "color-mix(in srgb, var(--color-gold) 6%, transparent)",
                }}
              >
                Seleccionar archivo
                <input
                  type="file"
                  accept=".xls,.xlsx,.docx,.doc,.pdf"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </label>
            </>
          )}
        </div>

        {/* Error / success */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 px-3 py-2 text-sm font-bold"
            style={{
              border: "1px solid var(--color-danger)",
              background: "color-mix(in srgb, var(--color-danger) 8%, transparent)",
              color: "var(--color-danger)",
            }}
          >
            <span aria-hidden="true">⚠</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div
            className="px-3 py-2 text-xs leading-5"
            style={{
              border: "1px solid var(--color-success)",
              background: "color-mix(in srgb, var(--color-success) 8%, transparent)",
              color: "var(--color-success)",
            }}
          >
            ✓ {success}
          </div>
        )}

        {/* Submit */}
        {file && !uploading && !success && (
          <button
            type="button"
            onClick={submit}
            disabled={uploading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-sm px-6 text-sm font-black uppercase tracking-wider text-black shadow-[0_8px_24px_-8px_rgba(245,197,24,0.5)] transition hover:shadow-[0_12px_32px_-8px_rgba(245,197,24,0.8)] disabled:opacity-50"
            style={{ background: "var(--color-gold)" }}
          >
            <Upload size={14} />
            Procesar archivo
          </button>
        )}
        {uploading && (
          <div
            className="flex items-center justify-center gap-2 rounded-sm py-3 text-xs font-black uppercase"
            style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
          >
            <Loader2 size={14} className="animate-spin" />
            Procesando... esto puede tardar unos segundos para archivos grandes.
          </div>
        )}
      </div>
    </section>
  );
}
