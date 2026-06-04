"use client";

import { KeyRound, Loader2, Shield, ToggleLeft, ToggleRight, X } from "lucide-react";
import { useState } from "react";

import type { UsuarioRow } from "@/lib/usuarios-admin";
import { ROL_LABELS, ROL_STYLES, PERMISOS_ROL } from "@/lib/roles";
import { cn } from "@/lib/utils";

const ROLES_DISPONIBLES = ["ADMIN", "VENDEDOR", "ALMACEN", "VIEWER"] as const;

export function UsersTable({ initialUsers }: { initialUsers: UsuarioRow[] }) {
  const [usuarios, setUsuarios] = useState(initialUsers);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<UsuarioRow | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);
  const [rolUpdatingId, setRolUpdatingId] = useState<string | null>(null);

  async function toggleActivo(id: string, current: boolean) {
    setUsuarios((prev) => prev.map((u) => u.id === id ? { ...u, activo: !current } : u));
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !current }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setUsuarios((prev) => prev.map((u) => u.id === id ? { ...u, activo: current } : u));
    }
  }

  async function changeRol(id: string, nuevoRol: string) {
    const prev = usuarios.find((u) => u.id === id)?.rol;
    setRolUpdatingId(id);
    setUsuarios((list) => list.map((u) => u.id === id ? { ...u, rol: nuevoRol as UsuarioRow["rol"] } : u));
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rol: nuevoRol }),
      });
      if (!res.ok) throw new Error();
    } catch {
      if (prev) {
        setUsuarios((list) => list.map((u) => u.id === id ? { ...u, rol: prev } : u));
      }
    } finally {
      setRolUpdatingId(null);
    }
  }

  function openReset(u: UsuarioRow) {
    setResetTarget(u);
    setNewPassword("");
    setResetError(null);
    setResetDone(false);
  }

  function closeReset() {
    setResetTarget(null);
    setNewPassword("");
    setResetError(null);
    setResetDone(false);
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;
    if (newPassword.length < 8) {
      setResetError("Mínimo 8 caracteres");
      return;
    }
    setResetting(true);
    setResetError(null);
    try {
      const res = await fetch(`/api/admin/usuarios/${resetTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setResetError(json.error ?? "Error al actualizar");
        return;
      }
      setResetDone(true);
    } catch {
      setResetError("Error de conexión");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="mt-4 grid gap-3">
      {usuarios.map((u) => {
        const isExpanded = expanded === u.id;
        const perms = PERMISOS_ROL[u.rol as keyof typeof PERMISOS_ROL];

        return (
          <article
            key={u.id}
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            {/* Row */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-4">
              {/* Avatar inicial */}
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full font-black uppercase"
                style={{ background: "var(--bg-elevated)", color: "var(--color-gold)" }}
              >
                {u.nombre.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-black">{u.nombre}</p>
                  <span className={cn("rounded px-2 py-0.5 text-[10px] font-black uppercase", ROL_STYLES[u.rol] ?? "bg-zinc-100 text-zinc-500")}>
                    {ROL_LABELS[u.rol] ?? u.rol}
                  </span>
                  {!u.activo && (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-black uppercase text-red-600">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                  {u.email}
                  {u.territorio ? ` · ${u.territorio}` : ""}
                </p>
              </div>

              {/* Stats */}
              <div className="hidden items-center gap-6 sm:flex">
                <div className="text-center">
                  <p className="font-mono text-lg font-black">{u.clientesAsignados}</p>
                  <p className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>Clientes</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-lg font-black">{u.cotizacionesCreadas}</p>
                  <p className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>Cotizaciones</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Role dropdown (only for non-MASTER_ADMIN rows; MASTER_ADMIN stays fixed) */}
                {u.rol !== "MASTER_ADMIN" && (
                  <div className="relative">
                    <select
                      value={u.rol}
                      onChange={(e) => changeRol(u.id, e.target.value)}
                      disabled={rolUpdatingId === u.id}
                      className="rounded px-2 py-1.5 text-xs font-bold uppercase appearance-none pr-7"
                      style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
                    >
                      {ROLES_DISPONIBLES.map((r) => (
                        <option key={r} value={r}>{ROL_LABELS[r] ?? r}</option>
                      ))}
                    </select>
                    {rolUpdatingId === u.id && (
                      <Loader2 size={11} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin" style={{ color: "var(--color-gold)" }} />
                    )}
                  </div>
                )}
                <button
                  className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition"
                  onClick={() => openReset(u)}
                  style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                  type="button"
                  title="Restablecer contraseña"
                >
                  <KeyRound size={12} /> Reset
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition"
                  onClick={() => setExpanded(isExpanded ? null : u.id)}
                  style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                  type="button"
                >
                  <Shield size={12} /> Permisos
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition"
                  onClick={() => toggleActivo(u.id, u.activo)}
                  style={{
                    border: `1px solid ${u.activo ? "var(--color-danger)" : "var(--color-success)"}`,
                    color: u.activo ? "var(--color-danger)" : "var(--color-success)",
                  }}
                  type="button"
                >
                  {u.activo ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {u.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>

            {/* Permissions panel */}
            {isExpanded && perms && (
              <div
                className="px-5 py-4"
                style={{ borderTop: "1px solid var(--border)", background: "var(--bg-elevated)" }}
              >
                <p className="text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>
                  Descripción del rol
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {perms.descripcion}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {perms.puede.map((p) => (
                    <span
                      key={p}
                      className="rounded px-2 py-0.5 font-mono text-[10px] font-bold"
                      style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        );
      })}

      {/* Password reset modal */}
      {resetTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={closeReset}
        >
          <div
            className="w-full max-w-md"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
            >
              <div className="flex items-center gap-2">
                <KeyRound size={13} style={{ color: "var(--color-gold)" }} />
                <p className="font-mono-tech text-xs" style={{ color: "var(--text-primary)" }}>
                  Restablecer contraseña
                </p>
              </div>
              <button type="button" onClick={closeReset}>
                <X size={14} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Estableciendo nueva contraseña para{" "}
                <span className="font-black" style={{ color: "var(--text-primary)" }}>{resetTarget.nombre}</span>{" "}
                <span style={{ color: "var(--text-muted)" }}>({resetTarget.email})</span>.
              </p>

              {resetDone ? (
                <div
                  className="mt-4 p-3 text-sm font-bold"
                  style={{ border: "1px solid var(--color-success)", background: "var(--bg-elevated)", color: "var(--color-success)" }}
                >
                  ✓ Contraseña actualizada. Comunícala al usuario por un canal seguro.
                </div>
              ) : (
                <form onSubmit={submitReset} className="mt-4">
                  <label className="mb-1 block text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>
                    Nueva contraseña (mín. 8 caracteres)
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                    placeholder="Mínimo 8 caracteres"
                    className="w-full rounded px-3 py-2 font-mono text-sm"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6 }}
                  />
                  {resetError && (
                    <p className="mt-2 text-xs font-bold" style={{ color: "var(--color-danger)" }}>
                      {resetError}
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      type="submit"
                      disabled={resetting}
                      className="flex items-center gap-1.5 rounded px-4 py-1.5 text-xs font-black uppercase disabled:opacity-50"
                      style={{ background: "var(--color-gold)", color: "#000" }}
                    >
                      {resetting ? <Loader2 size={11} className="animate-spin" /> : <KeyRound size={11} />}
                      Establecer
                    </button>
                    <button
                      type="button"
                      onClick={closeReset}
                      className="rounded px-4 py-1.5 text-xs font-black uppercase"
                      style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
