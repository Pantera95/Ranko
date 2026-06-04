"use client";

import { Loader2, Pencil, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initial: {
    whatsapp: string;
    email: string;
    ciudad: string;
    direccion: string;
  };
};

const inputStyle: React.CSSProperties = {
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: 6,
};

export function EditarContactoForm({ initial }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function field(key: keyof typeof initial) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function cancel() {
    setForm(initial);
    setEditing(false);
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/cliente/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "No se pudo actualizar");
        return;
      }
      setSuccess(true);
      setEditing(false);
      // Refresh the server component so the read-only rows reflect new data
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-end gap-2 px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
        {success && (
          <span className="text-xs font-bold" style={{ color: "var(--color-success)" }}>
            ✓ Datos actualizados
          </span>
        )}
        <button
          type="button"
          onClick={() => { setEditing(true); setSuccess(false); }}
          className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold uppercase transition hover:opacity-80"
          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          <Pencil size={11} /> Editar contacto
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="px-5 py-4"
      style={{ borderTop: "1px solid var(--border)", background: "var(--bg-elevated)" }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>WhatsApp</label>
          <input
            type="tel"
            value={form.whatsapp}
            onChange={field("whatsapp")}
            placeholder="+58 412-1234567"
            className="w-full rounded px-3 py-2 font-mono text-sm"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={field("email")}
            placeholder="tu@correo.com"
            className="w-full rounded px-3 py-2 text-sm"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Ciudad</label>
          <input
            type="text"
            value={form.ciudad}
            onChange={field("ciudad")}
            placeholder="Caracas"
            className="w-full rounded px-3 py-2 text-sm"
            style={inputStyle}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Dirección</label>
          <textarea
            value={form.direccion}
            onChange={field("direccion")}
            rows={2}
            placeholder="Av. Principal, Edif. ..."
            className="w-full resize-none rounded px-3 py-2 text-sm"
            style={inputStyle}
            maxLength={500}
          />
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs font-bold" style={{ color: "var(--color-danger)" }}>{error}</p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-xs font-black uppercase disabled:opacity-50"
          style={{ background: "var(--color-gold)", color: "#000" }}
        >
          {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
          Guardar
        </button>
        <button
          type="button"
          onClick={cancel}
          className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-xs font-black uppercase"
          style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          <X size={11} /> Cancelar
        </button>
      </div>
      <p className="mt-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
        Solo puedes editar tu información de contacto. Para cambios en empresa, RIF o condiciones comerciales contacta a tu vendedor.
      </p>
    </form>
  );
}
