"use client";

import { Loader2, Settings, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type MetaRow = { tipo: string; valor: number; notas?: string | null };

const FIELDS: { tipo: string; label: string; unit: "USD" | "%" | "uds"; hint: string }[] = [
  { tipo: "REVENUE_MENSUAL", label: "Revenue mensual", unit: "USD", hint: "Meta de facturación mensual" },
  { tipo: "REVENUE_ANUAL", label: "Revenue anual", unit: "USD", hint: "Meta de facturación 12 meses" },
  { tipo: "MARGEN_BRUTO_PCT", label: "Margen bruto", unit: "%", hint: "Margen mínimo aceptable" },
  { tipo: "UTILIDAD_NETA_MENSUAL", label: "Utilidad neta mensual", unit: "USD", hint: "Ganancia esperada" },
  { tipo: "GASTO_OPERATIVO_MAX", label: "Gasto operativo máximo", unit: "USD", hint: "Techo de gastos mensual" },
  { tipo: "TICKET_PROMEDIO_MIN", label: "Ticket promedio mínimo", unit: "USD", hint: "Rango bajo objetivo" },
  { tipo: "TICKET_PROMEDIO_MAX", label: "Ticket promedio máximo", unit: "USD", hint: "Rango alto objetivo" },
  { tipo: "TRANSACCIONES_MENSUAL_MIN", label: "Transacciones / mes mínimas", unit: "uds", hint: "Volumen objetivo" },
];

const inputStyle: React.CSSProperties = {
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: 6,
};

export function MetasConfigPanel({ initialMetas }: { initialMetas: MetaRow[] }) {
  const router = useRouter();
  const initialMap: Record<string, string> = {};
  for (const m of initialMetas) initialMap[m.tipo] = String(m.valor);

  const [values, setValues] = useState<Record<string, string>>(initialMap);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function field(tipo: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [tipo]: e.target.value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    const metas = FIELDS.map((f) => ({
      tipo: f.tipo,
      valor: parseFloat(values[f.tipo] ?? ""),
    })).filter((m) => Number.isFinite(m.valor) && m.valor >= 0);

    try {
      const res = await fetch("/api/admin/metas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metas }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Error al guardar");
        return;
      }
      setSuccess(true);
      setEditing(false);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
      <div
        className="flex items-center justify-between gap-2 px-5 py-3"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
      >
        <div className="flex items-center gap-2">
          <Target size={13} style={{ color: "var(--color-gold)" }} />
          <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>
            Metas financieras
          </p>
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <Settings size={10} />
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setValues(initialMap);
              }}
              className="rounded px-2 py-1 text-[10px] font-bold uppercase"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded px-3 py-1 text-[10px] font-black uppercase disabled:opacity-50"
              style={{ background: "var(--color-gold)", color: "#000" }}
            >
              {saving ? <Loader2 size={10} className="animate-spin" /> : null}
              Guardar
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2">
        {FIELDS.map((f) => {
          const currentValue = values[f.tipo] ?? "";
          return (
            <div key={f.tipo}>
              <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                {f.label}
              </label>
              {editing ? (
                <div className="flex items-center gap-2">
                  {f.unit !== "%" && f.unit !== "uds" && (
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>$</span>
                  )}
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={currentValue}
                    onChange={field(f.tipo)}
                    placeholder="0.00"
                    className="flex-1 rounded px-3 py-2 font-mono text-sm"
                    style={inputStyle}
                  />
                  {(f.unit === "%" || f.unit === "uds") && (
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>{f.unit}</span>
                  )}
                </div>
              ) : (
                <p className="font-mono text-base font-black" style={{ color: currentValue ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {currentValue
                    ? f.unit === "%"
                      ? `${parseFloat(currentValue).toFixed(1)}%`
                      : f.unit === "uds"
                        ? parseInt(currentValue, 10).toLocaleString("en-US")
                        : `$${parseFloat(currentValue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "Sin definir"}
                </p>
              )}
              <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                {f.hint}
              </p>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="px-5 pb-4 text-xs font-bold" style={{ color: "var(--color-danger)" }}>
          {error}
        </div>
      )}
      {success && (
        <div className="px-5 pb-4 text-xs font-black uppercase" style={{ color: "var(--color-success)" }}>
          ✓ Metas guardadas
        </div>
      )}
    </section>
  );
}
