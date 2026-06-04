import Link from "next/link";
import { Home, Search, Wrench } from "lucide-react";

export default function NotFound() {
  return (
    <main
      className="relative grid min-h-screen place-items-center overflow-hidden px-6"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Industrial backdrop — same language as other branded pages */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,197,24,0.05)_1px,transparent_1px),linear-gradient(rgba(245,197,24,0.05)_1px,transparent_1px)] bg-[size:48px_48px]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,197,24,0.12),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(245,197,24,0.08),transparent_60%)]"
      />

      <div className="relative text-center">
        {/* eyebrow */}
        <p className="font-mono-tech inline-flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
          <span className="block h-px w-6" style={{ background: "var(--color-gold)" }} />
          <Wrench size={12} />
          Ruta no localizada
        </p>

        {/* 404 mega — Syncopate */}
        <p
          className="font-display-kinetic--tight mt-4 text-[10rem] leading-none sm:text-[14rem]"
          style={{ color: "var(--color-gold)" }}
        >
          404
        </p>

        <h1 className="font-display-kinetic--tight mt-2 text-2xl uppercase leading-tight sm:text-3xl">
          Página no encontrada
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          La ruta que buscas no existe o fue movida. Verifica la URL o navega a una sección conocida.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-sm px-6 text-sm font-black uppercase tracking-wider text-black shadow-[0_8px_24px_-8px_rgba(245,197,24,0.5)] transition-all hover:shadow-[0_12px_32px_-8px_rgba(245,197,24,0.8)]"
            style={{ background: "var(--color-gold)" }}
          >
            <Home size={14} />
            Volver al inicio
          </Link>
          <Link
            href="/admin"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-sm px-6 text-sm font-black uppercase tracking-wider transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <Search size={14} /> Panel Admin
          </Link>
        </div>

        <div
          className="relative mx-auto mt-12 max-w-sm overflow-hidden p-5"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          {/* gold corner accent */}
          <div aria-hidden="true" className="absolute -left-px top-4 h-8 w-1" style={{ background: "var(--color-gold)" }} />
          <p className="font-mono-tech text-xs" style={{ color: "var(--text-muted)" }}>
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
                className="group flex items-center justify-between px-3 py-2 text-sm transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                style={{ border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
              >
                {link.label}
                <span className="transition-transform group-hover:translate-x-1" style={{ color: "var(--color-gold)" }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
