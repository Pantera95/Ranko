"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { ADMIN_NAV_GROUPS } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import type { RolUsuarioApp } from "@/lib/roles";


type AdminSidebarProps = {
  role?: RolUsuarioApp;
  name?: string | null;
  email?: string | null;
};

export function AdminSidebar({ role, name, email }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="hidden min-h-screen w-[260px] shrink-0 lg:flex lg:flex-col"
      style={{
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        color: "var(--text-primary)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <Link href="/admin" className="font-mono text-xl font-black uppercase" style={{ color: "var(--text-primary)" }}>
          Ranko <span style={{ color: "var(--color-gold)" }}>Parts</span>
        </Link>
        <p className="mt-1 text-xs uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
          Enterprise SaaS
        </p>
        <Link
          href="/"
          className="mt-3 flex items-center gap-1.5 text-xs font-bold uppercase transition-opacity hover:opacity-100"
          style={{ color: "var(--text-muted)", opacity: 0.7 }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-gold)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
        >
          <ChevronLeft size={13} />
          Volver al inicio
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p
              className="px-3 text-[11px] font-black uppercase tracking-[0.18em]"
              style={{ color: "var(--text-muted)" }}
            >
              {group.label}
            </p>
            <div className="mt-2 grid gap-0.5">
              {group.items
                .filter((item) => !item.roles || (role && item.roles.includes(role)))
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-sm border-l-2 border-transparent px-3 py-2 text-sm font-bold transition-all",
                      )}
                      style={{
                        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                        borderLeftColor: isActive ? "var(--color-gold)" : "transparent",
                        background: isActive ? "var(--bg-elevated)" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                          (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                        }
                      }}
                    >
                      <Icon
                        size={17}
                        style={{ color: isActive ? "var(--color-gold)" : "inherit" }}
                      />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div
          className="rounded p-3"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
          }}
        >
          <p className="truncate text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            {name ?? "Usuario Ranko"}
          </p>
          <p className="mt-1 truncate text-xs" style={{ color: "var(--text-muted)" }}>
            {email}
          </p>
          <p
            className="mt-2 font-mono text-xs font-black uppercase"
            style={{ color: "var(--color-gold)" }}
          >
            {role}
          </p>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
