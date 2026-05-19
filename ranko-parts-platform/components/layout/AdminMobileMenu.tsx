"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { ADMIN_NAV_GROUPS } from "@/lib/admin-nav";
import type { RolUsuarioApp } from "@/lib/roles";

type Props = {
  role?: RolUsuarioApp;
  name?: string | null;
  email?: string | null;
};

export function AdminMobileMenu({ role, name, email }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Hamburger button — visible on mobile only */}
      <button
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="grid size-10 shrink-0 place-items-center border transition lg:hidden"
        style={{
          background: "var(--bg-input)",
          borderColor: "var(--border)",
          color: "var(--text-secondary)",
        }}
        onClick={() => setOpen(!open)}
        type="button"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col transition-transform duration-200 lg:hidden"
        style={{
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <Link
              href="/admin"
              className="font-mono text-xl font-black uppercase"
              style={{ color: "var(--text-primary)" }}
              onClick={() => setOpen(false)}
            >
              Ranko <span style={{ color: "var(--color-gold)" }}>Parts</span>
            </Link>
            <p className="mt-0.5 text-xs uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
              Enterprise SaaS
            </p>
          </div>
          <button
            aria-label="Cerrar menú"
            className="grid size-9 place-items-center border"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            onClick={() => setOpen(false)}
            type="button"
          >
            <X size={16} />
          </button>
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
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-bold transition-all"
                        style={{
                          color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                          borderLeftColor: isActive ? "var(--color-gold)" : "transparent",
                          background: isActive ? "var(--bg-elevated)" : "transparent",
                        }}
                        onClick={() => setOpen(false)}
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
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
          >
            <p className="truncate text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {name ?? "Usuario Ranko"}
            </p>
            <p className="mt-1 truncate text-xs" style={{ color: "var(--text-muted)" }}>{email}</p>
            <p className="mt-2 font-mono text-xs font-black uppercase" style={{ color: "var(--color-gold)" }}>
              {role}
            </p>
            <LogoutButton />
          </div>
        </div>
      </div>
    </>
  );
}
