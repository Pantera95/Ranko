import {
  ArrowRight,
  ExternalLink,
  Globe,
  Package,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { EcommerceProductTable } from "@/components/admin/EcommerceProductTable";
import { getEcommerceAdminData } from "@/lib/ecommerce-admin";

const ESTADO_STYLES: Record<string, string> = {
  NUEVO: "bg-blue-100 text-blue-700",
  CALIFICANDO: "bg-indigo-100 text-indigo-700",
  COTIZADO: "bg-amber-100 text-amber-700",
  EN_NEGOCIACION: "bg-orange-100 text-orange-700",
  CIERRE_PENDIENTE: "bg-purple-100 text-purple-700",
  VENTA_CERRADA: "bg-green-100 text-green-700",
  RECOMPRA: "bg-teal-100 text-teal-700",
  PERDIDO: "bg-red-100 text-red-600",
};

const ESTADO_LABELS: Record<string, string> = {
  NUEVO: "Nuevo",
  CALIFICANDO: "Calificando",
  COTIZADO: "Cotizado",
  EN_NEGOCIACION: "Negociación",
  CIERRE_PENDIENTE: "Cierre pendiente",
  VENTA_CERRADA: "Venta cerrada",
  RECOMPRA: "Recompra",
  PERDIDO: "Perdido",
};

export default async function AdminEcommercePage() {
  const data = await getEcommerceAdminData();

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-7xl space-y-8">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono-tech text-xs" style={{ color: "var(--color-gold)" }}>
              Canal online
            </p>
            <h1 className="mt-2 font-display-kinetic--tight text-3xl uppercase leading-tight sm:text-4xl">E-Commerce</h1>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              Gestiona los productos visibles en la tienda pública y los leads que llegan desde la web.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/tienda"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase transition hover:opacity-80"
              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              <ExternalLink size={12} /> Ver tienda
            </Link>
            <Link
              href="/admin/catalogo/nuevo"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase text-black transition hover:opacity-90"
              style={{ background: "var(--color-gold)" }}
            >
              <Package size={12} /> Nuevo producto
            </Link>
          </div>
        </div>

        {/* ── Fallback notice ───────────────────────────────────────── */}
        {data.isFallback && (
          <div
            className="p-3 text-xs"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderLeft: "3px solid var(--color-gold)",
              color: "var(--text-secondary)",
            }}
          >
            Modo demo · Conecta la base de datos y ejecuta{" "}
            <code className="font-mono font-bold">npm run db:seed</code> para ver datos reales.
          </div>
        )}

        {/* ── KPI metrics ───────────────────────────────────────────── */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.metrics.map((m, i) => {
            const icons = [Package, Star, Users, ShoppingCart];
            const Icon = icons[i] ?? Package;
            return (
              <article
                key={m.label}
                className="flex items-center gap-4 p-5"
                style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
              >
                <div
                  className="flex size-10 shrink-0 items-center justify-center"
                  style={{ background: "var(--bg-elevated)", color: "var(--color-gold)" }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-mono text-2xl font-black">{m.value}</p>
                  <p className="text-[11px] font-black uppercase" style={{ color: "var(--text-muted)" }}>
                    {m.label}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.helper}</p>
                </div>
              </article>
            );
          })}
        </div>

        {/* ── Products section ──────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
                Catálogo de la tienda
              </h2>
              <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                Activa productos para mostrarlos en <code>/tienda</code> · Márcalos como Destacado para que aparezcan primero.
              </p>
            </div>
            <Link
              href="/admin/catalogo"
              className="inline-flex items-center gap-1.5 text-xs font-bold transition hover:opacity-70"
              style={{ color: "var(--color-gold)" }}
            >
              Gestionar catálogo completo <ArrowRight size={12} />
            </Link>
          </div>

          <EcommerceProductTable initialProducts={data.products} />
        </section>

        {/* ── Web leads section ─────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
                Leads desde tienda web
              </h2>
              <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                Consultas originadas en <code>/tienda</code> o <code>/b2b</code> con fuente TIENDA_WEB.
              </p>
            </div>
            <Link
              href="/admin/crm"
              className="inline-flex items-center gap-1.5 text-xs font-bold transition hover:opacity-70"
              style={{ color: "var(--color-gold)" }}
            >
              Ver CRM completo <ArrowRight size={12} />
            </Link>
          </div>

          {data.webLeads.length === 0 ? (
            <div
              className="p-8 text-center"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <TrendingUp size={28} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="font-black uppercase">Sin leads web aún</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                Cuando un cliente envíe una consulta desde la tienda, aparecerá aquí.
              </p>
            </div>
          ) : (
            <div style={{ border: "1px solid var(--border)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                    {["Cliente", "Ciudad", "Productos de interés", "Estado", "Valor est.", "Fecha", ""].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.webLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}
                    >
                      <td className="px-4 py-3">
                        <p className="font-bold">{lead.clienteNombre}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {lead.clienteTelefono}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        {lead.ciudad}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {lead.productosInteresados.slice(0, 2).map((pr) => (
                            <span
                              key={pr}
                              className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
                            >
                              {pr}
                            </span>
                          ))}
                          {lead.productosInteresados.length > 2 && (
                            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                              +{lead.productosInteresados.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${ESTADO_STYLES[lead.estado] ?? "bg-zinc-100 text-zinc-600"}`}
                        >
                          {ESTADO_LABELS[lead.estado] ?? lead.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-black">
                        {lead.valorEstimado ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                        {lead.fechaCreacion}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href="/admin/crm"
                          className="inline-flex items-center gap-1 text-[10px] font-bold transition hover:opacity-70"
                          style={{ color: "var(--color-gold)" }}
                        >
                          CRM <ArrowRight size={10} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Quick links ───────────────────────────────────────────── */}
        <section>
          <h2 className="font-mono-tech mb-4 text-xs" style={{ color: "var(--text-muted)" }}>
            Módulos relacionados
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Catálogo completo", href: "/admin/catalogo", icon: <Package size={14} />, desc: "Gestiona SKUs, precios y fotos" },
              { label: "Inventario", href: "/admin/inventario", icon: <Globe size={14} />, desc: "Stock por almacén y alertas" },
              { label: "Portal del cliente", href: "/cliente", icon: <Users size={14} />, desc: "Vista del cliente registrado" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between p-4 transition hover:opacity-80"
                style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: "var(--color-gold)" }}>{link.icon}</span>
                    <span className="text-sm font-bold">{link.label}</span>
                  </div>
                  <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>{link.desc}</p>
                </div>
                <ArrowRight size={12} style={{ color: "var(--text-muted)" }} />
              </Link>
            ))}
          </div>
        </section>

      </section>
    </main>
  );
}
