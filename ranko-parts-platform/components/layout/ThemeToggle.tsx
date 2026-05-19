"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  /** "icon" = solo botón cuadrado | "label" = botón + texto | "pill" = pill con modo actual */
  variant?: "icon" | "label" | "pill";
  className?: string;
}

export function ThemeToggle({ variant = "icon", className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita mismatch SSR/CSR
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="size-9" />;

  const isDark = theme === "dark";

  function toggle() {
    setTheme(isDark ? "light" : "dark");
  }

  if (variant === "pill") {
    return (
      <button
        onClick={toggle}
        title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${className}`}
        style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
      >
        {isDark ? <Moon size={12} /> : <Sun size={12} />}
        {isDark ? "Oscuro" : "Claro"}
      </button>
    );
  }

  if (variant === "label") {
    return (
      <button
        onClick={toggle}
        title={isDark ? "Modo claro" : "Modo oscuro"}
        className={`flex items-center gap-2.5 rounded px-3 py-2 text-xs font-bold transition-colors ${className}`}
        style={{ color: "var(--text-muted)" }}
      >
        {isDark
          ? <><Sun size={14} /> Modo claro</>
          : <><Moon size={14} /> Modo oscuro</>
        }
      </button>
    );
  }

  // Default: icon only
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className={`grid size-9 place-items-center transition-colors ${className}`}
      style={{ border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-muted)" }}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
