"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import type { BuilderCliente, BuilderProducto } from "@/lib/quotes";
import { cn } from "@/lib/utils";

type LineItem = {
  key: number;
  productoId: string;
  sku: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
};

type Props = {
  clientes: BuilderCliente[];
  productos: BuilderProducto[];
  isFallback: boolean;
};

const METODO_PAGO_OPTIONS = [
  { value: "", label: "— Sin especificar —" },
  { value: "ZELLE", label: "Zelle" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "CREDITO", label: "Crédito" },
  { value: "MIXTO", label: "Mixto" },
] as const;

let keyCounter = 0;

function newLine(producto?: BuilderProducto): LineItem {
  return {
    key: ++keyCounter,
    productoId: producto?.id ?? "",
    sku: producto?.sku ?? "",
    nombre: producto?.nombre ?? "",
    cantidad: 1,
    precioUnitario: producto?.precio ?? 0,
    descuento: 0,
  };
}

function defaultVencimiento() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export function InvoiceBuilder({ clientes, productos, isFallback }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [clienteId, setClienteId] = useState(() => searchParams.get("clienteId") ?? "");
  const [lines, setLines] = useState<LineItem[]>([newLine()]);
  const [descuentoGlobal, setDescuentoGlobal] = useState(0);
  const [impuesto, setImpuesto] = useState(0);
  const [metodoPago, setMetodoPago] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState(defaultVencimiento);
  const [notas, setNotas] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subtotal = lines.reduce(
    (sum, l) => sum + l.precioUnitario * l.cantidad * (1 - l.descuento / 100),
    0,
  );
  const afterDiscount = Math.max(0, subtotal - descuentoGlobal);
  const impuestoAmt = (afterDiscount * impuesto) / 100;
  const total = afterDiscount + impuestoAmt;

  function addLine() {
    setLines((prev) => [...prev, newLine()]);
  }

  function removeLine(key: number) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  function updateLine(key: number, patch: Partial<LineItem>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function selectProduct(key: number, productoId: string) {
    const p = productos.find((x) => x.id === productoId);
    if (p) {
      updateLine(key, {
        productoId: p.id,
        sku: p.sku,
        nombre: p.nombre,
        precioUnitario: p.precio,
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!clienteId) {
      setError("Selecciona un cliente.");
      return;
    }

    if (!fechaVencimiento) {
      setError("La fecha de vencimiento es requerida.");
      return;
    }

    const validLines = lines.filter((l) => l.productoId && l.cantidad > 0);
    if (!validLines.length) {
      setError("Agrega al menos un item con producto seleccionado.");
      return;
    }

    setSubmitting(true);

    const res = await fetch("/api/admin/facturas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clienteId,
        items: validLines.map((l) => ({
          productoId: l.productoId,
          cantidad: l.cantidad,
          precioUnitario: l.precioUnitario,
          descuento: l.descuento,
        })),
        descuento: descuentoGlobal,
        impuesto,
        metodoPago: metodoPago || undefined,
        fechaVencimiento,
        notas: notas.trim() || undefined,
      }),
    });

    setSubmitting(false);

    if (res.ok) {
      const data = (await res.json()) as { factura: { id: string } };
      router.push(`/admin/facturacion/${data.factura.id}`);
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setError(
        isFallback
          ? "Modo demo: conecta la base de datos para crear facturas reales."
          : (data.error ?? "No se pudo crear la factura."),
      );
    }
  }

  return (
    <form className="mt-8 grid gap-6" onSubmit={handleSubmit}>

      {/* ── Row 1: Cliente + Fechas + Método pago ─────────────────────────── */}
      <div
        className="grid gap-4 p-5 md:grid-cols-3"
        style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
      >
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
            Cliente *
          </label>
          <select
            className="mt-2 h-11 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]"
            style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
          >
            <option value="">— Seleccionar cliente —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}{c.empresa ? ` — ${c.empresa}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
            Vencimiento *
          </label>
          <input
            type="date"
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
            className="mt-2 h-11 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]"
            style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
            Método de pago
          </label>
          <select
            className="mt-2 h-11 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]"
            style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
          >
            {METODO_PAGO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
            Impuesto %
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={impuesto}
            onChange={(e) => setImpuesto(Math.max(0, Math.min(100, Number(e.target.value))))}
            className="mt-2 h-11 w-full px-3 text-sm outline-none transition focus:border-[var(--color-gold)]"
            style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
          />
        </div>
      </div>

      {/* ── Items ─────────────────────────────────────────────────────────── */}
      <div style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <p className="text-xs font-black uppercase" style={{ color: "var(--text-secondary)" }}>
            Items
          </p>
          <button
            type="button"
            onClick={addLine}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-secondary)" }}
          >
            <Plus size={13} /> Agregar item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full border-collapse text-sm">
            <thead
              className="text-xs uppercase"
              style={{ background: "var(--bg-base)", color: "var(--text-muted)" }}
            >
              <tr>
                <th className="px-4 py-2 text-left">Producto</th>
                <th className="w-24 px-4 py-2 text-right">Precio</th>
                <th className="w-24 px-4 py-2 text-center">Cant.</th>
                <th className="w-24 px-4 py-2 text-center">Dto %</th>
                <th className="w-28 px-4 py-2 text-right">Total</th>
                <th className="w-12 px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => {
                const lineTotal = line.precioUnitario * line.cantidad * (1 - line.descuento / 100);
                return (
                  <tr key={line.key} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="px-4 py-3">
                      <select
                        className="h-9 w-full px-2 text-xs outline-none transition focus:border-[var(--color-gold)]"
                        style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
                        value={line.productoId}
                        onChange={(e) => selectProduct(line.key, e.target.value)}
                      >
                        <option value="">— Producto —</option>
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>[{p.sku}] {p.nombre}</option>
                        ))}
                      </select>
                      {line.sku && (
                        <p className="mt-1 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>{line.sku}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.precioUnitario}
                        onChange={(e) => updateLine(line.key, { precioUnitario: Number(e.target.value) })}
                        className="h-9 w-full px-2 text-right font-mono text-xs outline-none transition focus:border-[var(--color-gold)]"
                        style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateLine(line.key, { cantidad: Math.max(1, line.cantidad - 1) })}
                          className="inline-flex size-7 items-center justify-center transition hover:text-[var(--text-primary)]"
                          style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-secondary)" }}
                        >
                          <Minus size={11} />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={line.cantidad}
                          onChange={(e) => updateLine(line.key, { cantidad: Math.max(1, parseInt(e.target.value) || 1) })}
                          className="h-7 w-12 text-center font-mono text-xs outline-none"
                          style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
                        />
                        <button
                          type="button"
                          onClick={() => updateLine(line.key, { cantidad: line.cantidad + 1 })}
                          className="inline-flex size-7 items-center justify-center transition hover:text-[var(--text-primary)]"
                          style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-secondary)" }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={line.descuento}
                        onChange={(e) => updateLine(line.key, { descuento: Math.min(100, Math.max(0, Number(e.target.value))) })}
                        className="h-9 w-full px-2 text-center font-mono text-xs outline-none transition focus:border-[var(--color-gold)]"
                        style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-black" style={{ color: "var(--text-primary)" }}>
                      ${lineTotal.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        disabled={lines.length <= 1}
                        onClick={() => removeLine(line.key)}
                        className={cn(
                          "inline-flex size-7 items-center justify-center transition hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]",
                          lines.length <= 1 && "pointer-events-none opacity-30",
                        )}
                        style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-muted)" }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Totals + Notes ────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-5" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <label className="block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>
            Notas (opcional)
          </label>
          <textarea
            rows={5}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="mt-2 w-full resize-none px-3 py-2 text-sm outline-none transition focus:border-[var(--color-gold)]"
            style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
            placeholder="Observaciones, condiciones de pago, datos de transferencia..."
          />
        </div>

        <div className="p-5" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Subtotal</span>
              <span className="font-mono font-black" style={{ color: "var(--text-primary)" }}>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Descuento global ($)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={descuentoGlobal}
                onChange={(e) => setDescuentoGlobal(Math.max(0, Number(e.target.value)))}
                className="h-9 w-28 px-2 text-right font-mono text-sm outline-none transition focus:border-[var(--color-gold)]"
                style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
              />
            </div>
            {impuesto > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Impuesto ({impuesto}%)</span>
                <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>${impuestoAmt.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between">
                <span className="text-base font-black uppercase" style={{ color: "var(--text-primary)" }}>Total</span>
                <span className="font-mono text-2xl font-black text-[var(--color-gold)]">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <div
          className="p-4 text-sm"
          style={{ border: "1px solid var(--color-danger)", background: "var(--bg-card)", color: "var(--color-danger)" }}
        >
          {error}
        </div>
      )}

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/facturacion")}
          className="px-5 py-2.5 text-sm font-bold transition hover:text-[var(--text-primary)]"
          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 border border-[var(--color-gold)] bg-[var(--color-gold)] px-6 py-2.5 text-sm font-black text-black transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Emitiendo…" : "Emitir factura"}
        </button>
      </div>
    </form>
  );
}
