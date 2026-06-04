"use client";

import { Ban, Car, CheckCircle, ExternalLink, Globe, Search, ThermometerSun } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { CustomerRow } from "@/lib/customers";
import { cn } from "@/lib/utils";

type CustomerTableProps = {
  initialClientes: CustomerRow[];
  isFallback: boolean;
};

const TIPO_LABELS: Record<string, string> = {
  MINORISTA: "Minorista",
  TALLER: "Taller",
  DISTRIBUIDOR_LOCAL: "Dist. Local",
  DISTRIBUIDOR_REGIONAL: "Dist. Regional",
  VIP: "VIP",
};

const TEMP_COLORS: Record<string, string> = {
  CALIENTE: "text-[var(--color-danger)]",
  TIBIO: "text-[var(--color-gold)]",
  FRIO: "text-[var(--text-secondary)]",
};

export function CustomerTable({ initialClientes, isFallback }: CustomerTableProps) {
  const [clientes, setClientes] = useState(initialClientes);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter((c) =>
      [c.nombre, c.empresa, c.email, c.telefono, c.ciudad, c.rif, TIPO_LABELS[c.tipo] ?? c.tipo]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [clientes, query]);

  async function update(id: string, data: Partial<Pick<CustomerRow, "activo" | "bloqueado">>) {
    const previous = clientes;
    setClientes((curr) =>
      curr.map((c) => (c.id === id ? { ...c, ...data } : c)),
    );
    setMessage("");

    const res = await fetch(`/api/admin/clientes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      setClientes(previous);
      setMessage(
        isFallback
          ? "Cambio visual solamente: conecta la base y autentica un usuario admin para persistir."
          : "No se pudo guardar el cambio.",
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
            placeholder="Buscar nombre, empresa, email, ciudad o RIF"
            style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            value={query}
          />
        </label>
        <p className="font-mono text-sm font-black" style={{ color: "var(--text-muted)" }}>
          {filtered.length} / {clientes.length} clientes
        </p>
      </div>

      {message ? (
        <div className="mt-4 p-4 text-sm" style={{ border: "1px solid var(--color-gold-muted)", background: "var(--bg-card)", color: "var(--text-secondary)" }}>
          {message}
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto" style={{ border: "1px solid var(--border)" }}>
        <table className="min-w-[1100px] w-full border-collapse text-left text-sm" style={{ background: "var(--bg-card)" }}>
          <thead className="font-mono-tech text-xs" style={{ background: "var(--bg-base)", color: "var(--text-muted)" }}>
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Credito</th>
              <th className="px-4 py-3">Scoring</th>
              <th className="px-4 py-3">Vendedor</th>
              <th className="px-4 py-3">Vehiculos</th>
              <th className="px-4 py-3">Actividad</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="align-top"
                style={{
                  borderTop: "1px solid var(--border)",
                  ...(c.bloqueado ? { background: "color-mix(in srgb, var(--color-danger) 8%, var(--bg-card))" } : {}),
                }}
              >
                <td className="px-4 py-4">
                  <p className="font-black uppercase" style={{ color: "var(--text-primary)" }}>{c.nombre}</p>
                  {c.empresa ? (
                    <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>{c.empresa}</p>
                  ) : null}
                  {c.rif ? (
                    <p className="mt-1 font-mono text-xs" style={{ color: "var(--text-muted)" }}>RIF {c.rif}</p>
                  ) : null}
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    Desde {c.createdAt}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <TipoBadge tipo={c.tipo} />
                  <div className="mt-2 flex items-center gap-1">
                    <ThermometerSun
                      className={cn("shrink-0", TEMP_COLORS[c.temperatura])}
                      size={13}
                    />
                    <span className={cn("text-xs font-bold", TEMP_COLORS[c.temperatura])}>
                      {c.temperatura.charAt(0) + c.temperatura.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    {c.fuente.charAt(0) + c.fuente.slice(1).toLowerCase()}
                  </p>
                  {c.portalActivo ? (
                    <div className="mt-2 flex items-center gap-1">
                      <Globe size={10} style={{ color: "var(--color-success)" }} />
                      <span className="text-[10px] font-bold uppercase" style={{ color: "var(--color-success)" }}>
                        Portal
                      </span>
                    </div>
                  ) : null}
                </td>

                <td className="px-4 py-4">
                  <p className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{c.telefono}</p>
                  {c.email ? (
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{c.email}</p>
                  ) : null}
                  {c.ciudad ? (
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{c.ciudad}</p>
                  ) : null}
                </td>

                <td className="px-4 py-4">
                  <p className="font-mono text-sm font-black" style={{ color: "var(--text-primary)" }}>
                    {c.limiteCredito}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{c.condicionPago}</p>
                </td>

                <td className="px-4 py-4">
                  <ScoreBar score={c.scoring} />
                </td>

                <td className="px-4 py-4 text-sm" style={{ color: "var(--text-secondary)" }}>{c.vendedor}</td>

                <td className="px-4 py-4">
                  {c.vehiculos.length ? (
                    <div className="grid gap-1">
                      {c.vehiculos.slice(0, 3).map((v) => (
                        <div
                          className="flex items-center gap-1 text-xs"
                          key={v.id}
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <Car className="shrink-0" size={11} style={{ color: "var(--text-muted)" }} />
                          <span>
                            {v.marca} {v.modelo} {v.anio}
                          </span>
                        </div>
                      ))}
                      {c.vehiculos.length > 3 && (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          +{c.vehiculos.length - 3} mas
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Sin vehiculos</span>
                  )}
                </td>

                <td className="px-4 py-4">
                  <p className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                    {c.totalLeads} lead{c.totalLeads !== 1 ? "s" : ""}
                  </p>
                  <p className="mt-1 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                    {c.totalFacturas} factura{c.totalFacturas !== 1 ? "s" : ""}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/clientes/${c.id}`}
                      className="inline-flex size-10 items-center justify-center border transition hover:opacity-80"
                      style={{ borderColor: "var(--border)", background: "var(--bg-base)", color: "var(--color-gold)" }}
                      title="Ver ficha 360°"
                    >
                      <ExternalLink size={15} />
                    </Link>
                    <button
                      aria-label={c.bloqueado ? "Desbloquear cliente" : "Bloquear cliente"}
                      className={cn(
                        "inline-flex size-10 items-center justify-center border transition",
                        c.bloqueado
                          ? "border-[var(--color-danger)] bg-[var(--color-danger)] text-white"
                          : "hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]",
                      )}
                      style={!c.bloqueado ? { borderColor: "var(--border)", background: "var(--bg-base)", color: "var(--text-muted)" } : undefined}
                      onClick={() => update(c.id, { bloqueado: !c.bloqueado })}
                      title={c.bloqueado ? "Desbloquear cliente" : "Bloquear cliente"}
                      type="button"
                    >
                      <Ban size={16} />
                    </button>
                    <button
                      aria-label={c.activo ? "Desactivar cliente" : "Activar cliente"}
                      className={cn(
                        "inline-flex size-10 items-center justify-center border transition",
                        c.activo
                          ? "border-[var(--color-success)] text-[var(--color-success)]"
                          : "",
                      )}
                      style={{ background: "var(--bg-base)", ...(!c.activo ? { borderColor: "var(--border)", color: "var(--text-muted)" } : {}) }}
                      onClick={() => update(c.id, { activo: !c.activo })}
                      title={c.activo ? "Desactivar cliente" : "Activar cliente"}
                      type="button"
                    >
                      <CheckCircle size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TipoBadge({ tipo }: { tipo: string }) {
  const label = TIPO_LABELS[tipo] ?? tipo;
  const isB2B =
    tipo === "TALLER" || tipo === "DISTRIBUIDOR_LOCAL" || tipo === "DISTRIBUIDOR_REGIONAL";
  const isVip = tipo === "VIP";

  return (
    <span
      className={cn(
        "inline-block rounded px-2 py-1 text-[10px] font-black uppercase",
        isVip
          ? "bg-[var(--color-gold)] text-black"
          : isB2B
          ? "bg-blue-100 text-blue-700"
          : "",
      )}
      style={!isVip && !isB2B ? { background: "var(--bg-elevated)", color: "var(--text-secondary)" } : undefined}
    >
      {label}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 75
      ? "bg-[var(--color-success)]"
      : score >= 50
      ? "bg-[var(--color-gold)]"
      : "bg-[var(--color-danger)]";

  return (
    <div>
      <p className="font-mono text-sm font-black" style={{ color: "var(--text-primary)" }}>{score}</p>
      <div className="mt-2 h-1.5 w-20 rounded-full" style={{ background: "var(--bg-elevated)" }}>
        <div
          className={cn("h-1.5 rounded-full", color)}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}
