"use client";

import { Eye, EyeOff, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Rol = "ADMIN" | "VENDEDOR" | "ALMACEN" | "VIEWER";

const ROL_OPTIONS: { value: Rol; label: string; desc: string }[] = [
  { value: "ADMIN",    label: "Admin",    desc: "Gestión operativa completa" },
  { value: "VENDEDOR", label: "Vendedor", desc: "Clientes asignados y pipeline" },
  { value: "ALMACEN",  label: "Almacén",  desc: "Inventario y despacho" },
  { value: "VIEWER",   label: "Viewer",   desc: "Solo lectura de reportes" },
];

const ROL_STYLES: Record<Rol, string> = {
  ADMIN:    "bg-blue-100 text-blue-700",
  VENDEDOR: "bg-green-100 text-green-700",
  ALMACEN:  "bg-amber-100 text-amber-700",
  VIEWER:   "bg-zinc-100 text-zinc-600",
};

type FormState = {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
  territorio: string;
  telefono: string;
};

const EMPTY: FormState = {
  nombre: "", email: "", password: "",
  rol: "VENDEDOR", territorio: "", telefono: "",
};

export function NuevoUsuarioModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function close() {
    setOpen(false);
    setForm(EMPTY);
    setError("");
    setSuccess(false);
    setShowPass(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/admin/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSubmitting(false);

    if (res.ok) {
      setSuccess(true);
      router.refresh();
      setTimeout(close, 1200);
    } else {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "No se pudo crear el usuario.");
    }
  }

  const inputCls = "mt-2 h-11 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]";
  const inputStyle = {
    border: "1px solid var(--border)",
    background: "var(--bg-input)",
    color: "var(--text-primary)",
  } as React.CSSProperties;
  const labelCls = "block text-xs font-bold uppercase";
  const labelStyle = { color: "var(--text-muted)" } as React.CSSProperties;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden shrink-0 items-center gap-2 px-4 py-2.5 text-xs font-black uppercase text-black transition hover:opacity-90 sm:inline-flex"
        style={{ background: "var(--color-gold)" }}
        type="button"
      >
        <UserPlus size={14} /> Nuevo usuario
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={close}
        />
      )}

      {/* Slide-in panel */}
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto"
        style={{
          background: "var(--bg-page)",
          borderLeft: "1px solid var(--border)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s ease",
        }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--color-gold)" }}>
              Equipo
            </p>
            <h2 className="mt-0.5 text-xl font-black uppercase">Nuevo usuario</h2>
          </div>
          <button onClick={close} type="button" className="p-1 transition hover:opacity-60">
            <X size={18} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <div
              className="flex size-14 items-center justify-center rounded-full"
              style={{ background: "var(--color-success)", opacity: 0.15 }}
            />
            <p className="text-lg font-black" style={{ color: "var(--color-success)" }}>
              Usuario creado
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {form.nombre} ha sido añadido al equipo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 p-6">

            {/* Nombre + Email */}
            <div
              className="grid gap-4 p-4"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <div>
                <label className={labelCls} style={labelStyle}>Nombre completo *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={field("nombre")}
                  required
                  placeholder="Ej: Carlos Méndez"
                  className={`${inputCls} font-bold`}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={field("email")}
                  required
                  placeholder="usuario@rankoparts.com"
                  className={`${inputCls} font-mono`}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Password */}
            <div
              className="p-4"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <label className={labelCls} style={labelStyle}>Contraseña *</label>
              <div className="relative mt-2">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={field("password")}
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className="h-11 w-full px-3 pr-10 text-sm outline-none transition focus:border-[var(--color-gold)]"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition hover:opacity-60"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                El usuario podrá cambiarla desde su perfil.
              </p>
            </div>

            {/* Rol */}
            <div
              className="p-4"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <p className={labelCls} style={labelStyle}>Rol *</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {ROL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, rol: opt.value }))}
                    className="flex flex-col items-start gap-1 p-3 text-left transition"
                    style={{
                      border: `1px solid ${form.rol === opt.value ? "var(--color-gold)" : "var(--border)"}`,
                      background: form.rol === opt.value ? "var(--bg-elevated)" : "var(--bg-page)",
                    }}
                  >
                    <span className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${ROL_STYLES[opt.value]}`}>
                      {opt.label}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Territorio + Teléfono */}
            <div
              className="grid gap-4 p-4 sm:grid-cols-2"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <div>
                <label className={labelCls} style={labelStyle}>Territorio</label>
                <input
                  type="text"
                  value={form.territorio}
                  onChange={field("territorio")}
                  placeholder="Ej: Caracas"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Teléfono</label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={field("telefono")}
                  placeholder="+58 414-0000000"
                  className={`${inputCls} font-mono`}
                  style={inputStyle}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm font-bold" style={{ color: "var(--color-danger)" }}>
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-1 pb-4">
              <button
                type="button"
                onClick={close}
                className="px-5 py-2.5 text-sm font-bold transition hover:opacity-80"
                style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-black uppercase text-black transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--color-gold)" }}
              >
                <UserPlus size={14} />
                {submitting ? "Creando…" : "Crear usuario"}
              </button>
            </div>
          </form>
        )}
      </aside>
    </>
  );
}
