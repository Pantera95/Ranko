import { Gift, Share2, UserCheck, Users } from "lucide-react";

import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

type ReferidorRow = {
  id: string;
  nombre: string;
  empresa: string;
  codigoReferido: string;
  totalReferidos: number;
  activos: number;
  pendientes: number;
  telefono: string;
};

type ReferidoRow = {
  id: string;
  referidor: string;
  codigo: string;
  nombreReferido: string;
  empresaReferida: string;
  estado: string;
  fecha: string;
};

type ReferidosData = {
  referidores: ReferidorRow[];
  referidos: ReferidoRow[];
  metrics: { label: string; value: string; helper: string }[];
  isFallback: boolean;
};

const FALLBACK_DATA: ReferidosData = {
  referidores: [
    {
      id: "demo-c1",
      nombre: "Distribuidor Oriente",
      empresa: "Distribuidora Oriente C.A.",
      codigoReferido: "ORIENTE2026",
      totalReferidos: 2,
      activos: 1,
      pendientes: 1,
      telefono: "+58 412-5551234",
    },
  ],
  referidos: [
    {
      id: "ref-001",
      referidor: "Distribuidor Oriente",
      codigo: "ORIENTE2026",
      nombreReferido: "Taller Demo Caracas",
      empresaReferida: "Taller Demo C.A.",
      estado: "ACTIVO",
      fecha: "2026-05-10",
    },
    {
      id: "ref-002",
      referidor: "Distribuidor Oriente",
      codigo: "ORIENTE2026",
      nombreReferido: "Carlos Mendoza",
      empresaReferida: "",
      estado: "PENDIENTE",
      fecha: "2026-05-14",
    },
  ],
  metrics: [
    { label: "Clientes referidores", value: "1", helper: "Con código activo" },
    { label: "Total referidos", value: "2", helper: "Registrados en el sistema" },
    { label: "Activos", value: "1", helper: "Primer pedido realizado" },
    { label: "Pendientes", value: "1", helper: "Esperando primer pedido" },
  ],
  isFallback: true,
};

async function getReferidosData(): Promise<ReferidosData> {
  try {
    const [clientes, referidos] = await Promise.all([
      prisma.cliente.findMany({
        where: { codigoReferido: { not: null } },
        select: {
          id: true,
          nombre: true,
          empresa: true,
          codigoReferido: true,
          telefono: true,
          referidos: {
            select: { id: true, estado: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.referido.findMany({
        include: {
          clienteReferidor: { select: { nombre: true, codigoReferido: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    ]);

    const referidores: ReferidorRow[] = clientes.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      empresa: c.empresa ?? "",
      codigoReferido: c.codigoReferido!,
      totalReferidos: c.referidos.length,
      activos: c.referidos.filter((r) => r.estado === "ACTIVO").length,
      pendientes: c.referidos.filter((r) => r.estado === "PENDIENTE").length,
      telefono: c.telefono ?? "",
    }));

    const referidosRows: ReferidoRow[] = referidos.map((r) => ({
      id: r.id,
      referidor: r.clienteReferidor.nombre,
      codigo: r.codigoReferido,
      nombreReferido: r.empresaReferidaNombre,
      empresaReferida: r.empresaReferidaEmail ?? "",
      estado: r.estado,
      fecha: r.createdAt.toISOString().slice(0, 10),
    }));

    const totalActivos = referidosRows.filter((r) => r.estado === "ACTIVO").length;
    const totalPendientes = referidosRows.filter((r) => r.estado === "PENDIENTE").length;

    return {
      referidores,
      referidos: referidosRows,
      metrics: [
        { label: "Clientes referidores", value: String(referidores.length), helper: "Con código activo" },
        { label: "Total referidos", value: String(referidosRows.length), helper: "Registrados en el sistema" },
        { label: "Activos", value: String(totalActivos), helper: "Primer pedido realizado" },
        { label: "Pendientes", value: String(totalPendientes), helper: "Esperando primer pedido" },
      ],
      isFallback: false,
    };
  } catch {
    console.warn("Referidos admin fallback activo.");
    return FALLBACK_DATA;
  }
}

const ESTADO_STYLES: Record<string, string> = {
  ACTIVO: "bg-green-100 text-green-700",
  PENDIENTE: "bg-amber-100 text-amber-700",
  VENCIDO: "bg-zinc-100 text-zinc-500",
  RECHAZADO: "bg-red-100 text-red-600",
};

export default async function AdminReferidosPage() {
  const data = await getReferidosData();
  const { referidores, referidos } = data;

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-7xl">

        {/* Header */}
        <div>
          <p className="font-mono-tech text-xs" style={{ color: "var(--color-gold)" }}>
            Inteligencia
          </p>
          <h1 className="mt-2 font-display-kinetic--tight text-3xl uppercase leading-tight sm:text-4xl">Programa de referidos</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            Clientes que refieren y estado de activación de cada referido registrado.
          </p>
        </div>

        {data.isFallback && (
          <div
            className="mt-5 p-4 text-sm"
            style={{ border: "1px solid var(--border)", borderLeft: "2px solid var(--color-gold)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
          >
            Modo demo — conecta <code className="rounded px-1 font-mono" style={{ background: "var(--bg-elevated)", color: "var(--color-gold)" }}>DATABASE_URL</code> para datos reales.
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.6fr]">

          {/* Referidores */}
          <section>
            <h2 className="flex items-center gap-2 font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
              <Share2 size={13} /> Clientes referidores ({referidores.length})
            </h2>
            <div className="mt-3 grid gap-3">
              {referidores.length === 0 ? (
                <div
                  className="p-6 text-center"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
                >
                  <Users className="mx-auto" size={28} style={{ color: "var(--text-muted)" }} />
                  <p className="mt-2 text-sm font-bold uppercase" style={{ color: "var(--text-muted)" }}>Sin referidores</p>
                </div>
              ) : referidores.map((r) => (
                <article
                  key={r.id}
                  className="p-4"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-black uppercase">{r.nombre}</p>
                      {r.empresa && (
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{r.empresa}</p>
                      )}
                    </div>
                    <p
                      className="shrink-0 rounded px-3 py-1.5 font-mono text-sm font-black tracking-widest"
                      style={{ border: "1px dashed var(--border)", background: "var(--bg-elevated)" }}
                    >
                      {r.codigoReferido}
                    </p>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs">
                    <span style={{ color: "var(--text-muted)" }}>
                      Total: <strong style={{ color: "var(--text-primary)" }}>{r.totalReferidos}</strong>
                    </span>
                    <span className="text-green-700">
                      Activos: <strong>{r.activos}</strong>
                    </span>
                    <span style={{ color: r.pendientes > 0 ? "#d97706" : "var(--text-muted)" }}>
                      Pendientes: <strong>{r.pendientes}</strong>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Tabla de referidos */}
          <section>
            <h2 className="flex items-center gap-2 font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
              <UserCheck size={13} /> Todos los referidos ({referidos.length})
            </h2>
            {referidos.length === 0 ? (
              <div
                className="mt-3 p-8 text-center"
                style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
              >
                <Gift className="mx-auto" size={32} style={{ color: "var(--text-muted)" }} />
                <p className="mt-3 font-bold uppercase" style={{ color: "var(--text-muted)" }}>Sin referidos registrados</p>
              </div>
            ) : (
              <div className="mt-3 overflow-x-auto" style={{ border: "1px solid var(--border)" }}>
                <table
                  className="min-w-[560px] w-full border-collapse text-left text-sm"
                  style={{ background: "var(--bg-card)" }}
                >
                  <thead
                    className="text-xs uppercase"
                    style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                  >
                    <tr>
                      <th className="px-4 py-3">Cliente referido</th>
                      <th className="px-4 py-3">Referidor</th>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referidos.map((r) => (
                      <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                        <td className="px-4 py-3">
                          <p className="font-bold">{r.nombreReferido}</p>
                          {r.empresaReferida && (
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{r.empresaReferida}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>{r.referidor}</td>
                        <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: "var(--color-gold)" }}>{r.codigo}</td>
                        <td className="px-4 py-3">
                          <span className={cn("rounded px-2 py-0.5 text-[10px] font-black uppercase", ESTADO_STYLES[r.estado] ?? "bg-zinc-100 text-zinc-500")}>
                            {r.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{r.fecha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
