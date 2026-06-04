import Link from "next/link";

import { NuevoProductoForm } from "@/components/admin/NuevoProductoForm";

export default function NuevoProductoPage() {
  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-3xl">

        <div className="flex items-center gap-3">
          <Link
            href="/admin/catalogo"
            className="text-xs font-bold uppercase tracking-widest transition hover:text-[var(--color-gold)]"
            style={{ color: "var(--text-muted)" }}
          >
            ← Catálogo
          </Link>
        </div>

        <div className="mt-4">
          <p className="font-mono-tech text-xs text-[var(--color-gold)]">
            Catálogo
          </p>
          <h1 className="mt-2 font-display-kinetic--tight text-3xl uppercase leading-tight sm:text-4xl">Nuevo producto</h1>
          <p className="mt-3 leading-7" style={{ color: "var(--text-secondary)" }}>
            Crea un nuevo SKU en el catálogo. Podrás agregar compatibilidades e inventario
            por almacén desde el detalle del producto.
          </p>
        </div>

        <NuevoProductoForm />
      </section>
    </main>
  );
}
