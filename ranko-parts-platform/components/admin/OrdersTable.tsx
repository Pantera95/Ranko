"use client";

import { ChevronDown, ChevronRight, ExternalLink, Package, Plus, Search, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { EstadoOrden } from "@prisma/client";
import type { HistorialEntry, OrderRow, OrdersData } from "@/lib/orders";
import { cn } from "@/lib/utils";

type OrdersTableProps = {
  initialOrders: OrderRow[];
  facturasSinOrden: OrdersData["facturasSinOrden"];
  isFallback: boolean;
};

const ESTADO_LABELS: Record<EstadoOrden, string> = {
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparacion",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const ESTADO_STYLES: Record<EstadoOrden, string> = {
  CONFIRMADO: "bg-zinc-100 text-zinc-600",
  EN_PREPARACION: "bg-blue-100 text-blue-700",
  EN_CAMINO: "bg-amber-100 text-amber-700",
  ENTREGADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-600",
};

const SIGUIENTE_LABEL: Partial<Record<EstadoOrden, string>> = {
  CONFIRMADO: "→ En preparacion",
  EN_PREPARACION: "→ En camino",
  EN_CAMINO: "→ Entregado",
};

export function OrdersTable({ initialOrders, facturasSinOrden, isFallback }: OrdersTableProps) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  // New order form
  const [showForm, setShowForm] = useState(false);
  const [newFacturaId, setNewFacturaId] = useState("");
  const [newDireccion, setNewDireccion] = useState("");
  const [newResponsable, setNewResponsable] = useState("");
  const [newEstimado, setNewEstimado] = useState("");
  const [creando, setCreando] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      [o.codigo, o.facturaNumero, o.cliente, o.empresa, ESTADO_LABELS[o.estado]]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [orders, query]);

  async function avanzar(id: string) {
    const previous = orders;
    const target = orders.find((o) => o.id === id);
    if (!target) return;

    const SIGUIENTE: Partial<Record<EstadoOrden, EstadoOrden>> = {
      CONFIRMADO: "EN_PREPARACION",
      EN_PREPARACION: "EN_CAMINO",
      EN_CAMINO: "ENTREGADO",
    };
    const sig = SIGUIENTE[target.estado];
    if (!sig) return;

    setOrders((curr) =>
      curr.map((o) =>
        o.id === id
          ? {
              ...o,
              estado: sig,
              historial: [
                ...o.historial,
                { estado: sig, timestamp: new Date().toISOString() } satisfies HistorialEntry,
              ],
            }
          : o,
      ),
    );
    setMessage("");

    const res = await fetch(`/api/admin/ordenes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "AVANZAR" }),
    });

    if (!res.ok) {
      setOrders(previous);
      setMessage(
        isFallback
          ? "Cambio visual solamente: conecta la base para persistir."
          : "No se pudo avanzar la orden.",
      );
    } else {
      router.refresh();
    }
  }

  async function cancelar(id: string) {
    const previous = orders;
    setOrders((curr) =>
      curr.map((o) => (o.id === id ? { ...o, estado: "CANCELADO" as EstadoOrden } : o)),
    );
    setMessage("");

    const res = await fetch(`/api/admin/ordenes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "CANCELAR" }),
    });

    if (!res.ok) {
      setOrders(previous);
      setMessage(
        isFallback
          ? "Cambio visual solamente: conecta la base para persistir."
          : "No se pudo cancelar la orden.",
      );
    } else {
      router.refresh();
    }
  }

  async function crearOrden(e: React.FormEvent) {
    e.preventDefault();
    if (!newFacturaId) return;
    setCreando(true);
    setMessage("");

    const res = await fetch("/api/admin/ordenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facturaId: newFacturaId,
        direccionEntrega: newDireccion.trim() || undefined,
        responsable: newResponsable.trim() || undefined,
        estimadoEntrega: newEstimado || undefined,
      }),
    });

    setCreando(false);

    if (res.ok) {
      setShowForm(false);
      setNewFacturaId("");
      setNewDireccion("");
      setNewResponsable("");
      setNewEstimado("");
      setMessage("Orden creada correctamente.");
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setMessage(
        isFallback
          ? "Modo demo: conecta la base para crear ordenes reales."
          : (data.error ?? "No se pudo crear la orden."),
      );
    }
  }

  return (
    <section className="mt-8">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <label className="relative block w-full sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            size={18}
            style={{ color: "var(--text-muted)" }}
          />
          <input
            className="h-11 w-full pl-10 pr-3 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--color-gold)]"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar codigo, cliente o estado"
            style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            value={query}
          />
        </label>
        <div className="flex items-center gap-3">
          <p className="font-mono text-sm font-black" style={{ color: "var(--text-muted)" }}>
            {filtered.length} / {orders.length}
          </p>
          <button
            className="inline-flex items-center gap-1.5 border border-[var(--color-gold)] bg-[var(--color-gold)] px-4 py-2 text-xs font-black text-black transition hover:bg-[var(--color-gold-hover)]"
            onClick={() => setShowForm((v) => !v)}
            type="button"
          >
            <Plus size={14} />
            Nueva orden
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm ? (
        <form
          className="p-5"
          onSubmit={crearOrden}
          style={{ border: "1px solid var(--border)", borderTop: "none", background: "var(--bg-elevated)" }}
        >
          <p className="font-mono-tech text-xs" style={{ color: "var(--text-secondary)" }}>
            Crear orden desde factura
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Factura *</label>
              <select
                className="mt-2 h-10 w-full px-3 text-xs outline-none focus:border-[var(--color-gold)]"
                style={{ border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-primary)" }}
                onChange={(e) => setNewFacturaId(e.target.value)}
                required
                value={newFacturaId}
              >
                <option value="">— Seleccionar —</option>
                {facturasSinOrden.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.numero} · {f.cliente}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Responsable</label>
              <input
                className="mt-2 h-10 w-full px-3 text-xs outline-none focus:border-[var(--color-gold)]"
                onChange={(e) => setNewResponsable(e.target.value)}
                placeholder="Nombre del despachador"
                style={{ border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-primary)" }}
                value={newResponsable}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Estimado entrega</label>
              <input
                className="mt-2 h-10 w-full px-3 text-xs outline-none focus:border-[var(--color-gold)]"
                onChange={(e) => setNewEstimado(e.target.value)}
                style={{ border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-primary)" }}
                type="date"
                value={newEstimado}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Direccion entrega</label>
              <input
                className="mt-2 h-10 w-full px-3 text-xs outline-none focus:border-[var(--color-gold)]"
                onChange={(e) => setNewDireccion(e.target.value)}
                placeholder="Calle, ciudad"
                style={{ border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-primary)" }}
                value={newDireccion}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              className="rounded border border-[var(--color-gold)] bg-[var(--color-gold)] px-5 py-2 text-xs font-black text-black transition hover:bg-[var(--color-gold-hover)] disabled:opacity-50"
              disabled={creando}
              type="submit"
            >
              {creando ? "Creando..." : "Crear orden"}
            </button>
            <button
              className="rounded px-5 py-2 text-xs font-bold transition"
              onClick={() => setShowForm(false)}
              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              type="button"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      {message ? (
        <div className="mt-4 p-4 text-sm" style={{ border: "1px solid var(--color-gold-muted)", background: "var(--bg-card)", color: "var(--text-secondary)" }}>
          {message}
        </div>
      ) : null}

      {/* Table */}
      <div className="mt-4 overflow-x-auto" style={{ border: "1px solid var(--border)" }}>
        <table className="min-w-[960px] w-full border-collapse text-left text-sm" style={{ background: "var(--bg-card)" }}>
          <thead className="font-mono-tech text-xs" style={{ background: "var(--bg-base)", color: "var(--text-muted)" }}>
            <tr>
              <th className="w-8 px-4 py-3" />
              <th className="px-4 py-3">Codigo</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Responsable</th>
              <th className="px-4 py-3">Estimado</th>
              <th className="px-4 py-3">Factura</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const isExpanded = expanded === order.id;
              const canAvanzar = order.estado in SIGUIENTE_LABEL;
              const canCancelar =
                order.estado !== "ENTREGADO" && order.estado !== "CANCELADO";

              return (
                <>
                  <tr
                    className={cn(
                      "align-middle",
                      order.estado === "CANCELADO" && "opacity-50",
                      order.estado === "ENTREGADO" && "opacity-70",
                    )}
                    style={{ borderTop: "1px solid var(--border)" }}
                    key={order.id}
                  >
                    <td className="px-4 py-3">
                      <button
                        className="transition"
                        style={{ color: "var(--text-muted)" }}
                        onClick={() => setExpanded(isExpanded ? null : order.id)}
                        type="button"
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/ordenes/${order.id}`}
                        className="inline-flex items-center gap-1.5 font-mono font-black transition hover:opacity-80"
                        style={{ color: "var(--color-gold)" }}
                      >
                        {order.codigo} <ExternalLink size={11} />
                      </Link>
                      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{order.createdAt}</p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-bold" style={{ color: "var(--text-primary)" }}>{order.cliente}</p>
                      {order.empresa ? (
                        <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{order.empresa}</p>
                      ) : null}
                      {order.direccionEntrega ? (
                        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{order.direccionEntrega}</p>
                      ) : null}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block rounded px-2 py-1 text-[10px] font-black uppercase",
                          ESTADO_STYLES[order.estado],
                        )}
                      >
                        {ESTADO_LABELS[order.estado]}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {order.responsable || <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>

                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                      {order.estimadoEntrega || <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>

                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-gold)]">
                      {order.facturaNumero}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {canAvanzar ? (
                          <button
                            className="inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-bold transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                            style={{ border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-secondary)" }}
                            onClick={() => avanzar(order.id)}
                            type="button"
                          >
                            <Package size={12} />
                            {SIGUIENTE_LABEL[order.estado]}
                          </button>
                        ) : null}
                        {canCancelar ? (
                          <button
                            className="inline-flex size-8 items-center justify-center border transition hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
                            style={{ borderColor: "var(--border)", background: "var(--bg-base)", color: "var(--text-muted)" }}
                            onClick={() => cancelar(order.id)}
                            title="Cancelar orden"
                            type="button"
                          >
                            <XCircle size={14} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>

                  {/* Historial expandible */}
                  {isExpanded ? (
                    <tr key={`${order.id}-historial`} style={{ borderTop: "1px solid var(--border)" }}>
                      <td className="px-4 py-4" colSpan={8} style={{ background: "var(--bg-elevated)" }}>
                        <p className="mb-3 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                          Historial de estados
                        </p>
                        <ol className="relative ml-3" style={{ borderLeft: "1px solid var(--border)" }}>
                          {order.historial.map((entry, idx) => (
                            <li className="mb-4 ml-5" key={idx}>
                              <span
                                className={cn(
                                  "absolute -left-2 flex size-4 items-center justify-center rounded-full",
                                  idx === order.historial.length - 1
                                    ? "bg-[var(--color-gold)]"
                                    : "bg-[var(--bg-elevated)]",
                                )}
                              />
                              <p className="font-bold" style={{ color: "var(--text-primary)" }}>
                                {ESTADO_LABELS[entry.estado]}
                              </p>
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {new Date(entry.timestamp).toLocaleString("es-VE")}
                                {entry.responsable ? ` · ${entry.responsable}` : ""}
                              </p>
                              {entry.nota ? (
                                <p className="mt-1 text-xs italic" style={{ color: "var(--text-secondary)" }}>{entry.nota}</p>
                              ) : null}
                            </li>
                          ))}
                        </ol>
                        {order.notasDespacho ? (
                          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                            Notas: {order.notasDespacho}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  ) : null}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
