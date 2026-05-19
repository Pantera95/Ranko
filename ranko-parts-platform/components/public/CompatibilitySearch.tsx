import { Search } from "lucide-react";

import type { CatalogOptions } from "@/lib/catalog";

type CompatibilitySearchProps = {
  options: CatalogOptions;
  variant?: "dark" | "light";
};

export function CompatibilitySearch({ options, variant = "dark" }: CompatibilitySearchProps) {
  const isDark = variant === "dark";

  return (
    <form
      action="/tienda"
      className="grid gap-3 p-5 md:grid-cols-5"
      style={{
        background: "var(--bg-card)",
        border: isDark ? "1px solid var(--color-gold)" : "1px solid var(--border)",
      }}
    >
      <SelectField label="Marca" name="marca" options={options.marcas} />
      <SelectField label="Modelo" name="modelo" options={options.modelos} />
      <SelectField label="Ano" name="anio" options={options.anios.map(String)} />
      <SelectField label="Sistema" name="sistema" options={options.sistemas} />
      <SelectField label="Categoria" name="categoria" options={options.categorias} />
      <button
        className={
          isDark
            ? "inline-flex h-12 items-center justify-center gap-2 rounded bg-[var(--color-gold)] px-5 text-sm font-black uppercase text-black md:col-span-5"
            : "inline-flex h-12 items-center justify-center gap-2 rounded bg-[var(--color-gold)] px-5 text-sm font-black uppercase text-black md:col-span-5"
        }
      >
        <Search size={18} /> Buscar repuesto compatible
      </button>
    </form>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label
      className="grid gap-2 text-sm font-bold uppercase"
      style={{ color: "var(--text-secondary)" }}
    >
      {label}
      <select
        className="h-11 rounded px-3"
        name={name}
        style={{
          background: "var(--bg-input)",
          border: "1px solid var(--border)",
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
