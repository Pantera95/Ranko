"use client";

import { Shield, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";

import type { UsuarioRow } from "@/lib/usuarios-admin";
import { ROL_LABELS, ROL_STYLES, PERMISOS_ROL } from "@/lib/usuarios-admin";
import { cn } from "@/lib/utils";

export function UsersTable({ initialUsers }: { initialUsers: UsuarioRow[] }) {
  const [usuarios, setUsuarios] = useState(initialUsers);
  const [expanded, setExpanded] = useState<string | null>(null);

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
              <div className="flex items-center gap-2">
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
    </div>
  );
}
