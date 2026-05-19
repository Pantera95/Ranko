"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Gauge, History, Receipt, Share2, UserRound } from "lucide-react";

const links = [
  { href: "/cliente", label: "Resumen", icon: Gauge },
  { href: "/cliente/pedidos", label: "Pedidos", icon: History },
  { href: "/cliente/facturas", label: "Facturas", icon: Receipt },
  { href: "/cliente/cotizaciones", label: "Cotizaciones", icon: FileText },
  { href: "/cliente/perfil", label: "Perfil", icon: UserRound },
  { href: "/cliente/referidos", label: "Referidos", icon: Share2 },
];

export function ClienteNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-6"
      style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex shrink-0 items-center gap-2 px-3 py-2 text-sm font-bold uppercase transition"
            style={{
              border: `1px solid ${isActive ? "var(--color-gold)" : "var(--border)"}`,
              color: isActive ? "var(--color-gold)" : "var(--text-secondary)",
              background: isActive ? "var(--bg-elevated)" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--text-primary)";
                el.style.color = "var(--text-primary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border)";
                el.style.color = "var(--text-secondary)";
              }
            }}
          >
            <Icon size={16} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
