import { UserCog } from "lucide-react";

import { NuevoUsuarioModal } from "@/components/admin/NuevoUsuarioModal";
import { UsersTable } from "@/components/admin/UsersTable";
import { getUsuariosData } from "@/lib/usuarios-admin";

export default async function AdminUsuariosPage() {
  const data = await getUsuariosData();

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
              Sistema
            </p>
            <h1 className="mt-2 text-4xl font-black uppercase">Usuarios del equipo</h1>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              Gestión de acceso, roles y territorios del equipo Ranko Parts.
            </p>
          </div>
          <NuevoUsuarioModal />
        </div>

        {data.isFallback && (
          <div
            className="mt-5 p-4 text-sm"
            style={{ border: "1px solid var(--border)", borderLeft: "2px solid var(--color-gold)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
          >
            Modo demo — conecta{" "}
            <code className="rounded px-1 font-mono" style={{ background: "var(--bg-elevated)", color: "var(--color-gold)" }}>DATABASE_URL</code>{" "}
            para gestionar usuarios reales. Las credenciales demo son:{" "}
            <code className="font-mono" style={{ color: "var(--color-gold)" }}>admin@rankoparts.com</code>{" "}
            / <code className="font-mono" style={{ color: "var(--color-gold)" }}>RankoAdmin2026!</code>
          </div>
        )}

        {/* KPI Band */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.metrics.map((m) => (
            <article
              key={m.label}
              className="p-5"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{m.label}</p>
              <p className="mt-3 font-mono text-3xl font-black">{m.value}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{m.helper}</p>
            </article>
          ))}
        </div>

        {/* Roles legend */}
        <section
          className="mt-6 p-4"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          <p className="flex items-center gap-2 text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>
            <UserCog size={12} /> Jerarquía de roles
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(["MASTER_ADMIN", "ADMIN", "VENDEDOR", "ALMACEN", "VIEWER"] as const).map((rol) => {
              const { descripcion } = { MASTER_ADMIN: { descripcion: "Acceso total al sistema" }, ADMIN: { descripcion: "Gestión operativa completa" }, VENDEDOR: { descripcion: "Solo clientes asignados y pipeline" }, ALMACEN: { descripcion: "Inventario y despacho" }, VIEWER: { descripcion: "Solo lectura de reportes" } }[rol];
              const styles: Record<string, string> = { MASTER_ADMIN: "bg-[var(--color-gold)] text-black", ADMIN: "bg-blue-100 text-blue-700", VENDEDOR: "bg-green-100 text-green-700", ALMACEN: "bg-amber-100 text-amber-700", VIEWER: "bg-zinc-100 text-zinc-600" };
              return (
                <div key={rol} className="flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-black uppercase shrink-0 ${styles[rol]}`}>
                    {rol.replace("_", " ")}
                  </span>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{descripcion}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Users list */}
        <section className="mt-6">
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Equipo ({data.usuarios.length})
          </p>
          <UsersTable initialUsers={data.usuarios} />
        </section>
      </section>
    </main>
  );
}
