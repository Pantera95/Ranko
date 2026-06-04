"use client";

import { Command, Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { SearchResultItem } from "@/app/api/admin/search/route";

type Result = {
  group: string;
  label: string;
  sub?: string;
  href: string;
};

const STATIC_RESULTS: Result[] = [
  // Pages
  { group: "Panel", label: "Dashboard", href: "/admin" },
  { group: "Ventas", label: "CRM / Pipeline", href: "/admin/crm" },
  { group: "Ventas", label: "Clientes", href: "/admin/clientes" },
  { group: "Ventas", label: "Cotizaciones", href: "/admin/cotizaciones" },
  { group: "Ventas", label: "Nueva cotización", href: "/admin/cotizaciones/nueva" },
  { group: "Ventas", label: "Facturación", href: "/admin/facturacion" },
  { group: "Ventas", label: "Nueva factura", href: "/admin/facturacion/nueva" },
  { group: "Finanzas", label: "Panel de deudas", href: "/admin/deudas" },
  { group: "Finanzas", label: "Pagos", href: "/admin/pagos" },
  { group: "Finanzas", label: "Alertas anómalas", href: "/admin/alertas" },
  { group: "Operaciones", label: "Catálogo de productos", href: "/admin/catalogo" },
  { group: "Operaciones", label: "Nuevo producto", href: "/admin/catalogo/nuevo" },
  { group: "Operaciones", label: "Inventario", href: "/admin/inventario" },
  { group: "Operaciones", label: "Órdenes de despacho", href: "/admin/ordenes" },
  { group: "Operaciones", label: "E-Commerce", href: "/admin/ecommerce" },
  { group: "Inteligencia", label: "Reportes / BI", href: "/admin/reportes" },
  { group: "Inteligencia", label: "Automatización", href: "/admin/automatizacion" },
  { group: "Inteligencia", label: "Referidos", href: "/admin/referidos" },
  { group: "Sistema", label: "Usuarios del equipo", href: "/admin/usuarios" },
  { group: "Sistema", label: "Logs de auditoría", href: "/admin/logs" },
  { group: "Sistema", label: "Configuración", href: "/admin/configuracion" },
  // Public
  { group: "Público", label: "Tienda online", href: "/tienda" },
  { group: "Público", label: "Portal del cliente", href: "/cliente" },
  { group: "Público", label: "Portal B2B", href: "/b2b" },
];

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[var(--color-gold)] text-black">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function AdminSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(-1);
  const [liveResults, setLiveResults] = useState<Result[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced live search against the DB
  const fetchLive = useCallback(async (q: string) => {
    if (q.length < 2) { setLiveResults([]); return; }
    setLiveLoading(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("search failed");
      const data = (await res.json()) as { results: SearchResultItem[] };
      setLiveResults(data.results.map((r) => ({
        group: r.group,
        label: r.label,
        sub: r.sub,
        href: r.href,
      })));
    } catch {
      setLiveResults([]);
    } finally {
      setLiveLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setLiveResults([]); setLiveLoading(false); return; }
    setLiveLoading(true);
    debounceRef.current = setTimeout(() => fetchLive(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchLive]);

  // Merge: live DB results first, then matching static nav entries (deduplicated by href)
  const staticFiltered = query.trim()
    ? STATIC_RESULTS.filter((r) =>
        [r.label, r.group, r.sub ?? ""].join(" ").toLowerCase().includes(query.toLowerCase()),
      )
    : STATIC_RESULTS.slice(0, 8);

  const liveHrefs = new Set(liveResults.map((r) => r.href));
  const filtered: Result[] = query.length >= 2
    ? [...liveResults, ...staticFiltered.filter((r) => !liveHrefs.has(r.href))]
    : staticFiltered;

  // Keyboard shortcut ⌘K / Ctrl+K + arrow nav
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" && activeIdx >= 0 && filtered[activeIdx]) {
        e.preventDefault();
        router.push(filtered[activeIdx].href);
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, activeIdx, filtered, router]);

  // Focus input when opened, reset state on close
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setActiveIdx(-1);
      setLiveResults([]);
      setLiveLoading(false);
    }
  }, [open]);

  // Click outside to close
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Reset active highlight when query changes
  useEffect(() => { setActiveIdx(-1); }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIdx < 0) return;
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  // Group results
  const groups = filtered.reduce<Record<string, Result[]>>((acc, r) => {
    (acc[r.group] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="relative hidden md:block" ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 min-w-[260px] items-center gap-2 border px-3 text-sm transition hover:opacity-80"
        style={{
          background: "var(--bg-input)",
          borderColor: "var(--border)",
          color: "var(--text-muted)",
        }}
      >
        <Search size={15} />
        <span className="flex-1 text-left">Buscar clientes, productos, cotizaciones…</span>
        <kbd
          className="hidden items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[10px] sm:inline-flex"
          style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
        >
          <Command size={9} />K
        </kbd>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            ref={containerRef}
            className="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2"
            style={{ filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.3))" }}
          >
            <div style={{ border: "1px solid var(--border)", background: "var(--bg-surface)" }}>
              {/* Search input */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                {liveLoading
                  ? <Loader2 size={16} className="animate-spin shrink-0" style={{ color: "var(--color-gold)" }} />
                  : <Search size={16} style={{ color: "var(--text-muted)" }} />
                }
                <input
                  ref={inputRef}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                  style={{ color: "var(--text-primary)" }}
                  placeholder="Buscar clientes, productos, cotizaciones…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    style={{ color: "var(--text-muted)" }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    Sin resultados para &ldquo;{query}&rdquo;
                  </p>
                ) : (() => {
                  let flatIdx = -1;
                  return Object.entries(groups).map(([group, items]) => (
                    <div key={group} className="mb-2">
                      <p
                        className="px-4 pb-1 pt-2 text-[10px] font-black uppercase tracking-widest"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {group}
                      </p>
                      {items.map((item) => {
                        flatIdx++;
                        const idx = flatIdx;
                        const isActive = idx === activeIdx;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            data-idx={idx}
                            onClick={() => setOpen(false)}
                            onMouseEnter={() => setActiveIdx(idx)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm"
                            style={{
                              color: "var(--text-primary)",
                              background: isActive ? "var(--bg-elevated)" : "transparent",
                            }}
                          >
                            <span className="flex-1 font-bold">
                              {highlight(item.label, query)}
                            </span>
                            {item.sub && (
                              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {item.sub}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>

              {/* Footer hint */}
              <div
                className="flex items-center justify-between px-4 py-2.5 text-[10px]"
                style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                <span>↑↓ navegar · Enter seleccionar</span>
                <span>Esc cerrar</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
