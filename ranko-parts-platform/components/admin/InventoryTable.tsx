"use client";

import { Check, Pencil, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import type { ClasificacionABC } from "@prisma/client";
import type { InventoryItem } from "@/lib/inventory";
import { cn } from "@/lib/utils";

type InventoryTableProps = {
  initialItems: InventoryItem[];
  isFallback: boolean;
};

type EditingState = {
  id: string;
  field: "cantidad" | "stockMinimo" | "stockMaximo" | "ubicacion" | "clasificacion";
  value: string;
};

const CLASIFICACIONES: ClasificacionABC[] = ["A", "B", "C"];

export function InventoryTable({ initialItems, isFallback }: InventoryTableProps) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<EditingState | null>(null);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.sku, item.nombre, item.marca, item.categoria, item.almacen, item.ciudad]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [items, query]);

  function startEdit(id: string, field: EditingState["field"], current: string | number | ClasificacionABC) {
    setEditing({ id, field, value: String(current) });
    setMessage("");
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function commitEdit() {
    if (!editing) return;

    const { id, field, value } = editing;
    const previousItems = items;
    let payload: Record<string, string | number>;

    if (field === "ubicacion" || field === "clasificacion") {
      payload = { [field]: value };
    } else {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0) {
        setMessage("El valor debe ser un numero entero no negativo.");
        return;
      }
      payload = { [field]: num };
    }

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "cantidad" || field === "stockMinimo" || field === "stockMaximo"
                ? parseInt(value, 10)
                : value,
              lowStock:
                field === "cantidad"
                  ? parseInt(value, 10) <= item.stockMinimo
                  : field === "stockMinimo"
                  ? item.cantidad <= parseInt(value, 10)
                  : item.lowStock,
            }
          : item,
      ),
    );
    setEditing(null);

    const response = await fetch(`/api/admin/inventario/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setItems(previousItems);
      setMessage(
        isFallback
          ? "Cambio visual solamente: conecta la base y autentica un usuario admin para persistir."
          : "No se pudo guardar el cambio de inventario.",
      );
    }
  }

  return (
    <section className="mt-8">
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
            placeholder="Buscar SKU, producto, marca, almacen o ciudad"
            style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            value={query}
          />
        </label>
        <p className="font-mono text-sm font-black" style={{ color: "var(--text-muted)" }}>
          {filteredItems.length} / {items.length} registros
        </p>
      </div>

      {message ? (
        <div className="mt-4 p-4 text-sm" style={{ border: "1px solid var(--color-gold-muted)", background: "var(--bg-card)", color: "var(--text-secondary)" }}>
          {message}
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto" style={{ border: "1px solid var(--border)" }}>
        <table className="min-w-[1080px] w-full border-collapse text-left text-sm" style={{ background: "var(--bg-card)" }}>
          <thead className="text-xs uppercase" style={{ background: "var(--bg-base)", color: "var(--text-muted)" }}>
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Almacen</th>
              <th className="px-4 py-3">Cantidad</th>
              <th className="px-4 py-3">Min / Max</th>
              <th className="px-4 py-3">Ubicacion</th>
              <th className="px-4 py-3">Clase ABC</th>
              <th className="px-4 py-3">Actualizado</th>
              <th className="px-4 py-3 text-right">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="align-middle" style={{ borderTop: "1px solid var(--border)" }}>
                <td className="px-4 py-4">
                  <p className="font-black uppercase" style={{ color: "var(--text-primary)" }}>{item.nombre}</p>
                  <p className="mt-1 font-mono text-xs text-[var(--color-gold)]">{item.sku}</p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    {item.marca} · {item.categoria}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <p className="font-bold" style={{ color: "var(--text-primary)" }}>{item.almacen}</p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{item.ciudad}</p>
                </td>

                <td className="px-4 py-4">
                  <EditableCell
                    editing={editing}
                    field="cantidad"
                    id={item.id}
                    onCancel={cancelEdit}
                    onCommit={commitEdit}
                    onEdit={(v) => startEdit(item.id, "cantidad", v)}
                    onValueChange={(v) => setEditing((prev) => (prev ? { ...prev, value: v } : null))}
                    value={item.cantidad}
                  >
                    <span
                      className={cn(
                        "font-mono text-lg font-black",
                        item.lowStock ? "text-[var(--color-danger)]" : "text-white",
                      )}
                    >
                      {item.cantidad}
                    </span>
                  </EditableCell>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <EditableCell
                      editing={editing}
                      field="stockMinimo"
                      id={item.id}
                      onCancel={cancelEdit}
                      onCommit={commitEdit}
                      onEdit={(v) => startEdit(item.id, "stockMinimo", v)}
                      onValueChange={(v) => setEditing((prev) => (prev ? { ...prev, value: v } : null))}
                      value={item.stockMinimo}
                    >
                      <span className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{item.stockMinimo}</span>
                    </EditableCell>
                    <span style={{ color: "var(--text-muted)" }}>/</span>
                    <EditableCell
                      editing={editing}
                      field="stockMaximo"
                      id={item.id}
                      onCancel={cancelEdit}
                      onCommit={commitEdit}
                      onEdit={(v) => startEdit(item.id, "stockMaximo", v)}
                      onValueChange={(v) => setEditing((prev) => (prev ? { ...prev, value: v } : null))}
                      value={item.stockMaximo}
                    >
                      <span className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{item.stockMaximo}</span>
                    </EditableCell>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <EditableCell
                    editing={editing}
                    field="ubicacion"
                    id={item.id}
                    onCancel={cancelEdit}
                    onCommit={commitEdit}
                    onEdit={(v) => startEdit(item.id, "ubicacion", v)}
                    onValueChange={(v) => setEditing((prev) => (prev ? { ...prev, value: v } : null))}
                    value={item.ubicacion}
                    type="text"
                  >
                    <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                      {item.ubicacion || <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </span>
                  </EditableCell>
                </td>

                <td className="px-4 py-4">
                  {editing?.id === item.id && editing.field === "clasificacion" ? (
                    <div className="flex items-center gap-1">
                      <select
                        autoFocus
                        className="h-8 border border-[var(--color-gold)] px-2 font-mono text-xs font-black outline-none"
                        style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
                        onChange={(e) => setEditing((prev) => (prev ? { ...prev, value: e.target.value } : null))}
                        value={editing.value}
                      >
                        {CLASIFICACIONES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <button
                        className="inline-flex size-7 items-center justify-center border border-[var(--color-success)] text-[var(--color-success)]"
                        onClick={commitEdit}
                        style={{ background: "var(--bg-base)" }}
                        type="button"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        className="inline-flex size-7 items-center justify-center"
                        onClick={cancelEdit}
                        style={{ border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-secondary)" }}
                        type="button"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      className={cn(
                        "inline-flex h-7 w-10 items-center justify-center font-mono text-xs font-black transition",
                        item.clasificacion === "A"
                          ? "border border-[var(--color-gold)] bg-[var(--color-gold)] text-black"
                          : item.clasificacion === "B"
                          ? "bg-blue-100 text-blue-700"
                          : "border",
                      )}
                      style={item.clasificacion === "C" ? { borderColor: "var(--border)", background: "var(--bg-base)", color: "var(--text-secondary)" } : undefined}
                      onClick={() => startEdit(item.id, "clasificacion", item.clasificacion)}
                      title="Cambiar clasificacion ABC"
                      type="button"
                    >
                      {item.clasificacion}
                    </button>
                  )}
                </td>

                <td className="px-4 py-4 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{item.ultimaActualizacion}</td>

                <td className="px-4 py-4 text-right">
                  <StockBadge lowStock={item.lowStock} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type EditableCellProps = {
  id: string;
  field: EditingState["field"];
  value: string | number;
  editing: EditingState | null;
  onEdit: (current: string | number) => void;
  onValueChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  children: React.ReactNode;
  type?: "number" | "text";
};

function EditableCell({
  id,
  field,
  value,
  editing,
  onEdit,
  onValueChange,
  onCommit,
  onCancel,
  children,
  type = "number",
}: EditableCellProps) {
  const isActive = editing?.id === id && editing.field === field;

  if (isActive) {
    return (
      <div className="flex items-center gap-1">
        <input
          autoFocus
          className="h-8 w-20 border border-[var(--color-gold)] px-2 font-mono text-sm outline-none"
          style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
          min={type === "number" ? 0 : undefined}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCommit();
            if (e.key === "Escape") onCancel();
          }}
          type={type}
          value={editing!.value}
        />
        <button
          className="inline-flex size-7 items-center justify-center border border-[var(--color-success)] text-[var(--color-success)]"
          onClick={onCommit}
          style={{ background: "var(--bg-base)" }}
          type="button"
        >
          <Check size={13} />
        </button>
        <button
          className="inline-flex size-7 items-center justify-center"
          onClick={onCancel}
          style={{ border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-secondary)" }}
          type="button"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <button
      className="group inline-flex items-center gap-1.5 text-left"
      onClick={() => onEdit(value)}
      title="Editar"
      type="button"
    >
      {children}
      <Pencil
        className="opacity-0 transition group-hover:opacity-100"
        style={{ color: "var(--text-muted)" }}
        size={12}
      />
    </button>
  );
}

function StockBadge({ lowStock }: { lowStock: boolean }) {
  if (lowStock) {
    return (
      <span className="inline-block rounded bg-[var(--color-danger)] px-2 py-1 text-[10px] font-black uppercase text-white">
        Bajo minimo
      </span>
    );
  }
  return (
    <span className="inline-block rounded bg-[var(--color-success)] px-2 py-1 text-[10px] font-black uppercase text-black">
      OK
    </span>
  );
}
