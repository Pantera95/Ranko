"use client";

import { AlertTriangle, Bell, Check, CreditCard, Package, TrendingDown, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type AlertaNotif = {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  prioridad: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
  createdAt: string;
};

const PRIORIDAD_COLORS: Record<string, string> = {
  CRITICA: "var(--color-danger)",
  ALTA: "#f97316",
  MEDIA: "#eab308",
  BAJA: "var(--text-muted)",
};

const TIPO_ICONS: Record<string, React.ReactNode> = {
  PAGO_ANOMALO: <CreditCard size={13} />,
  FACTURA_VENCIDA: <AlertTriangle size={13} />,
  DEUDA_CRITICA: <TrendingDown size={13} />,
  STOCK_BAJO_MINIMO: <Package size={13} />,
  META_EN_RIESGO: <AlertTriangle size={13} />,
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "ahora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const [alertas, setAlertas] = useState<AlertaNotif[]>([]);
  const [total, setTotal] = useState(0);
  const [markingRead, setMarkingRead] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchAlertas = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/alertas");
      if (!res.ok) return;
      const data = await res.json() as { alertas: AlertaNotif[]; total: number };
      setAlertas(data.alertas ?? []);
      setTotal(data.total ?? 0);
    } catch { /* network error — silent */ }
  }, []);

  // Poll every 90 seconds
  useEffect(() => {
    fetchAlertas();
    const t = setInterval(fetchAlertas, 90_000);
    return () => clearInterval(t);
  }, [fetchAlertas]);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function markAllRead() {
    setMarkingRead(true);
    try {
      await fetch("/api/admin/alertas", { method: "PATCH" });
      setAlertas([]);
      setTotal(0);
    } finally {
      setMarkingRead(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-label={`Ver notificaciones${total > 0 ? ` (${total})` : ""}`}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-10 w-10 place-items-center border transition hover:opacity-80"
        style={{
          background: open ? "var(--bg-elevated)" : "var(--bg-input)",
          borderColor: open ? "var(--color-gold)" : "var(--border)",
          color: "var(--text-secondary)",
        }}
      >
        <Bell size={18} />
        {total > 0 && (
          <span
            className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full px-1 font-mono text-[9px] font-black text-black"
            style={{ background: "var(--color-danger)", height: "18px" }}
          >
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            className="absolute right-0 top-12 z-50 w-80"
            style={{
              border: "1px solid var(--border)",
              background: "var(--bg-surface)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <Bell size={14} style={{ color: "var(--color-gold)" }} />
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
                  Alertas
                </p>
                {total > 0 && (
                  <span
                    className="rounded px-1.5 py-0.5 font-mono text-[10px] font-black"
                    style={{ background: "var(--color-danger)", color: "#fff" }}
                  >
                    {total}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {total > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    disabled={markingRead}
                    className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase transition hover:opacity-70 disabled:opacity-40"
                    style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                  >
                    <Check size={10} /> Leído todo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded p-1 transition hover:opacity-70"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Alerts list */}
            <div className="max-h-80 overflow-y-auto">
              {alertas.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>
                    Sin alertas pendientes
                  </p>
                  <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Todo está bajo control ✓
                  </p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                  {alertas.map((a) => (
                    <div key={a.id} className="flex gap-3 px-4 py-3">
                      <div
                        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: "var(--bg-elevated)",
                          color: PRIORIDAD_COLORS[a.prioridad] ?? "var(--text-muted)",
                        }}
                      >
                        {TIPO_ICONS[a.tipo] ?? <AlertTriangle size={13} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                            {a.titulo}
                          </p>
                          <span className="shrink-0 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                            {timeAgo(a.createdAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] leading-4" style={{ color: "var(--text-muted)" }}>
                          {a.mensaje.length > 80 ? `${a.mensaje.slice(0, 80)}…` : a.mensaje}
                        </p>
                        <span
                          className="mt-1.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-black uppercase"
                          style={{
                            background: "var(--bg-elevated)",
                            color: PRIORIDAD_COLORS[a.prioridad] ?? "var(--text-muted)",
                          }}
                        >
                          {a.prioridad}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-4 py-2.5"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <a
                href="/admin/alertas"
                className="block text-center text-[10px] font-black uppercase transition hover:opacity-70"
                style={{ color: "var(--color-gold)" }}
                onClick={() => setOpen(false)}
              >
                Ver todas las alertas →
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
