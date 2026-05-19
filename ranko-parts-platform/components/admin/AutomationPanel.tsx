"use client";

import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Mail,
  MessageSquare,
  Pause,
  Play,
  Plus,
  Send,
  Trash2,
  TrendingUp,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";

import type {
  AutomationData,
  CanalPaso,
  Paso,
  PlantillaPreview,
  SecuenciaRow,
  TipoSecuencia,
} from "@/lib/automation-config";
import { PLANTILLAS_BUILTIN } from "@/lib/automation-config";

// ─── Design tokens ────────────────────────────────────────────────────────────

const TIPO_META: Record<TipoSecuencia, { label: string; color: string; bg: string; border: string }> = {
  LEAD_NUEVO:           { label: "Lead nuevo",         color: "#60a5fa", bg: "bg-blue-500/10",    border: "border-blue-500/30"    },
  COTIZACION_ENVIADA:   { label: "Cotización enviada", color: "#fbbf24", bg: "bg-amber-500/10",   border: "border-amber-500/30"   },
  FACTURA_VENCIDA:      { label: "Factura vencida",    color: "#f87171", bg: "bg-red-500/10",     border: "border-red-500/30"     },
  RECOMPRA_PROGRAMADA:  { label: "Recompra",           color: "#34d399", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  BIENVENIDA_CLIENTE:   { label: "Bienvenida",         color: "#a78bfa", bg: "bg-purple-500/10",  border: "border-purple-500/30"  },
  PAGO_RECIBIDO:        { label: "Pago recibido",      color: "#4ade80", bg: "bg-green-500/10",   border: "border-green-500/30"   },
};

const CANAL_META: Record<CanalPaso, { icon: React.ReactNode; label: string; color: string; pill: string }> = {
  WHATSAPP: { icon: <MessageSquare size={10} />, label: "WA",    color: "#22c55e", pill: "bg-green-500/15 text-green-400 border-green-500/20" },
  EMAIL:    { icon: <Mail size={10} />,          label: "Email", color: "#60a5fa", pill: "bg-blue-500/15 text-blue-400 border-blue-500/20"    },
  INTERNO:  { icon: <Zap size={10} />,           label: "Int.",  color: "#F5C518", pill: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
};

// ─── Main panel ───────────────────────────────────────────────────────────────

export function AutomationPanel({ data }: { data: AutomationData }) {
  const [secuencias, setSecuencias] = useState<SecuenciaRow[]>(data.secuencias);
  const [tab, setTab] = useState<"secuencias" | "plantillas" | "logs">("secuencias");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  async function toggleActiva(id: string, current: boolean) {
    setSecuencias((prev) => prev.map((s) => s.id === id ? { ...s, activa: !current } : s));
    try {
      const res = await fetch(`/api/admin/automatizacion/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !current }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setSecuencias((prev) => prev.map((s) => s.id === id ? { ...s, activa: current } : s));
    }
  }

  async function deleteSeq(id: string) {
    if (!confirm("¿Eliminar esta secuencia?")) return;
    setSecuencias((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/admin/automatizacion/${id}`, { method: "DELETE" });
  }

  const activas = secuencias.filter((s) => s.activa).length;

  return (
    <div className="mt-8">

      {/* ── Tab bar ── */}
      <div className="flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex">
          {(["secuencias", "plantillas", "logs"] as const).map((t) => {
            const labels = { secuencias: "Secuencias", plantillas: "Plantillas", logs: "Actividad" };
            const counts = {
              secuencias: secuencias.length,
              plantillas: PLANTILLAS_BUILTIN.length,
              logs: data.logs.length,
            };
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="relative px-5 py-3 text-xs font-black uppercase tracking-wider transition-colors"
                style={{ color: tab === t ? "var(--text-primary)" : "var(--text-muted)" }}
              >
                {labels[t]}
                <span
                  className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-black transition-colors"
                  style={tab === t
                    ? { background: "var(--color-gold)", color: "#000" }
                    : { background: "var(--bg-elevated)", color: "var(--text-muted)" }
                  }
                >
                  {counts[t]}
                </span>
                {tab === t && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--color-gold)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active summary pill */}
        <div className="flex items-center gap-1.5 pr-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-green-500" />
          </span>
          {activas} activa{activas !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── SECUENCIAS ── */}
      {tab === "secuencias" && (
        <div className="mt-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {secuencias.length} secuencia{secuencias.length !== 1 ? "s" : ""} configuradas
            </p>
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-2 border border-[var(--color-gold)] px-4 py-2 text-xs font-black text-[var(--color-gold)] transition hover:bg-[var(--color-gold)] hover:text-black"
            >
              <Plus size={13} />
              Nueva secuencia
            </button>
          </div>

          {showNew && (
            <NewSecuenciaForm
              onCreated={(seq) => { setSecuencias((p) => [seq, ...p]); setShowNew(false); }}
              onCancel={() => setShowNew(false)}
            />
          )}

          <div className="grid gap-2">
            {secuencias.map((seq) => (
              <SequenceCard
                key={seq.id}
                seq={seq}
                expanded={expanded === seq.id}
                onToggleExpand={() => setExpanded((p) => p === seq.id ? null : seq.id)}
                onToggleActiva={() => toggleActiva(seq.id, seq.activa)}
                onDelete={() => deleteSeq(seq.id)}
              />
            ))}
            {secuencias.length === 0 && <EmptySequences />}
          </div>
        </div>
      )}

      {/* ── PLANTILLAS ── */}
      {tab === "plantillas" && (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {PLANTILLAS_BUILTIN.map((p) => <PlantillaCard key={p.id} plantilla={p} />)}
        </div>
      )}

      {/* ── ACTIVIDAD ── */}
      {tab === "logs" && <ActivityLog logs={data.logs} />}
    </div>
  );
}

// ─── Sequence card ────────────────────────────────────────────────────────────

function SequenceCard({
  seq, expanded, onToggleExpand, onToggleActiva, onDelete,
}: {
  seq: SecuenciaRow;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleActiva: () => void;
  onDelete: () => void;
}) {
  const tipo = TIPO_META[seq.tipo];
  const sortedPasos = [...seq.pasos].sort((a, b) => a.orden - b.orden);

  return (
    <article
      className="overflow-hidden transition-colors"
      style={{ border: "1px solid var(--border)", background: "var(--bg-card)", borderLeftColor: seq.activa ? tipo.color : undefined, borderLeftWidth: seq.activa ? 2 : 1 }}
    >
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3.5">

        {/* Expand */}
        <button
          onClick={onToggleExpand}
          className="shrink-0 transition"
          style={{ color: "var(--text-muted)" }}
        >
          {expanded
            ? <ChevronDown size={14} />
            : <ChevronRight size={14} />}
        </button>

        {/* Play/Pause toggle */}
        <button
          onClick={onToggleActiva}
          title={seq.activa ? "Pausar" : "Activar"}
          className={`relative flex size-8 shrink-0 items-center justify-center rounded-full border transition ${
            seq.activa
              ? "border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20"
              : ""
          }`}
          style={seq.activa ? undefined : { borderColor: "var(--border)", background: "var(--bg-elevated)", color: "var(--text-muted)" }}
        >
          {seq.activa
            ? <Pause size={10} fill="currentColor" />
            : <Play size={10} fill="currentColor" />}
          {seq.activa && (
            <span className="absolute -right-0.5 -top-0.5 flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-green-500" />
            </span>
          )}
        </button>

        {/* Main info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-black" style={{ color: "var(--text-primary)" }}>{seq.nombre}</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${tipo.bg} ${tipo.border}`}
              style={{ color: tipo.color }}
            >
              {tipo.label}
            </span>
          </div>

          {/* Step chain preview */}
          <div className="mt-1.5 flex items-center gap-1 overflow-x-auto pb-0.5">
            {sortedPasos.map((paso, i) => {
              const canal = CANAL_META[paso.canal];
              return (
                <div key={paso.id} className="flex shrink-0 items-center gap-1">
                  {i > 0 && (
                    <div className="flex items-center gap-0.5 text-[9px]" style={{ color: "var(--text-muted)" }}>
                      <span>→</span>
                      {paso.delayHoras > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Clock size={8} />
                          {paso.delayHoras}h
                        </span>
                      )}
                    </div>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${canal.pill}`}
                  >
                    {canal.icon}
                    {canal.label}
                  </span>
                </div>
              );
            })}
            <span className="ml-1 text-[9px]" style={{ color: "var(--text-muted)" }}>
              · {seq.disparos} disparos
            </span>
          </div>
        </div>

        {/* Date + delete */}
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden font-mono text-[10px] sm:block" style={{ color: "var(--text-muted)" }}>
            {seq.createdAt}
          </span>
          <button
            onClick={onDelete}
            className="transition hover:text-red-400"
          style={{ color: "var(--text-muted)" }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded: steps detail + test send */}
      {expanded && (
        <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-surface)" }}>
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Flujo de pasos
          </p>

          <div className="relative ml-3 flex flex-col gap-0">
            {/* Vertical connector line */}
            <div className="absolute left-2.5 top-4 h-[calc(100%-2rem)] w-px" style={{ background: "var(--border)" }} />

            {sortedPasos.map((paso) => {
              const plantilla = PLANTILLAS_BUILTIN.find((p) => p.id === paso.plantillaId);
              const canal = CANAL_META[paso.canal];
              return (
                <div key={paso.id} className="relative mb-3 flex items-start gap-3 last:mb-0">
                  {/* Step dot */}
                  <div
                    className="relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-black"
                    style={{
                      borderColor: canal.color + "40",
                      background: canal.color + "15",
                      color: canal.color,
                    }}
                  >
                    {paso.orden}
                  </div>
                  <div className="flex-1 rounded px-3 py-2.5" style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${canal.pill}`}
                        >
                          {canal.icon}
                          {paso.canal}
                        </span>
                        <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                          {plantilla?.nombre ?? paso.plantillaId}
                        </span>
                      </div>
                      {paso.delayHoras > 0 && (
                        <span className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px]" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                          <Clock size={9} />
                          +{paso.delayHoras}h
                        </span>
                      )}
                    </div>
                    {plantilla && (
                      <p className="mt-1.5 line-clamp-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {plantilla.cuerpo.replace(/\n/g, " ")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <TestSendForm pasos={sortedPasos} secuenciaNombre={seq.nombre} />
        </div>
      )}
    </article>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptySequences() {
  return (
    <div className="border border-dashed py-14 text-center" style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}>
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full" style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
        <Zap size={20} style={{ color: "var(--text-muted)" }} />
      </div>
      <p className="text-sm font-black uppercase" style={{ color: "var(--text-muted)" }}>Sin secuencias</p>
      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
        Crea tu primera secuencia para automatizar comunicaciones.
      </p>
    </div>
  );
}

// ─── Test send form ───────────────────────────────────────────────────────────

function TestSendForm({ pasos, secuenciaNombre }: { pasos: Paso[]; secuenciaNombre: string }) {
  const [open, setOpen] = useState(false);
  const [pasIdx, setPasIdx] = useState(0);
  const [destinatario, setDestinatario] = useState("");
  const [vars, setVars] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const paso = pasos[pasIdx];
  const plantilla = PLANTILLAS_BUILTIN.find((p) => p.id === paso?.plantillaId);
  const variables = plantilla?.variables ?? [];

  async function handleSend() {
    if (!paso || !destinatario) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/automatizacion/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plantillaId: paso.plantillaId, canal: paso.canal, destinatario, variables: vars }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      setResult({ ok: json.ok, msg: json.ok ? "Enviado correctamente ✓" : (json.error ?? "Error al enviar") });
    } catch {
      setResult({ ok: false, msg: "Error de conexión" });
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-2 rounded px-3 py-1.5 text-[11px] font-bold transition"
        style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        <Send size={11} />
        Envío de prueba
      </button>
    );
  }

  return (
    <div className="mt-4 p-4" style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send size={12} style={{ color: "var(--text-muted)" }} />
          <p className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
            Prueba — {secuenciaNombre}
          </p>
        </div>
        <button onClick={() => { setOpen(false); setResult(null); }} style={{ color: "var(--text-muted)" }}>
          <X size={14} />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Step selector */}
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Paso</label>
          <select
            value={pasIdx}
            onChange={(e) => setPasIdx(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs focus:outline-none"
            style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
          >
            {pasos.map((p, i) => (
              <option key={p.id} value={i}>
                {p.orden}. {p.canal} — {PLANTILLAS_BUILTIN.find((pl) => pl.id === p.plantillaId)?.nombre ?? p.plantillaId}
              </option>
            ))}
          </select>
        </div>

        {/* Destinatario */}
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            {paso?.canal === "EMAIL" ? "Email destino" : "Teléfono (+código)"}
          </label>
          <input
            type={paso?.canal === "EMAIL" ? "email" : "tel"}
            value={destinatario}
            onChange={(e) => setDestinatario(e.target.value)}
            placeholder={paso?.canal === "EMAIL" ? "ejemplo@email.com" : "+58412XXXXXXX"}
            className="w-full px-3 py-2 text-xs focus:outline-none"
            style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
          />
        </div>
      </div>

      {/* Variables */}
      {variables.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {variables.map((v) => (
            <div key={v}>
              <label className="mb-1 block text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{`{{${v}}}`}</label>
              <input
                type="text"
                value={vars[v] ?? ""}
                onChange={(e) => setVars((prev) => ({ ...prev, [v]: e.target.value }))}
                placeholder={v}
                className="w-full px-2 py-1.5 text-xs focus:outline-none"
                style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Preview */}
      {plantilla && (
        <div className="mt-3 p-3" style={{ border: "1px solid var(--border)", background: "var(--bg-surface)" }}>
          <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Vista previa</p>
          <p className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {plantilla.cuerpo.replace(/\{\{(\w+)\}\}/g, (_, k: string) =>
              vars[k] ? `\u{25B6}${vars[k]}\u{25C0}` : `{{${k}}}`,
            )}
          </p>
        </div>
      )}

      {result && (
        <div className={`mt-3 flex items-center gap-2 rounded px-3 py-2 text-xs font-bold ${
          result.ok ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
        }`}>
          {result.ok ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {result.msg}
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={sending || !destinatario}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-[var(--color-gold)] py-2.5 text-xs font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Send size={12} />
        {sending ? "Enviando…" : "Enviar mensaje de prueba"}
      </button>
    </div>
  );
}

// ─── Plantilla card ───────────────────────────────────────────────────────────

function PlantillaCard({ plantilla }: { plantilla: PlantillaPreview }) {
  const [open, setOpen] = useState(false);
  const canal = CANAL_META[plantilla.canal];
  const tipo = TIPO_META[plantilla.tipo];

  return (
    <article className="overflow-hidden transition-colors" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
      <button
        className="flex w-full items-start justify-between p-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Canal badge */}
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${canal.pill}`}>
              {canal.icon}
              {plantilla.canal}
            </span>
            {/* Tipo badge */}
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${tipo.bg} ${tipo.border}`}
              style={{ color: tipo.color }}
            >
              {tipo.label}
            </span>
          </div>
          <p className="mt-2 text-sm font-black" style={{ color: "var(--text-primary)" }}>{plantilla.nombre}</p>
          {plantilla.variables.length > 0 && (
            <p className="mt-1 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
              {plantilla.variables.map((v) => `{{${v}}}`).join("  ")}
            </p>
          )}
        </div>
        <span className="ml-3 mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4" style={{ borderTop: "1px solid var(--border)" }}>
          {plantilla.asunto && (
            <div className="mb-3 mt-3">
              <p className="mb-1 text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Asunto</p>
              <p className="rounded px-3 py-2 font-mono text-xs" style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                {plantilla.asunto}
              </p>
            </div>
          )}
          <div className={plantilla.asunto ? "" : "mt-3"}>
            <p className="mb-1 text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Cuerpo</p>
            <pre className="whitespace-pre-wrap rounded px-3 py-3 font-mono text-[11px] leading-relaxed" style={{ border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
              {plantilla.cuerpo}
            </pre>
          </div>
          <p className="mt-2.5 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
            id: <span style={{ color: "var(--text-muted)" }}>{plantilla.id}</span>
          </p>
        </div>
      )}
    </article>
  );
}

// ─── Activity log ─────────────────────────────────────────────────────────────

function ActivityLog({ logs }: { logs: AutomationData["logs"] }) {
  const statusMeta = {
    ENVIADO:  { icon: <CheckCircle size={11} />, cls: "bg-green-500/10 text-green-400 border-green-500/20" },
    FALLIDO:  { icon: <XCircle size={11} />,     cls: "bg-red-500/10 text-red-400 border-red-500/20"       },
    PENDIENTE:{ icon: <Clock size={11} />,        cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  };

  if (logs.length === 0) {
    return (
      <div className="mt-5 border border-dashed py-12 text-center" style={{ borderColor: "var(--border)" }}>
        <TrendingUp size={24} className="mx-auto mb-2" style={{ color: "var(--border)" }} />
        <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Sin actividad registrada</p>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{logs.length} evento{logs.length !== 1 ? "s" : ""} recientes</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface)" }}>
              <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Canal</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Secuencia</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Destinatario</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Estado</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Hora</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const canal = CANAL_META[log.canal];
              const status = statusMeta[log.estado];
              return (
                <tr
                  key={log.id}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${canal.pill}`}>
                      {canal.icon}
                      {log.canal}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{log.secuencia}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{log.destinatario}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black ${status.cls}`}>
                      {status.icon}
                      {log.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>{log.timestamp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── New secuencia form ───────────────────────────────────────────────────────

const TIPOS: TipoSecuencia[] = [
  "LEAD_NUEVO", "COTIZACION_ENVIADA", "FACTURA_VENCIDA",
  "RECOMPRA_PROGRAMADA", "BIENVENIDA_CLIENTE", "PAGO_RECIBIDO",
];
const CANALES: CanalPaso[] = ["WHATSAPP", "EMAIL", "INTERNO"];

function NewSecuenciaForm({
  onCreated, onCancel,
}: {
  onCreated: (seq: SecuenciaRow) => void;
  onCancel: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoSecuencia>("LEAD_NUEVO");
  const [pasos, setPasos] = useState<Paso[]>([
    { id: crypto.randomUUID(), orden: 1, canal: "WHATSAPP", plantillaId: "", delayHoras: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addPaso() {
    setPasos((p) => [...p, { id: crypto.randomUUID(), orden: p.length + 1, canal: "WHATSAPP", plantillaId: "", delayHoras: 0 }]);
  }

  function removePaso(id: string) {
    setPasos((p) => p.filter((x) => x.id !== id).map((x, i) => ({ ...x, orden: i + 1 })));
  }

  function updatePaso(id: string, field: keyof Paso, value: string | number) {
    setPasos((p) => p.map((x) => x.id === id ? { ...x, [field]: value } : x));
  }

  async function handleSave() {
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    if (pasos.some((p) => !p.plantillaId)) { setError("Selecciona una plantilla para cada paso."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/automatizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, tipo, activa: true, pasos }),
      });
      const json = (await res.json()) as { id: string; createdAt: string };
      onCreated({ id: json.id ?? `tmp-${Date.now()}`, nombre, tipo, activa: true, pasos, disparos: 0, createdAt: (json.createdAt ?? new Date().toISOString()).split("T")[0] });
    } catch {
      onCreated({ id: `tmp-${Date.now()}`, nombre, tipo, activa: true, pasos, disparos: 0, createdAt: new Date().toISOString().split("T")[0] });
    } finally { setSaving(false); }
  }

  const tipoActual = TIPO_META[tipo];

  return (
    <div className="mb-5 p-5"
      style={{ border: "1px solid var(--border)", background: "var(--bg-surface)", borderLeftColor: tipoActual.color, borderLeftWidth: 2 }}>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={14} style={{ color: tipoActual.color }} />
          <p className="text-sm font-black uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>Nueva secuencia</p>
        </div>
        <button onClick={onCancel} style={{ color: "var(--text-muted)" }}><X size={15} /></button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Nurturing Post-Cotización"
            className="w-full px-3 py-2 text-sm focus:outline-none"
            style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Disparador</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoSecuencia)}
            className="w-full px-3 py-2 text-sm focus:outline-none"
            style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
          >
            {TIPOS.map((t) => <option key={t} value={t}>{TIPO_META[t].label}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Pasos</label>
        <div className="grid gap-2">
          {pasos.map((paso) => (
            <div key={paso.id} className="flex items-center gap-2 px-3 py-2.5" style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
              <span className="w-5 shrink-0 text-center font-mono text-[10px] font-black" style={{ color: "var(--text-muted)" }}>{paso.orden}</span>
              <select
                value={paso.canal}
                onChange={(e) => updatePaso(paso.id, "canal", e.target.value)}
                className="w-28 shrink-0 px-2 py-1.5 text-xs focus:outline-none"
                style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
              >
                {CANALES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={paso.plantillaId}
                onChange={(e) => updatePaso(paso.id, "plantillaId", e.target.value)}
                className="flex-1 px-2 py-1.5 text-xs focus:outline-none"
                style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
              >
                <option value="">— Plantilla —</option>
                {PLANTILLAS_BUILTIN.filter((p) => p.canal === paso.canal).map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              <div className="flex shrink-0 items-center gap-1">
                <Clock size={10} style={{ color: "var(--text-muted)" }} />
                <input
                  type="number" min={0} value={paso.delayHoras}
                  onChange={(e) => updatePaso(paso.id, "delayHoras", parseInt(e.target.value) || 0)}
                  className="w-11 px-1 py-1.5 text-center text-xs focus:outline-none"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
                />
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>h</span>
              </div>
              {pasos.length > 1 && (
                <button onClick={() => removePaso(paso.id)} className="transition hover:text-red-400" style={{ color: "var(--text-muted)" }}>
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addPaso}
          className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold transition"
          style={{ color: "var(--text-muted)" }}
        >
          <Plus size={11} /> Agregar paso
        </button>
      </div>

      {error && <p className="mt-3 text-xs font-bold text-red-400">{error}</p>}

      <div className="mt-5 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold transition"
          style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="border border-[var(--color-gold)] bg-[var(--color-gold)] px-6 py-2 text-xs font-black text-black transition hover:bg-yellow-400 disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Crear secuencia"}
        </button>
      </div>
    </div>
  );
}
