import type { RolUsuario } from "@prisma/client";

import { prisma } from "@/lib/db";
import { PERMISOS_ROL } from "@/lib/roles";

export type UsuarioRow = {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  territorio: string;
  telefono: string;
  activo: boolean;
  clientesAsignados: number;
  cotizacionesCreadas: number;
  createdAt: string;
};

export type UsuariosData = {
  usuarios: UsuarioRow[];
  metrics: { label: string; value: string; helper: string }[];
  isFallback: boolean;
};

const FALLBACK: UsuarioRow[] = [
  {
    id: "demo-u1",
    nombre: "Admin Ranko",
    email: "admin@rankoparts.com",
    rol: "MASTER_ADMIN",
    territorio: "Nacional",
    telefono: "+58 414-7903498",
    activo: true,
    clientesAsignados: 0,
    cotizacionesCreadas: 3,
    createdAt: "2026-01-01",
  },
  {
    id: "demo-u2",
    nombre: "Vendedor Demo",
    email: "vendedor@rankoparts.com",
    rol: "VENDEDOR",
    territorio: "Caracas",
    telefono: "+58 412-5550001",
    activo: true,
    clientesAsignados: 2,
    cotizacionesCreadas: 1,
    createdAt: "2026-02-15",
  },
  {
    id: "demo-u3",
    nombre: "Almacén Demo",
    email: "almacen@rankoparts.com",
    rol: "ALMACEN",
    territorio: "Caracas",
    telefono: "",
    activo: true,
    clientesAsignados: 0,
    cotizacionesCreadas: 0,
    createdAt: "2026-03-01",
  },
];

export async function getUsuariosData(): Promise<UsuariosData> {
  try {
    const rows = await prisma.usuario.findMany({
      where: { rol: { not: "CLIENTE" } },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        territorio: true,
        telefono: true,
        activo: true,
        createdAt: true,
        _count: {
          select: {
            clientesAsignados: true,
            cotizacionesCreadas: true,
          },
        },
      },
      orderBy: [{ rol: "asc" }, { nombre: "asc" }],
    });

    const usuarios: UsuarioRow[] = rows.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      territorio: u.territorio ?? "",
      telefono: u.telefono ?? "",
      activo: u.activo,
      clientesAsignados: u._count.clientesAsignados,
      cotizacionesCreadas: u._count.cotizacionesCreadas,
      createdAt: u.createdAt.toISOString().slice(0, 10),
    }));

    return buildData(usuarios, false);
  } catch {
    console.warn("Usuarios fallback activo.");
    return buildData(FALLBACK, true);
  }
}

function buildData(usuarios: UsuarioRow[], isFallback: boolean): UsuariosData {
  const activos = usuarios.filter((u) => u.activo).length;
  const vendedores = usuarios.filter((u) => u.rol === "VENDEDOR").length;
  const admins = usuarios.filter((u) => u.rol === "ADMIN" || u.rol === "MASTER_ADMIN").length;

  return {
    usuarios,
    isFallback,
    metrics: [
      { label: "Usuarios activos", value: String(activos), helper: "Con acceso al sistema" },
      { label: "Admins", value: String(admins), helper: "MASTER_ADMIN + ADMIN" },
      { label: "Vendedores", value: String(vendedores), helper: "Rol VENDEDOR" },
      { label: "Total equipo", value: String(usuarios.length), helper: "Sin rol CLIENTE" },
    ],
  };
}

// ─── Rol labels ──────────────────────────────────────────────────────────────

export const ROL_LABELS: Record<RolUsuario, string> = {
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

export { PERMISOS_ROL };
