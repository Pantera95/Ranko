"use client";

import { Bell, Globe, Lock, Package, Settings, ShoppingCart, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "ranko_feature_flags";

type Flag = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  locked?: boolean;
};

type Section = {
  icon: React.ReactNode;
  title: string;
  flags: Flag[];
};

const INITIAL_SECTIONS: Section[] = [
  {
    icon: <ShoppingCart size={14} />,
    title: "E-Commerce",
    flags: [
      { id: "ecommerce_enabled", label: "Portal de ventas en línea", description: "Habilita el catálogo público y el carrito de compras.", enabled: false },
      { id: "ecommerce_guest", label: "Compra como invitado", description: "Permite comprar sin crear cuenta.", enabled: false },
      { id: "ecommerce_reviews", label: "Reseñas de productos", description: "Los clientes pueden dejar valoraciones.", enabled: false },
    ],
  },
  {
    icon: <Bell size={14} />,
    title: "Notificaciones",
    flags: [
      { id: "notif_whatsapp", label: "Alertas por WhatsApp", description: "Envío automático de recordatorios de cobro.", enabled: true },
      { id: "notif_email", label: "Notificaciones por correo", description: "Envío de cotizaciones y facturas por email.", enabled: true },
      { id: "notif_low_stock", label: "Alerta de stock bajo", description: "Notifica cuando el inventario cae bajo el mínimo.", enabled: true },
    ],
  },
  {
    icon: <Zap size={14} />,
    title: "Automatizaciones",
    flags: [
      { id: "auto_followup", label: "Follow-up automático de cotizaciones", description: "Envía recordatorio 3 días después de emitir una cotización.", enabled: false },
      { id: "auto_invoice", label: "Convertir cotización aprobada a factura", description: "Crea la factura automáticamente al aprobar.", enabled: false },
      { id: "auto_collect", label: "Secuencia automática de cobranza", description: "Dispara secuencia al vencer una factura.", enabled: false },
    ],
  },
  {
    icon: <Globe size={14} />,
    title: "Portal Cliente",
    flags: [
      { id: "portal_enabled", label: "Portal de clientes activo", description: "Los clientes pueden ver facturas, pedidos y cotizaciones.", enabled: true },
      { id: "portal_orders", label: "Rastreo de pedidos en línea", description: "Clientes ven el estado de sus órdenes en tiempo real.", enabled: true },
      { id: "portal_referrals", label: "Programa de referidos", description: "Permite a los clientes compartir su código y acumular crédito.", enabled: true },
    ],
  },
  {
    icon: <Package size={14} />,
    title: "Inventario",
    flags: [
      { id: "inv_reservations", label: "Reservas de inventario", description: "Reserva stock al confirmar una cotización.", enabled: false },
      { id: "inv_abc", label: "Clasificación ABC automática", description: "Recalcula la categoría ABC mensualmente.", enabled: true },
      { id: "inv_compatibility", label: "Búsqueda de compatibilidad de vehículos", description: "Activa el buscador por marca/modelo/año.", enabled: true },
    ],
  },
  {
    icon: <Lock size={14} />,
    title: "Seguridad",
    flags: [
      { id: "sec_2fa", label: "Autenticación de dos factores", description: "Requiere 2FA para acceder al panel de administración.", enabled: false },
      { id: "sec_audit", label: "Firma digital en logs", description: "Firma HMAC en cada entrada del registro de auditoría.", enabled: true, locked: true },
      { id: "sec_session", label: "Sesiones concurrentes", description: "Permite múltiples sesiones activas por usuario.", enabled: true },
    ],
  },
];

function ToggleSwitch({ enabled, onChange, locked }: { enabled: boolean; onChange: () => void; locked?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={locked}
      onClick={onChange}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed"
      style={{
        background: enabled ? "var(--color-gold)" : "var(--bg-elevated)",
        border: "1px solid var(--border)",
        opacity: locked ? 0.6 : 1,
      }}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full transition-transform"
        style={{
          background: enabled ? "#000" : "var(--text-muted)",
          transform: enabled ? "translateX(18px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}

export default function AdminConfiguracionPage() {
  const [sections, setSections] = useState<Section[]>(() => {
    if (typeof window === "undefined") return INITIAL_SECTIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return INITIAL_SECTIONS;
      const overrides: Record<string, boolean> = JSON.parse(stored);
      return INITIAL_SECTIONS.map((s) => ({
        ...s,
        flags: s.flags.map((f) =>
          f.locked ? f : { ...f, enabled: overrides[f.id] ?? f.enabled },
        ),
      }));
    } catch {
      return INITIAL_SECTIONS;
    }
  });
  const [saved, setSaved] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const overrides: Record<string, boolean> = JSON.parse(stored);
      setSections(INITIAL_SECTIONS.map((s) => ({
        ...s,
        flags: s.flags.map((f) =>
          f.locked ? f : { ...f, enabled: overrides[f.id] ?? f.enabled },
        ),
      })));
    } catch { /* ignore */ }
  }, []);

  function toggleFlag(sectionIdx: number, flagId: string) {
    setSections((prev) =>
      prev.map((s, i) =>
        i !== sectionIdx
          ? s
          : {
              ...s,
              flags: s.flags.map((f) =>
                f.id === flagId && !f.locked ? { ...f, enabled: !f.enabled } : f,
              ),
            },
      ),
    );
    setSaved(false);
  }

  function handleSave() {
    const overrides: Record<string, boolean> = {};
    sections.flatMap((s) => s.flags).forEach((f) => {
      overrides[f.id] = f.enabled;
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch { /* ignore quota errors */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const totalEnabled = sections.flatMap((s) => s.flags).filter((f) => f.enabled).length;
  const total = sections.flatMap((s) => s.flags).length;

  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-gold)" }}>
              Sistema
            </p>
            <h1 className="mt-2 text-4xl font-black uppercase">Configuración</h1>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              Activa o desactiva módulos y funcionalidades de la plataforma.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {totalEnabled}/{total} activos
            </span>
            <button
              type="button"
              onClick={handleSave}
              className="shrink-0 px-4 py-2.5 text-xs font-black uppercase text-black transition hover:opacity-90"
              style={{ background: saved ? "var(--color-success)" : "var(--color-gold)", color: saved ? "#fff" : "#000" }}
            >
              {saved ? "¡Guardado!" : "Guardar cambios"}
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div
          className="mt-6 flex items-center gap-3 p-4"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          <Settings size={14} style={{ color: "var(--color-gold)" }} />
          <div className="flex-1">
            <div className="h-1.5 w-full rounded-full" style={{ background: "var(--bg-elevated)" }}>
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${Math.round((totalEnabled / total) * 100)}%`, background: "var(--color-gold)" }}
              />
            </div>
          </div>
          <span className="font-mono text-xs font-black" style={{ color: "var(--color-gold)" }}>
            {Math.round((totalEnabled / total) * 100)}%
          </span>
        </div>

        {/* Sections */}
        <div className="mt-6 grid gap-4">
          {sections.map((section, sectionIdx) => (
            <section
              key={section.title}
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              {/* Section header */}
              <div
                className="flex items-center gap-2 px-5 py-3"
                style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}
              >
                <span style={{ color: "var(--color-gold)" }}>{section.icon}</span>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
                  {section.title}
                </p>
                <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>
                  {section.flags.filter((f) => f.enabled).length}/{section.flags.length}
                </span>
              </div>

              {/* Flags */}
              <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                {section.flags.map((flag) => (
                  <div
                    key={flag.id}
                    className="flex items-center gap-4 px-5 py-4"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                          {flag.label}
                        </p>
                        {flag.locked && (
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-black uppercase"
                            style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                          >
                            Bloqueado
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                        {flag.description}
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={flag.enabled}
                      locked={flag.locked}
                      onChange={() => toggleFlag(sectionIdx, flag.id)}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
          Los cambios entran en vigor de inmediato. Algunas funcionalidades requieren reiniciar el servidor para activarse completamente.
        </p>
      </section>
    </main>
  );
}
