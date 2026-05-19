import { Search } from "lucide-react";
import Link from "next/link";

import type { CatalogFilters, CatalogOptions } from "@/lib/catalog";

type CatalogFiltersProps = {
  filters: CatalogFilters;
  options: CatalogOptions;
};

export function CatalogFilters({ filters, options }: CatalogFiltersProps) {
  return (
    <form
      className="grid gap-3 p-5 md:grid-cols-5"
      style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
    >
      <SelectFilter label="Categoria" name="categoria" options={options.categorias} value={filters.categoria} />
      <SelectFilter label="Marca" name="marca" options={options.marcas} value={filters.marca} />
      <SelectFilter label="Modelo" name="modelo" options={options.modelos} value={filters.modelo} />
      <SelectFilter label="Ano" name="anio" options={options.anios.map(String)} value={filters.anio ? String(filters.anio) : undefined} />
      <SelectFilter label="Sistema" name="sistema" options={options.sistemas} value={filters.sistema} />
      <button
        className="inline-flex h-11 items-center justify-center gap-2 px-4 text-sm font-black uppercase text-black transition hover:opacity-90 md:col-span-4"
        style={{ background: "var(--color-gold)" }}
        type="submit"
      >
        <Search size={18} /> Buscar compatibles
      </button>
      <Link
        className="inline-flex h-11 items-center justify-center px-4 text-sm font-black uppercase transition"
        href="/tienda"
        style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
      >
        Limpiar
      </Link>
    </form>
  );
}

function SelectFilter({
  label,
  name,
  options,
  value,
}: {
  label: string;
  name: string;
  options: string[];
  value?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold uppercase" style={{ color: "var(--text-muted)" }}>
      {label}
      <select
        className="h-11 px-3 outline-none transition focus:ring-1"
        defaultValue={value ?? ""}
        name={name}
        style={{
          border: "1px solid var(--border)",
          background: "var(--bg-input)",
          color: "var(--text-primary)",
        }}
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
