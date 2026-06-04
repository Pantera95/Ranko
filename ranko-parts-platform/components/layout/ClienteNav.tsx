"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Gauge, History, Receipt, Share2, UserRound } from "lucide-react";

type NavCounts = {
  ordenesActivas: number;
  facturasPendientes: number;
  cotizacionesPendientes: number;
};

// `countKey` maps a nav entry to the counts slot (if any) that controls its
// badge. `badgeTone` follows the same convention as the portal home cards:
//   danger = money owed, warning = decision needed, neutral = informational.
const links: Array<{
  href: string;
  label: string;
  icon: typeof Gauge;
  countKey?: keyof NavCounts;
  badgeTone?: "danger" | "warning" | "neutral";
}> = [
  { href: "/cliente", label: "Resumen", icon: Gauge },
  { href: "/cliente/pedidos", label: "Pedidos", icon: History, countKey: "ordenesActivas", badgeTone: "neutral" },
  { href: "/cliente/facturas", label: "Facturas", icon: Receipt, countKey: "facturasPendientes", badgeTone: "danger" },
  { href: "/cliente/cotizaciones", label: "Cotizaciones", icon: FileText, countKey: "cotizacionesPendientes", badgeTone: "warning" },
  { href: "/cliente/perfil", label: "Perfil", icon: UserRound },
  { href: "/cliente/referidos", label: "Referidos", icon: Share2 },
];

function badgeBackground(tone: "danger" | "warning" | "neutral"): string {
  if (tone === "danger") return "var(--color-danger)";
  if (tone === "warning") return "var(--color-gold)";
  return "var(--text-muted)";
}

export function ClienteNav({ counts }: { counts?: NavCounts }) {
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
        const count = link.countKey && counts ? counts[link.countKey] : 0;
        const showBadge = count > 0;

        return (
          <Link
            key={link.href}
            href={link.href}
            className="relative inline-flex shrink-0 items-center gap-2 px-3 py-2 text-sm font-bold uppercase transition"
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
            {showBadge && link.badgeTone && (
              <span
                className="grid min-w-[18px] h-[18px] place-items-center rounded-full px-1.5 font-mono text-[10px] font-black text-white"
                style={{ background: badgeBackground(link.badgeTone) }}
                aria-label={`${count} pendientes`}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
