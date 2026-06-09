"use client";

import { Check, Copy, FileSpreadsheet, FileText, Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type DragEvent } from "react";

type ErrorDetail = {
  status: number;
  statusText: string;
  responseBody: string;
  responseHeaders: Record<string, string>;
  request: { url: string; method: string; tipo: string; fileName: string; fileSize: number };
  clientError?: string;
  timestamp: string;
};

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
  const [errorDetail, setErrorDetail] = useState<ErrorDetail | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  function reset() {
    setFile(null);
    setError(null);
    setErrorDetail(null);
    setSuccess(null);
  }

  async function copyErrorToClipboard() {
    if (!errorDetail) return;
    const text = JSON.stringify(errorDetail, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
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
    setErrorDetail(null);
    setSuccess(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("tipo", tipo);

    const url = "/api/admin/reportes/upload";
    const requestInfo = {
      url,
      method: "POST",
      tipo,
      fileName: file.name,
      fileSize: file.size,
    };

    let res: Response | null = null;
    let bodyText = "";

    try {
      res = await fetch(url, { method: "POST", body: fd });

      // Capturamos el body como texto SIEMPRE, antes de intentar parsear JSON,
      // así si el server devuelve HTML/texto plano de error (típico de timeouts
      // o crashes de Vercel) lo podamos mostrar igual.
      bodyText = await res.text();

      let json: { ok?: boolean; error?: string; resumen?: string } = {};
      try {
        json = JSON.parse(bodyText) as typeof json;
      } catch {
        // body no es JSON — guardamos el texto crudo en errorDetail abajo
      }

      if (!res.ok || !json.ok) {
        const headersObj: Record<string, string> = {};
        res.headers.forEach((v, k) => {
          headersObj[k] = v;
        });
        setError(json.error ?? `HTTP ${res.status} ${res.statusText}`);
        setErrorDetail({
          status: res.status,
          statusText: res.statusText,
          responseBody: bodyText.slice(0, 8000),
          responseHeaders: headersObj,
          request: requestInfo,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      setSuccess(json.resumen ?? "Reporte procesado correctamente.");
      setFile(null);
      router.refresh();
    } catch (err) {
      const clientError = err instanceof Error ? `${err.name}: ${err.message}\n${err.stack ?? ""}` : String(err);
      setError("Error de conexión — abrí 'Ver detalles' para el log completo");
      setErrorDetail({
        status: res?.status ?? 0,
        statusText: res?.statusText ?? "Network error / fetch threw",
        responseBody: bodyText.slice(0, 8000),
        responseHeaders: {},
        request: requestInfo,
        clientError,
        timestamp: new Date().toISOString(),
      });
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
            className="flex items-start justify-between gap-3 px-3 py-2 text-sm font-bold"
            style={{
              border: "1px solid var(--color-danger)",
              background: "color-mix(in srgb, var(--color-danger) 8%, transparent)",
              color: "var(--color-danger)",
            }}
          >
            <div className="flex items-start gap-2 min-w-0">
              <span aria-hidden="true">⚠</span>
              <span className="break-words">{error}</span>
            </div>
            {errorDetail && (
              <button
                type="button"
                onClick={() => setShowErrorModal(true)}
                className="shrink-0 rounded-sm px-2 py-1 text-[10px] font-black uppercase"
                style={{
                  border: "1px solid var(--color-danger)",
                  color: "var(--color-danger)",
                  background: "transparent",
                }}
              >
                Ver detalles
              </button>
            )}
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

      {/* ───────────── Modal de error ───────────── */}
      {showErrorModal && errorDetail && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          style={{ background: "color-mix(in srgb, #000 75%, transparent)" }}
          onClick={() => setShowErrorModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--color-danger)",
              boxShadow: "0 24px 64px -16px rgba(0,0,0,0.7)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between gap-2 px-5 py-3 shrink-0"
              style={{
                background: "color-mix(in srgb, var(--color-danger) 10%, var(--bg-elevated))",
                borderBottom: "1px solid var(--color-danger)",
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span style={{ color: "var(--color-danger)" }}>⚠</span>
                <div className="min-w-0">
                  <p className="font-mono-tech text-xs" style={{ color: "var(--color-danger)" }}>
                    Log del error
                  </p>
                  <p className="font-mono text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                    {errorDetail.timestamp} · HTTP {errorDetail.status || "—"} {errorDetail.statusText}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={copyErrorToClipboard}
                  className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[10px] font-black uppercase"
                  style={{
                    border: "1px solid var(--color-gold)",
                    color: copied ? "var(--color-success)" : "var(--color-gold)",
                  }}
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  {copied ? "Copiado" : "Copiar JSON"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowErrorModal(false)}
                  className="rounded-sm p-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-auto p-5 grid gap-4">
              <Section title="Request">
                <Kv k="URL" v={errorDetail.request.url} />
                <Kv k="Método" v={errorDetail.request.method} />
                <Kv k="Tipo" v={errorDetail.request.tipo} />
                <Kv k="Archivo" v={errorDetail.request.fileName} />
                <Kv k="Tamaño" v={`${(errorDetail.request.fileSize / 1024).toFixed(1)} KB`} />
              </Section>

              <Section title={`Response · HTTP ${errorDetail.status || "—"}`}>
                <Kv k="Status text" v={errorDetail.statusText || "—"} />
                {Object.keys(errorDetail.responseHeaders).length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                      Headers ({Object.keys(errorDetail.responseHeaders).length})
                    </summary>
                    <pre
                      className="mt-2 overflow-auto p-3 font-mono text-[10px] leading-5"
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
                    >
                      {Object.entries(errorDetail.responseHeaders)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join("\n")}
                    </pre>
                  </details>
                )}
              </Section>

              <Section title="Response body (raw)">
                <pre
                  className="overflow-auto p-3 font-mono text-[11px] leading-5 max-h-[300px]"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {errorDetail.responseBody || "(vacío — el server no devolvió cuerpo)"}
                </pre>
              </Section>

              {errorDetail.clientError && (
                <Section title="Client error (fetch threw)">
                  <pre
                    className="overflow-auto p-3 font-mono text-[11px] leading-5 max-h-[200px]"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--color-danger)", color: "var(--color-danger)", whiteSpace: "pre-wrap" }}
                  >
                    {errorDetail.clientError}
                  </pre>
                </Section>
              )}

              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Tip: hacé click en <b>Copiar JSON</b> y pegá el resultado en el chat — con eso puedo diagnosticar exactamente qué salió mal.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="mb-2 font-mono-tech text-[10px]"
        style={{ color: "var(--color-gold)", letterSpacing: "0.1em" }}
      >
        {title}
      </p>
      <div className="grid gap-1">{children}</div>
    </div>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-3 text-xs">
      <span className="font-bold uppercase w-20 shrink-0" style={{ color: "var(--text-muted)" }}>
        {k}
      </span>
      <span className="font-mono break-all" style={{ color: "var(--text-primary)" }}>
        {v}
      </span>
    </div>
  );
}
