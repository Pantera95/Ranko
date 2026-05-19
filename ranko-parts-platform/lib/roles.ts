export const ROLES_EQUIPO = [
  "MASTER_ADMIN",
  "ADMIN",
  "VENDEDOR",
  "ALMACEN",
  "VIEWER",
] as const;

export type RolEquipo = (typeof ROLES_EQUIPO)[number];
export type RolUsuarioApp = RolEquipo | "CLIENTE";

export const PERMISOS_ROL: Record<RolEquipo, { descripcion: string; puede: string[] }> = {
  MASTER_ADMIN: {
    descripcion: "Acceso total. Ve logs privados. Gestiona alertas de pagos anomalos.",
    puede: ["*"],
  },
  ADMIN: {
    descripcion: "Gestion operativa completa. Sin logs privados.",
    puede: [
      "clientes.*",
      "productos.*",
      "facturas.*",
      "cotizaciones.*",
      "pagos.*",
      "reportes.*",
      "inventario.*",
      "usuarios.leer",
    ],
  },
  VENDEDOR: {
    descripcion: "Solo sus clientes asignados y pipeline.",
    puede: [
      "clientes.asignados",
      "cotizaciones.crear",
      "cotizaciones.propias",
      "leads.*",
      "catalogo.leer",
      "interacciones.crear",
    ],
  },
  ALMACEN: {
    descripcion: "Gestion de inventario y despacho.",
    puede: ["inventario.*", "ordenes.despacho", "productos.leer"],
  },
  VIEWER: {
    descripcion: "Solo lectura de reportes y dashboard.",
    puede: ["reportes.leer", "dashboard.leer"],
  },
};

// ─── Rol labels & styles (safe for client components — no DB imports) ─────────

export const ROL_LABELS: Record<string, string> = {
  MASTER_ADMIN: "Master Admin",
  ADMIN: "Admin",
  VENDEDOR: "Vendedor",
  ALMACEN: "Almacén",
  VIEWER: "Viewer",
  CLIENTE: "Cliente",
};

export const ROL_STYLES: Record<string, string> = {
  MASTER_ADMIN: "bg-[var(--color-gold)] text-black",
  ADMIN: "bg-blue-100 text-blue-700",
  VENDEDOR: "bg-green-100 text-green-700",
  ALMACEN: "bg-amber-100 text-amber-700",
  VIEWER: "bg-zinc-100 text-zinc-600",
  CLIENTE: "bg-zinc-100 text-zinc-500",
};

export function esRolEquipo(rol?: string | null): rol is RolEquipo {
  return Boolean(rol && ROLES_EQUIPO.includes(rol as RolEquipo));
}

export function tienePermiso(rol: RolUsuarioApp | undefined | null, permiso: string) {
  if (!esRolEquipo(rol)) return false;

  const permisos = PERMISOS_ROL[rol].puede;
  return (
    permisos.includes("*") ||
    permisos.includes(permiso) ||
    permisos.some((item) => item.endsWith(".*") && permiso.startsWith(item.replace(".*", ".")))
  );
}
