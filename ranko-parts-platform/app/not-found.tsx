import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main
      className="grid min-h-screen place-items-center px-6"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <div className="text-center">
        <p
          className="font-mono text-8xl font-black leading-none"
          style={{ color: "var(--color-gold)" }}
        >
          404
        </p>
        <h1 className="mt-6 text-3xl font-black uppercase">Página no encontrada</h1>
        <p className="mt-3 max-w-md text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          La ruta que buscas no existe o fue movida. Verifica la URL o navega a una sección conocida.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-black uppercase text-black transition hover:opacity-90"
            style={{ background: "var(--color-gold)" }}
          >
            <Home size={14} /> Inicio
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-black uppercase transition hover:opacity-80"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <Search size={14} /> Panel Admin
          </Link>
        </div>
        <div
          className="mx-auto mt-12 max-w-sm p-4"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          <p className="text-xs font-black uppercase" style={{ color: "var(--text-muted)" }}>
            Accesos rápidos
          </p>
          <div className="mt-3 grid gap-1.5">
            {[
              { href: "/tienda", label: "Tienda" },
              { href: "/b2b", label: "Portal B2B" },
              { href: "/cliente", label: "Portal Cliente" },
              { href: "/admin/clientes", label: "Clientes" },
              { href: "/admin/cotizaciones", label: "Cotizaciones" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between px-3 py-2 text-sm transition hover:opacity-80"
                style={{ border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
              >
                {link.label}
                <span style={{ color: "var(--color-gold)" }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
