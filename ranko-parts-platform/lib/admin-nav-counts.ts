/**
 * Client-safe types and helpers for admin nav badges.
 *
 * NOTE: this file must NOT import anything from server-only modules (prisma,
 * `lib/db.ts`, etc.) because both `AdminSidebar` and `AdminMobileMenu` are
 * "use client" components that import from here. The fetch-from-DB helper
 * lives in the sibling `admin-nav-counts.server.ts`.
 *
 * Counts that drive sidebar badges on the admin layout. Each number maps to a
 * specific operational signal an admin should never miss:
 *
 *   - pagosPorVerificar: payments sitting in the verification queue, including
 *     client-reported payments (which always land here per design). Pulls an
 *     admin toward "/admin/pagos" to clear the queue.
 *   - facturasVencidas:  invoices past their due date with outstanding balance.
 *     Pulls toward "/admin/deudas".
 *   - alertasCriticas:   the count rendered by getAlertasData's CRITICA bucket,
 *     i.e. anomalous payments + facturas more than 90 days past due. Pulls
 *     toward "/admin/alertas".
 */
export type AdminNavCounts = {
  pagosPorVerificar: number;
  facturasVencidas: number;
  alertasCriticas: number;
};

/**
 * Resolves the badge to render next to a nav item (sidebar + mobile drawer).
 * Returns null for items that don't carry a count signal.
 */
export function badgeForNavHref(
  href: string,
  counts?: AdminNavCounts,
): { count: number; tone: "danger" | "warning" } | null {
  if (!counts) return null;
  switch (href) {
    case "/admin/pagos":
      return counts.pagosPorVerificar > 0
        ? { count: counts.pagosPorVerificar, tone: "warning" }
        : null;
    case "/admin/deudas":
      return counts.facturasVencidas > 0
        ? { count: counts.facturasVencidas, tone: "danger" }
        : null;
    case "/admin/alertas":
      return counts.alertasCriticas > 0
        ? { count: counts.alertasCriticas, tone: "danger" }
        : null;
    default:
      return null;
  }
}
