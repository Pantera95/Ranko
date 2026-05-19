"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";

const links = [
  { href: "/tienda", label: "Tienda" },
  { href: "/b2b", label: "B2B" },
  { href: "/referidos", label: "Referidos" },
  { href: "/cliente", label: "Portal" },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-40 backdrop-blur"
        style={{
          background: "color-mix(in srgb, var(--bg-surface) 92%, transparent)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="font-mono text-lg font-black uppercase"
            style={{ color: "var(--text-primary)" }}
            onClick={() => setOpen(false)}
          >
            Ranko <span style={{ color: "var(--color-gold)" }}>Parts</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-6 text-sm font-semibold uppercase md:flex">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative transition"
                  style={{ color: isActive ? "var(--text-primary)" : "var(--text-secondary)" }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute -bottom-[21px] left-0 h-[2px] w-full"
                      style={{ background: "var(--color-gold)" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/admin"
              className="hidden border px-3 py-2 text-xs font-bold uppercase transition sm:block"
              style={{ borderColor: "var(--color-gold)", color: "var(--color-gold)" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "var(--color-gold)";
                el.style.color = "#000";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "transparent";
                el.style.color = "var(--color-gold)";
              }}
            >
              Admin
            </Link>

            {/* Hamburger */}
            <button
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="grid size-9 place-items-center border transition md:hidden"
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
          </div>
        </nav>
      </header>

      {/* Mobile drawer — always in DOM, shown/hidden via CSS */}
      <div
        className="fixed inset-x-0 top-16 z-30 md:hidden transition-all duration-200"
        style={{
          background: "var(--bg-surface)",
          borderBottom: open ? "1px solid var(--border)" : "none",
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          transform: open ? "translateY(0)" : "translateY(-8px)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <nav className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center border-l-2 py-3 pl-4 text-sm font-bold uppercase transition"
                style={{
                  borderLeftColor: isActive ? "var(--color-gold)" : "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  background: isActive ? "var(--bg-elevated)" : "transparent",
                }}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}

          <div
            className="mt-3 border-t pt-3"
            style={{ borderColor: "var(--border)" }}
          >
            <Link
              href="/admin"
              className="flex items-center justify-center border py-2.5 text-xs font-bold uppercase"
              style={{ borderColor: "var(--color-gold)", color: "var(--color-gold)" }}
              onClick={() => setOpen(false)}
            >
              Acceso Admin
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
